import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Col, Container, Row, ListGroup, Badge } from "react-bootstrap";
import { FaTicketAlt, FaUsers, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";
import { fetchEventBySlug } from "../services/event-apis";

const RootEvent = () => {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventBySlug(eventSlug)
      .then((data) => setEvent(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [eventSlug]);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Function to format date and time in AM/PM format
  const formatDateTime = (dateTime) => {
    console.log("in format date time:", dateTime);
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
                <Card.Subtitle className="mb-2 text-muted">{event?.oneLiner}</Card.Subtitle>
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
                    {event?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate?.name?.toLowerCase().includes("otse")) {
                        return null;
                      }
                      if (rule.eventRuleTemplate?.name?.toLowerCase() != "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup>
                </div>
                <div>
                  <h5 className="my-4">NOTE:</h5>
                  <ListGroup>
                    {event?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate.name.toLowerCase() === "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <span dangerouslySetInnerHTML={{ __html: rule.value }} />
                          </ListGroup.Item>
                        );
                      }
                    })}
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
                          <ListGroup.Item className="d-flex justify-content-between">
                            <div>
                              <FaMapMarkerAlt className="me-2" />
                              <strong>{round?.venue}</strong>
                            </div>
                            <div>
                              <p>
                                <FaRegClock className="me-2" />
                                {formatDateTime(round?.startTime)}
                              </p>
                              <p>
                                <FaRegClock className="me-2" />
                                {formatDateTime(round?.endTime)}
                              </p>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RootEvent;
