import React from "react";
import "../../styles/WelcomeSection.css";

const WelcomeSection = () => {
  return (
    <div className="welcome-section">
      <div className="main-header text-center">
        <div className="welcome-title">WELCOME TO "UMANG 2024"</div>
        <img src="/cover-img-3.jpg" alt="" className="welcome-img-fluid" />
        <p className="welcome-description">
          Dive into an extraordinary celebration of culture, art, and
          excitement. Join us for "UMANG 2024" — where creativity meets
          tradition, and every moment is unforgettable. Be ready for an
          experience like no other!
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
