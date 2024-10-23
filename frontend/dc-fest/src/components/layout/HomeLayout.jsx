import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";

const HomeLayout = () => {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.type || user?.type === "COLLEGE_REPRESENTATIVE") {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  return <Outlet />;
};

export default HomeLayout;
