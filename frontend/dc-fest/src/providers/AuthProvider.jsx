/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect, createContext } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";
import "../styles/LoadingDots.css"; // Make sure to import the CSS file

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [displayFlag, setDisplayFlag] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (accessToken, userData) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  useEffect(() => {
    setTimeout(() => {
      setDisplayFlag(true);
    }, 2000);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    navigate("/");
  }, [navigate]);

  const generateNewToken = useCallback(async () => {
    try {
      const response = await API.post("/auth/refresh-token", {}, { withCredentials: true });
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to generate new token:", error);
      alert("Session expired or failed to authenticate. Please log in again.");
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    if (accessToken === null) {
      generateNewToken();
    }

    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
          config.headers["email"] = `${user?.email}`;
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
          const newAccessToken = await generateNewToken();
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return API(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(requestInterceptor);
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, generateNewToken, logout, user]);

  const contextValue = {
    user,
    login,
    logout,
    accessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
    </AuthContext.Provider>
  );
};
