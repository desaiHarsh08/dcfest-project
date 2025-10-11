import React from "react";
import "../../styles/WelcomeSection.css";

const WelcomeSection = () => {
  const images = [
    "/E1.jpg",
    "/E2.jpg",
    "/E3.jpg",
    "/E4.jpg",
    "/E5.jpg",
    "/E6.jpg",
    "/E7.jpg",
    "/E8.jpg",
    "/E9.jpg",
  ];

  return (
    <div className="welcome-section">
      <div className="main-header text-center">
        <div className="welcome-title">WELCOME TO NEXUS 2025!</div>
        <div className="slider">
          <div className="slider-track">
            {images.map((src, index) => (
              <img
                key={`large-${index}`}
                src={src}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            ))}
            {/* Repeat the images for infinite scroll */}
            {images.map((src, index) => (
              <img
                key={`small-${index}`}
                src={src}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            ))}
          </div>
        </div>
        <p className="welcome-description">
          Dive into an extraordinary celebration of culture, art, and
          excitement. Join us for "NEXUS 2025" — where creativity meets
          tradition, and every moment is unforgettable. Be ready for an
          experience like no other!
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
