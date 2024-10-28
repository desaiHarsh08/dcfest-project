import React, { useContext, useState } from "react";
import { Button, Card, Col } from "react-bootstrap";
import styles from "../../styles/EventCard.module.css"; // Import your custom styles
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { doParticipate } from "../../services/college-participation-apis";

const EventCard = ({ event, college }) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Function to truncate the description to 7 words
  const truncateDescription = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const handleCollegeRegister = async () => {
    setIsLoading(true);
    try {
      const response = await doParticipate({
        collegeId: user?.collegeId,
        availableEventId: event?.id,
      });
      console.log(response);
      alert("Registered for the event...!");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);;
    }
  };

  return (
    <Col key={event.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
      <Card className={`h-100 shadow-sm ${styles.eventCard}`}>
        <div className={styles.imageContainer}>
          <Card.Img
            variant="top"
            src={`/${event.slug}.jpg`}
            alt={event.title}
            className={`img-fluid ${styles.cardImage}`}
            style={{ height: "200px" }}
          />
        </div>
        <Card.Body className="d-flex flex-column p-4">
          <Card.Title className={`${styles.cardTitle} fs-5 text-center`}>
            {event.title}
          </Card.Title>
          <Card.Text className={`text-muted ${styles.cardOneLiner}`}>
            <i className="text-center">"{event.oneLiner}"</i>
          </Card.Text>
          <Card.Text className={`${styles.cardDescription} text-center`}>
            {truncateDescription(event.description, 10)}
          </Card.Text>
          <div className="mt-auto d-flex justify-content-center align-items-center">
            {user.type === "ADMIN" ? (
              <Link
                to={event.slug}
                className={`text-center text-white text-decoration-none ${styles.registerButton}`}
              >
                View
              </Link>
            ) : (
              (college && college?.participations.some(ele => ele.availableEventId === event.id)) ?
                (
                  <Button disabled variant="success">
                    {console.log(event, college)}
                    Enrolled

                  </Button>
                ) : (
                  <Button onClick={handleCollegeRegister}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                ))}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default EventCard;
