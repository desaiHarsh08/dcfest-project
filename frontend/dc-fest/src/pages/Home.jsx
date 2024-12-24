import Navbar from "../components/Navbar/Navbar";
import "../styles/Home.css";
import { AuthProvider } from "../providers/AuthProvider";
import HomeLayout from "../components/layout/HomeLayout";
const Home = () => {

  return (
    <AuthProvider>
      <div className="overflow-hidden vh-100">
        <Navbar />
        <div id="shared-area" className="overflow-y-auto">
          <HomeLayout />
        </div>
      </div>
    </AuthProvider>
  );
};

export default Home;
