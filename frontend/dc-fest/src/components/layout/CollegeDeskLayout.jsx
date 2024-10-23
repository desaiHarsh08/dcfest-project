import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../providers/AuthProvider";

const CollegeDeskLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default CollegeDeskLayout;
