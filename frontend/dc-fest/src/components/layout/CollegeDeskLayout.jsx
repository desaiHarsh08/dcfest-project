import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { useContext, useEffect } from "react";

const CollegeDeskLayout = () => {
  const { user, accessToken } = useContext(AuthContext);

  const { iccode } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    console.log(`User: ${user.icCode}, token: ${accessToken}`);
    if (user && accessToken) {
      if (user.icCode != iccode) {
        navigate("/login", { replace: true });
      }
    }
  }, [user, accessToken]);

  return <Outlet />;
};

export default CollegeDeskLayout;
