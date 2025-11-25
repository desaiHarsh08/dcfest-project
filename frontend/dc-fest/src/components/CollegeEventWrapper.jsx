import { useLocation } from "react-router-dom";
import CollegeEvent from "../pages/CollegeEvent";

const CollegeEventWrapper = () => {
  const location = useLocation();
  // Use full pathname as key to force remount on every navigation
  // This ensures the component completely resets, just like on refresh
  return <CollegeEvent key={location.pathname} />;
};

export default CollegeEventWrapper;
