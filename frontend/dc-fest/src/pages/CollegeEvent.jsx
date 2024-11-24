import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Badge } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import { deleteParticipant, fetchParticipantsByEventId } from "../services/participants-api";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchEventById } from "../services/event-apis";
import styles from "../styles/CollegeEvent.module.css";

const CollegeEvent = () => {
  const { iccode, eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [availableEvent, setAvailableEvent] = useState();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchParticipantsByEventId(eventId).then((data) => setParticipants(data));
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
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <Container className="mt-4">
        {/* Back to Home Button */}
        <Row className="mb-4">
          <Col>
            <Link to={`/${iccode}`} className="btn btn-outline-primary" style={{textDecoration:"none"}}>
              &larr; Back to Home
            </Link>
          </Col>
        </Row>

        {/* Event Details Section */}
        <Row>
          <Col md={4}>
            <div className={`${styles["event-card"]} shadow rounded`}>
              <div className={`${styles["banner"]}`}>
                <img
                  src={`/${availableEvent?.slug}.jpg`}
                  alt="Event"
                  className={`${styles["event-image"]} rounded`}
                />
              </div>
              <div className="p-4">
                <h4 className="fw-bold text-primary">{availableEvent?.title}</h4>
                <Badge
                  bg="primary"
                  className={`${styles["badge-gradient"]} mb-3`}
                >
                  {availableEvent?.type}
                </Badge>
                <p className="text-muted">
                  <i>{availableEvent?.oneLiner}</i>
                </p>
                <p>{availableEvent?.description}</p>

                {/* Event Rounds */}
                {availableEvent?.rounds?.map((round) => (
                  <div key={round.id} className="mb-3">
                    <p>
                      <strong>Round:</strong> {round.roundType}
                    </p>
                    <p>
                      <strong>Venue:</strong> {round.venue}
                    </p>
                    <p>
                      <strong>Start:</strong>{" "}
                      {new Date(round.startTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>End:</strong>{" "}
                      {new Date(round.endTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Participants Section */}
          <Col md={8}>
            <div className={`${styles["participants-section"]} shadow p-4 rounded`}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-secondary">Participants</h4>
                <Link
                  to={"add"}
                  className="btn btn-success shadow-sm"
                  style={{textDecoration:"none"}}
                >
                  + Add Participant
                </Link>
              </div>

              {/* Participants Table */}
              <Table bordered hover responsive className="table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Entry Type</th>
                    <th>Ranking</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td>{index + 1}</td>
                        <td>{participant.name}</td>
                        <td>{participant.email}</td>
                        <td>{participant.phone}</td>
                        <td>
                          <Badge
                            bg={
                              participant.type === "OTSE" ? "warning" : "info"
                            }
                          >
                            {participant.type}
                          </Badge>
                        </td>
                        <td>{participant.ranking || "-"}</td>
                        <td>
                          <Button
                            variant={
                              deletingId === participant.id ? "secondary" : "danger"
                            }
                            onClick={() => handleDelete(participant.id)}
                            disabled={loading && deletingId === participant.id}
                          >
                            {loading && deletingId === participant.id
                              ? "Deleting..."
                              : "Delete"}
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
