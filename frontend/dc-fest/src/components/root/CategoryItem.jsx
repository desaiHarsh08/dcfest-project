import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import "../../styles/CategoryItem.css";
import { Link } from "react-router-dom";

const CategoryItem = ({ categoryItem }) => {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByAmount = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.9);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };
  // Utility function to truncate the one-liner
  const truncateText = (text, limit) => {
    if (text.length > limit) {
      return text.substring(0, limit) + "...";
    }
    return text;
  };

  return (
    <div>
      <h2 className="p-2 ms-3 mt-5 event-heading">{categoryItem.name}</h2>
      <div className="carousel-wrapper">
        {canScrollLeft && (
          <button type="button" aria-label="Scroll left" className="nav-button nav-left" onClick={() => scrollByAmount("left")}>
            ‹
          </button>
        )}
        <div className="event-list-container-horizontal" ref={containerRef}>
          {categoryItem?.availableEvents?.map((event, index) => (
            <Link to={`event/${event.slug}`} key={index} style={{ textDecoration: "none" }}>
              <Card className="event-card" style={{ minWidth: "350px", minHeight: "350px" }}>
                <Card.Img variant="top" src={`/${event.slug}.jpg`} alt={event.title} className="img-fluid event-img" />
                <Card.Body>
                  <Card.Title className="text-center event-title">{event.title}</Card.Title>
                  <Card.Text className="text-center">{truncateText(event?.oneLiner || "No description available", 100)}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
        {canScrollRight && (
          <button type="button" aria-label="Scroll right" className="nav-button nav-right" onClick={() => scrollByAmount("right")}>
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;
