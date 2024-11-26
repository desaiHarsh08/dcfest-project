/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Badge } from "react-bootstrap";
import styles from "../../styles/EventCard.module.css"; // Import your custom styles
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { doParticipate, fetchParticipationEventsByCollegeId } from "../../services/college-participation-apis";
import { FaCheckCircle, FaSpinner, FaEye } from "react-icons/fa";

const EventCard = ({ event, college }) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [participation, setParticipation] = useState([]);
  const [flag, setFlag] = useState(false);

  console.log(event);

  useEffect(() => {
    if (college?.id) {
      fetchParticipationEventsByCollegeId(college.id)
        .then((data) => {
          setParticipation(data);
        })
        .catch((err) => console.log(err));
    }
  }, [college, flag]);

  // Function to truncate the description to a set word limit
  const truncateDescription = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  const handleCollegeRegister = async () => {
    setIsLoading(true);
    try {
      await doParticipate({
        collegeId: user?.id,
        availableEventId: event?.id,
      });
      setFlag((prev) => !prev);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    event && (
      <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
        <Card className={`h-100 shadow-sm ${styles.eventCard} border-0`}>
          <div className={`${styles.imageContainer} overflow-hidden`}>
            <Card.Img variant="top" src={`/${event.slug}.jpg`} alt={event.title} className={`img-fluid rounded-top ${styles.cardImage}`} style={{ height: "200px", objectFit: "cover" }} />
          </div>
          <Card.Body className="d-flex flex-column p-4">
            <Card.Title className={`fs-5 text-center fw-bold ${styles.cardTitle}`}>{event.title}</Card.Title>
            <Card.Text className={`text-muted text-center mb-2 ${styles.cardOneLiner}`}>
              <i>{event.oneLiner}</i>
            </Card.Text>
            <Card.Text className={`text-center ${styles.cardDescription}`}>{truncateDescription(event.description, 10)}</Card.Text>
            <Badge bg="info" className="mb-3 align-self-center">
              {event.category}
            </Badge>
            <div className="mt-auto d-flex justify-content-center">
              {user.type === "ADMIN" ? (
                <Link to={event.slug} className="btn btn-primary d-flex align-items-center text-white text-decoration-none">
                  <FaEye className="me-2" />
                  View
                </Link>
              ) : participation.some((p) => p?.availableEventId === event.id) ? (
                <Button variant="success" disabled className="d-flex align-items-center">
                  <FaCheckCircle className="me-2" />
                  Enrolled
                </Button>
              ) : (
                !event?.closeRegistration && (
                  <Button variant="primary" onClick={handleCollegeRegister} disabled={isLoading} className="d-flex align-items-center">
                    {isLoading ? (
                      <>
                        <FaSpinner className="me-2 spinner-border-sm" />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                )
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  );
};

export default EventCard;
