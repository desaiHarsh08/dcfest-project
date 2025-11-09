import "../../styles/WelcomeSection.css";
import { useSelector } from "react-redux";
import { selectAcademicYearYear } from "../../app/slices/academicYearSlice";

const WelcomeSection = () => {
  const year = useSelector(selectAcademicYearYear);
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
        <div className="welcome-title">WELCOME TO UMANG {year}!</div>
        <div className="slider">
          <div className="slider-track">
            {images.map((src, index) => (
              <img
                key={`large-${index}`}
                src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}${src}`}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            ))}
            {/* Repeat the images for infinite scroll */}
            {images.map((src, index) => (
              <img
                key={`small-${index}`}
                src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}${src}`}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            ))}
          </div>
        </div>
        <p className="welcome-description">
          Dive into an extraordinary celebration of culture, art, and
          excitement. Join us for &ldquo;UMANG {year}&rdquo; — where creativity
          meets tradition, and every moment is unforgettable. Be ready for an
          experience like no other!
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
