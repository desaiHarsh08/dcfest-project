/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Badge } from "react-bootstrap";
import styles from "../../styles/EventCard.module.css"; // Import your custom styles
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { deleteParticipation, doParticipate, fetchParticipationEventsByCollegeId, fetchParticipationsByAvailableEventId } from "../../services/college-participation-apis";
import { FaCheckCircle, FaSpinner, FaEye } from "react-icons/fa";

const EventCard = ({ event, college }) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [participation, setParticipation] = useState([]);
  const [flag, setFlag] = useState(false);
  const [slotsOccupied, setSlotsOccupied] = useState(null);

  useEffect(() => {
    if (college?.id) {
      getParticipationByCollegeId(college.id);
    }
  }, [college, flag, isLoading]);

  const getParticipationByCollegeId = async (collegeId) => {
    try {
      const response = await fetchParticipationEventsByCollegeId(collegeId);
      setParticipation(response);
    } catch (error) {
      alert("Unable to fetch the participation details!");
      console.log(error);
    }
  };

  // Function to truncate the description to a set word limit
  const truncateDescription = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  const handleCollegeRegister = async () => {
    if (new Date() > new Date("2024-12-11T14:00:00")) {
      return;
    }
    setIsLoading(true);
    try {
      await doParticipate({
        collegeId: user?.id,
        availableEventId: event?.id,
      });
      alert("Participation done successfully!");
      setFlag((prev) => !prev);
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (event?.id) {
      fetchSlotsOccupied(event.id);
    }
  }, [event]);

  const fetchSlotsOccupied = async (availableEventId) => {
    try {
      console.log("here fetching");
      const response = await fetchParticipationsByAvailableEventId(availableEventId);
      console.log("response:", event?.title, response.length);
      setSlotsOccupied(response.length);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch the details!");
    }
  };

  const handleDeleteParticipation = async (participationId) => {
    if (new Date() > new Date("2024-12-11T14:00:00")) {
      return;
    }

    let isConfirmed = confirm(`Are you sure that you want to remove your college's participation for "${event?.title}"?`);
    if (!isConfirmed) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await deleteParticipation(participationId);
      console.log("Removed the participation,", response);
      setParticipation(participation.filter((p) => p.id != participationId));
    } catch (error) {
      console.log(error);
      alert("Something went wrong... Please try again later!");
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
                <Button
                  variant="success"
                  disabled={isLoading}
                  className="d-flex align-items-center"
                  onClick={() => handleDeleteParticipation(participation.find((p) => p?.availableEventId === event.id).id)}
                >
                  <FaCheckCircle className="me-2" />
                  {isLoading ? "Please wait..." : "Enrolled"}
                </Button>
              ) : !event?.closeRegistration && slotsOccupied < event?.eventRules.find((ele) => ele.eventRuleTemplate.name === "REGISTERED_SLOTS_AVAILABLE")?.value ? (
                <Button variant="primary" onClick={handleCollegeRegister} disabled={isLoading || new Date() > new Date("2024-12-11T14:00:00")} className="d-flex align-items-center">
                  {isLoading ? (
                    <>
                      <FaSpinner className="me-2 spinner-border-sm" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              ) : (
                <Button disabled variant="danger">
                  Full
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  );
};

export default EventCard;
