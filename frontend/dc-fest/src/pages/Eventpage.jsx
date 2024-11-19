import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row, ListGroup, Badge } from "react-bootstrap";
import { FaTicketAlt, FaUsers, FaRegClock, FaMapMarkerAlt, FaEdit } from "react-icons/fa";
import EditModal from "./EditModal";
import { fetchEventBySlug } from "../services/event-apis";
import { AiFillDelete } from "react-icons/ai";

const EventPage = () => {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEventBySlug(eventSlug)
      .then((data) => setEvent(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [eventSlug]);

  const handleUpdate = (updatedEvent) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      ...updatedEvent,
    }));
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Function to format date and time in AM/PM format
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      //   weekday: "long", // Day of the week (e.g., Monday)
      year: "numeric", // Year (e.g., 2024)
      month: "long", // Month (e.g., November)
      day: "numeric", // Day (e.g., 14)
      hour: "2-digit", // Hour (e.g., 09)
      minute: "2-digit", // Minute (e.g., 30)
      //   second: "2-digit", // Second (e.g., 05)
      hour12: true, // Use AM/PM format
    });
  };

  return (
    <Container className="py-5">
      {event && (
        <Row>
          {/* Event Image */}
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Img
                variant="top"
                src={`/${event?.slug}.jpg`}
                alt={event?.title}
                className="img-fluid rounded-lg" // Added rounded corners and made image responsive
                style={{ height: "100vh", width: "100vw", objectFit: "cover" }} // Ensures the image looks good within a fixed height
              />
            </Card>
          </Col>

          {/* Event Content */}
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{event?.title}</Card.Title>
                <Card.Subtitle className="mb-4 text-muted my-3 ">
                    <i>&quot;{event?.oneLiner}&quot;</i>
                </Card.Subtitle>
                <Card.Text>{event?.description}</Card.Text>
                <hr />
                <div>
                  <h5>Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTicketAlt className="me-2" />
                      <strong>Type:</strong> {event?.type}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Max Participants:</strong> {event?.maxParticipants || 20}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Min Participants:</strong> {event?.minParticipants || 1}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rules</h5>
                  <ListGroup>
                    {event?.eventRules.map((rule, index) => (
                      <ListGroup.Item key={index}>
                        <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rounds</h5>
                  {event?.rounds.map((round, index) => (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Body>
                        <h6>
                          Round {index + 1}: {round.roundType}
                        </h6>
                        <Badge pill bg="info" className="me-2">
                          {round.roundType}
                        </Badge>
                        <ListGroup variant="flush" className="mt-3">
                          {round?.venues.map((venue, venueIndex) => (
                            <ListGroup.Item key={`venue-${venueIndex}`} className="d-flex justify-content-between">
                              <div>
                                <FaMapMarkerAlt className="me-2" />
                                <strong>{venue.name}</strong>
                              </div>
                              <div>
                                <p>
                                  <FaRegClock className="me-2" />
                                  {formatDateTime(venue.start)}
                                </p>
                                <p>
                                  <FaRegClock className="me-2" />
                                  {formatDateTime(venue.end)}
                                </p>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
                <Button variant="primary" onClick={openModal}>
                  <FaEdit className="me-2" /> Edit Event
                </Button>
                <Button variant="danger" onClick={openModal}>
                  <AiFillDelete className="me-2" /> Delete
                </Button>
                <Button variant="info" onClick={openModal}>
                  <AiFillDelete className="me-2" /> Close Registration
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Edit Modal */}
      <EditModal isOpen={isModalOpen} onClose={closeModal} event={event} onUpdate={handleUpdate} />
    </Container>
  );
};

export default EventPage;
