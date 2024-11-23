import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Badge, Modal } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import "../styles/CollegeEvent.css"; // Import custom CSS for additional styling
import { Link, useParams } from "react-router-dom";
import ParticipationForm from "../components/participant-form/ParticipationForm";
import { fetchParticipantsByEventId } from "../services/participants-api";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchEventById } from "../services/event-apis";

const CollegeEvent = () => {
  const { iccode, eventId } = useParams();
  // Sample data for participants
  const [participants, setParticipants] = useState([]);
  const [availableEvent, setAvailableEvent] = useState();

  useEffect(() => {
    fetchParticipantsByEventId(eventId).then((data) => {
      console.log(data);
      setParticipants(data);
    });
  }, []);

  useEffect(() => {
    fetchEventById(eventId)
      .then((data) => {
        console.log(data);
        fetchAvailableEventsById(data.availableEventId)
          .then((data) => {
            console.log("availableEvent:", data);
            setAvailableEvent(data);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }, []);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", email: "", phone: "", type: "NORMAL", ranking: "" });

  // Handle delete functionality
  const handleDelete = (id) => {
    const updatedParticipants = participants.filter((participant) => participant.id !== id);
    setParticipants(updatedParticipants);
  };

  // Handle modal show/hide
  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setNewParticipant({ name: "", email: "", phone: "", type: "NORMAL", ranking: "" }); // Reset form
  };

  // Handle adding a new participant
  const handleAddParticipant = () => {
    const newId = participants.length ? participants[participants.length - 1].id + 1 : 1; // Generate a new ID
    const participantToAdd = { id: newId, ...newParticipant, ranking: parseInt(newParticipant.ranking) };
    setParticipants([...participants, participantToAdd]);
    handleClose(); // Close modal after adding
  };

  return (
    <div>
      <Navbar />
      {console.log(iccode)}
      {iccode && (
        <div className="container">
          <Link to={`/${iccode}`}>Home</Link>
        </div>
      )}
      <Container className="mt-4">
        <Row className="align-items-center">
          <Col md={4} className="event-details">
            <img
              src={`/${availableEvent?.slug}.jpg`} // Replace with your event image URL
              alt="Event"
              className="event-image img-fluid"
            />
          </Col>
          <Col md={8} className="event-info">
            <h2 className="event-name">{availableEvent?.title}</h2>
            <p>
              <strong>Type: </strong>
              <Badge pill variant="success">
                {availableEvent?.type}
              </Badge>
            </p>
            {console.log(availableEvent?.rounds)}
            <div className="d-flex gap-3">
              {availableEvent?.rounds?.map((round) => {
                return (
                  <div key={`round-${round.id}`}>
                    <p>
                      <strong>Round:</strong> {round?.roundType}
                    </p>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Button variant="primary" onClick={handleShow} className="mb-3">
              Add Participant
            </Button>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Type</th>
                  <th>Ranking</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={participant.id}>
                    <td>{index + 1}</td>
                    <td>{participant.name}</td>
                    <td>{participant.email}</td>
                    <td>{participant.phone}</td>
                    <td>
                      <Badge className={`bg-${participant.type === "OTSE" ? "warning" : "secondary"}`}>{participant.type}</Badge>
                    </td>
                    <td>{participant.ranking}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(participant.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        {/* Modal for adding participant */}
        <Modal show={showModal} onHide={handleClose} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Add Participant</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "700px", overflow: "auto" }}>
            {/* <Form>
              <Form.Group controlId="formParticipantName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter participant name"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formParticipantEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter participant email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formParticipantPhone">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter participant phone number"
                  value={newParticipant.phone}
                  onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formParticipantType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  value={newParticipant.type}
                  onChange={(e) => setNewParticipant({ ...newParticipant, type: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="OTSE">OTSE</option>
                </Form.Control>
              </Form.Group>
            </Form> */}
            <ParticipationForm formType="REGISTRATION" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddParticipant}>
              Add Participant
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CollegeEvent;
