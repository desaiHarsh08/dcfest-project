import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import "../../styles/AnimatedCarousel.css"; // Import your custom CSS for carousel styling
import WelcomeSection from "./WelcomeSection";

const items = [
  {
    imgSlug: "star-events",
    altText: "Star Events",
    category: "Star Events",
  },
  {
    imgSlug: "performing-arts",
    altText: "Performing Arts",
    category: "Performing Arts",
  },
  {
    imgSlug: "management-events",
    altText: "Management Events",
    category: "Management Events",
  },
  {
    imgSlug: "voices-in-actions",
    altText: "Voices in Action",
    category: "Voices in Action",
  },
  {
    imgSlug: "fine-arts",
    altText: "Fine Arts",
    category: "Fine Arts",
  },
  {
    imgSlug: "literary-arts",
    altText: "Literary Arts",
    category: "Literary Arts",
  },
  {
    imgSlug: "gaming-console",
    altText: "Gaming Console",
    category: "Gaming Console",
  },
  {
    imgSlug: "indoor-sports",
    altText: "Indoor Sports",
    category: "Indoor Sports",
  },
  {
    imgSlug: "outdoor-sports",
    altText: "Outdoor Sports",
    category: "Outdoor Sports",
  },
];

const AnimatedCarousel = () => {
  return (
    <>
      <WelcomeSection />
      <Carousel
        interval={3000}
        controls={true}
        indicators={true}
        fade
        wrap={true}
        style={{margin:"25px"}}
      >
        {items.map((item) => (
          <Carousel.Item key={item.imgSlug}>
            <div
              className="carousel-image h-100"
              style={{ backgroundImage: `url(/${item.imgSlug}.jpg)` }} // Set background image
            >
              <div className="carousel-overlay"></div> {/* Black overlay */}
              <Carousel.Caption className="text-center">
                <h3 className="py-2">{item.category}</h3>
              </Carousel.Caption>
              <div className="carousel-welcome">
                {/* <h1 className='text-white'>WELCOME TO "UMANG 2024"</h1> */}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
};

export default AnimatedCarousel;
