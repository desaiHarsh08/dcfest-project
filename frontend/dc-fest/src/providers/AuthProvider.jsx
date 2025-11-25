/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect, createContext } from "react";
import { API } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/LoadingDots.css"; // Make sure to import the CSS file

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [displayFlag, setDisplayFlag] = useState(false);
  // Initialize from localStorage if available
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const login = (accessToken, userData) => {
    setAccessToken(accessToken);
    setUser(userData);
    // Store in localStorage for persistence
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  useEffect(() => {
    // For login page, set displayFlag immediately
    if (location.pathname.includes("/login")) {
      setDisplayFlag(true);
    } else {
      // For other routes, wait 2 seconds
    setTimeout(() => {
      setDisplayFlag(true);
    }, 2000);
    }
  }, [location.pathname]);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/");
  }, [navigate]);

  const generateNewToken = useCallback(async () => {
    try {
      const response = await API.post("/auth/refresh-token", {}, { withCredentials: true });
      const newAccessToken = response.data.accessToken;
      const newUser = response.data.user;
      setAccessToken(newAccessToken);
      setUser(newUser);
      // Update localStorage
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      return newAccessToken;
    } catch (error) {
      console.error("Failed to generate new token:", error);
      // Clear localStorage on failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    // Only try to refresh token if we don't have one and we're not on login page
    if (accessToken === null && !location.pathname.includes("/login")) {
      generateNewToken();
    }

    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        // Endpoints that must not receive auth headers
        const authFreeEndpoints = ["/auth/login", "/auth/register", "/auth/refresh-token", "/auth/forgot-password", "/auth/reset-password"];
        const requestUrl = config.url || "";
        const isAuthFree = authFreeEndpoints.some((endpoint) =>
          requestUrl.startsWith(endpoint) || requestUrl.includes(endpoint)
        );
        
        if (isAuthFree) {
          delete config.headers["Authorization"];
          delete config.headers["authorization"];
          delete config.headers["email"];
          delete config.headers["Email"];
          return config;
        }

        // Get the latest token from state or localStorage
        const currentToken = accessToken || localStorage.getItem("accessToken");
        // Get user from state or localStorage
        const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
        const emailOrIcCode = currentUser?.email || currentUser?.icCode || "";
        
        // Always set headers if we have the data
        if (currentToken) {
          config.headers["Authorization"] = `Bearer ${currentToken}`;
        }
        if (emailOrIcCode) {
          config.headers["email"] = emailOrIcCode;
        }
        
        // Log for debugging (remove in production)
        if (config.url?.includes("/api/users") || config.url?.includes("/api/academic-years") || config.url?.includes("/api/events")) {
          console.log("API Request Interceptor:", {
            url: config.url,
            method: config.method,
            hasToken: !!currentToken,
            hasEmail: !!emailOrIcCode,
            email: emailOrIcCode
          });
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log("401 error detected, attempting token refresh...");
          const newAccessToken = await generateNewToken();
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            // Update email header too
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emailOrIcCode = currentUser?.email || currentUser?.icCode || "";
            originalRequest.headers["email"] = emailOrIcCode;
            console.log("Token refreshed, retrying request...");
            return API(originalRequest);
          } else {
            console.error("Token refresh failed, redirecting to login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(requestInterceptor);
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, generateNewToken, logout, user]); // Removed location to prevent interceptor recreation on navigation

  const contextValue = {
    user,
    login,
    logout,
    accessToken,
  };

  // Check if we're on a public route (login page)
  const isPublicRoute = location.pathname.includes("/login");

  return (
    <AuthContext.Provider value={contextValue}>
      {/* For public routes like login, always show children */}
      {isPublicRoute ? (
        children
      ) : (
        /* For protected routes, check authentication */
        <>
      {user != null && accessToken != null && displayFlag && children}
      {(!user || !accessToken || !displayFlag) && (
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
          )}
        </>
      )}
    </AuthContext.Provider>
  );
};
