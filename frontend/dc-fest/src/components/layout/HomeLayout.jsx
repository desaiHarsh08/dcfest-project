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
    // if (user?.type == "REGISTRATION_DESK") {
    //   navigate("/home/event-desk", { replace: true });
    // }
    // if (user?.type == "ATTENDANCE_DESK") {
    //   navigate("/home/event-desk/attendance", { replace: true });
    // }
    // if (user?.type == "SCORE_SHEET_DESK") {
    //   navigate("/home/scoring-department/score-sheet", { replace: true });
    // }
    // if (user?.type == "SCORE_ENTRY_DESK") {
    //   navigate("/home/scoring-department/score-entry", { replace: true });
    // }
  }, [navigate, user]);

  return <Outlet />;
};

export default HomeLayout;
