import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Badge, Card, ListGroup } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import { deleteParticipant, fetchParticipantsByEventId } from "../services/participants-api";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchEventById } from "../services/event-apis";
import styles from "../styles/CollegeEvent.module.css";
import { FaMapMarkerAlt, FaRegClock, FaTicketAlt, FaUsers } from "react-icons/fa";

const CollegeEvent = () => {
  const { iccode, eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [availableEvent, setAvailableEvent] = useState();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchParticipantsByEventId(eventId).then((data) => {
      console.log(data);
      setParticipants(data);
    });
    fetchEventById(eventId)
      .then((data) => {
        fetchAvailableEventsById(data.availableEventId).then(setAvailableEvent);
      })
      .catch((err) => console.log(err));
  }, [eventId]);

  const handleDelete = async (id) => {
    setLoading(true);
    setDeletingId(id);
    try {
      await deleteParticipant(id);
      alert("Participant Deleted Successfully!");
      setParticipants(participants.filter((participant) => participant.id !== id));
    } catch (error) {
      alert("Unable to delete the participant. Please try again later.");
      console.log(error);
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

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
    <div>
      <Navbar />
      <Container fluid className="mt-4">
        {/* Back to Home Button */}
        <Row className="mb-4">
          <Col>
            <Link to={`/${iccode}`} className="btn btn-outline-primary" style={{ textDecoration: "none" }}>
              &larr; Back to Home
            </Link>
          </Col>
        </Row>

        {/* Event Details Section */}
        <Row>
          <Col md={3}>
            {/* <div className={`${styles["event-card"]} shadow rounded`}>
              <div className={`${styles["banner"]}`}>
                <img src={`/${availableEvent?.slug}.jpg`} alt="Event" className={`${styles["event-image"]} rounded`} />
              </div>
              <div className="p-4">
                <h4 className="fw-bold text-primary">{availableEvent?.title}</h4>
                <Badge bg="primary" className={`${styles["badge-gradient"]} mb-3`}>
                  {availableEvent?.type}
                </Badge>
                <p className="text-muted">
                  <i>{availableEvent?.oneLiner}</i>
                </p>
                <p>{availableEvent?.description}</p>

                {availableEvent?.rounds?.map((round) => (
                  <div key={round.id} className="mb-3">
                    <p>
                      <strong>Round:</strong> {round.roundType}
                    </p>
                    <p>
                      <strong>Venue:</strong> {round.venue}
                    </p>
                    <p>
                      <strong>Start:</strong> {new Date(round.startTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>End:</strong> {new Date(round.endTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div> */}
            <Card className="border-0 shadow-sm py-3" style={{ background: "linear-gradient(135deg,#007bff,#004080)" }}>
              <Card.Img
                variant="top"
                src={`/${availableEvent?.slug}.jpg`}
                alt={availableEvent?.title}
                className="img-fluid rounded-lg" // Added rounded corners and made image responsive
                style={{ height: "200px", objectFit: "contain" }} // Ensures the image looks good within a fixed height
              />
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{availableEvent?.title}</Card.Title>
                <Card.Subtitle className="my-3 text-muted" style={{fontStyle: "italic"}}>{availableEvent?.oneLiner}</Card.Subtitle>
                <Card.Text>{availableEvent?.description}</Card.Text>
                <hr />
                <div>
                  <h5>Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTicketAlt className="me-2" />
                      <strong>Type:</strong> {availableEvent?.type}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Max Participants:</strong> {availableEvent?.maxParticipants || 20}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Min Participants:</strong> {availableEvent?.minParticipants || 1}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rules</h5>
                  <ListGroup>
                    {availableEvent?.eventRules.map((rule, index) => {
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
                    {availableEvent?.eventRules.map((rule, index) => {
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
                  {availableEvent?.rounds.map((round, index) => (
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

          {/* Participants Section */}
          <Col md={9}>
            <div className={`${styles["participants-section"]} shadow p-4 rounded`}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-secondary">Participants</h4>
                <Link to={"add"} className="btn btn-success shadow-sm" style={{ textDecoration: "none" }}>
                  + Add Participant
                </Link>
              </div>

              {/* Participants Table */}
              <Table bordered hover responsive className="table-striped">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>#</th>
                    <th>Type</th>
                    <th>Entry</th>
                    <th>Ranking</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td>{index + 1}.</td>
                        <td>{participant.name}</td>
                        <td>{participant.email}</td>
                        <td style={{ minWidth: "147px" }}>{participant.phone}</td>
                        <td>{participant.group}</td>
                        <td>
                          <Badge bg={participant.type != "PERFORMER" ? "warning" : "info"}>{participant.type}</Badge>
                        </td>
                        <td>
                          <Badge bg={participant.entryType == "NORMAL" ? "light text-dark border border-secondary" : "secondary"}>{participant.entryType}</Badge>
                        </td>
                        <td>{participant.ranking || "-"}</td>
                        <td>
                          <Button variant={deletingId === participant.id ? "secondary" : "danger"} onClick={() => handleDelete(participant.id)} disabled={loading && deletingId === participant.id}>
                            {loading && deletingId === participant.id ? "Deleting..." : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No participants yet. Add the first one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CollegeEvent;
