import { Card } from "react-bootstrap";
import "../../styles/CategoryItem.css";
import { Link } from "react-router-dom";

const CategoryItem = ({ categoryItem }) => {
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
      <div className="event-list-container-horizontal">
        {categoryItem?.availableEvents?.map((event, index) => (
          <Link to={`event/${event.slug}`} key={index} style={{ textDecoration: "none" }}>
            <Card className="event-card" style={{ minWidth: "350px", minHeight: "350px" }}>
              <Card.Img
                variant="top"
                src={`/${event.slug}.jpg`}
                alt={event.title}
                className="img-fluid event-img"
              />
              <Card.Body>
                <Card.Title className="text-center event-title">{event.title}</Card.Title>
                <Card.Text className="text-center">
                  {truncateText(event?.oneLiner || "No description available", 100)}
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryItem;
