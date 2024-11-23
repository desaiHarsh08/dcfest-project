// src/pages/EventParticipationPage.jsx
import { useEffect, useState } from "react";
import { Table, Container, Alert, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "../styles/EventParticipationPage.css"; // Import custom CSS
import { fetchCategories } from "../services/categories-api";
import { fetchParticipantsByEventId } from "../services/participants-api";
import { fetchEventByAvailableEventId } from "../services/event-apis";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import ParticipantRow from "../components/event-participation/ParticipantRow";

const EventParticipationPage = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [categories, setCategories] = useState([]);

  const [availableEvent, setAvailableEvent] = useState();

  // Simulate data fetching
  useEffect(() => {
    const fetchParticipants = () => {
      fetchEventByAvailableEventId(eventFilter)
        .then((data) => {
          console.log("event is:", data);
          fetchParticipantsByEventId(data.id)
            .then((data) => {
              console.log("participants:", data);
              setParticipants(data);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log("unable to fetch the event", err));
    };

    fetchParticipants();
  }, [eventFilter]);

  useEffect(() => {
    fetchAvailableEventsById(eventFilter)
      .then((data) => setAvailableEvent(data))
      .catch((err) => console.log(err));
  }, [eventFilter]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log(data);
        setCategories(data);

        // Check if data is not empty and has a valid structure before setting filters
        if (data.length > 0) {
          const firstCategory = data[0];
          setCategoryFilter(firstCategory.id);

          // Check if availableEvents exists and has at least one event
          if (firstCategory.availableEvents && firstCategory.availableEvents.length > 0) {
            setEventFilter(firstCategory.availableEvents[0].id);
          }
        }
      })
      .catch((err) => console.log("Unable to fetch the categories", err));
  }, []);

  // Filtered participants based on selected event and category
  //   const filteredParticipants = participants.filter((participant) => {
  //     return (eventFilter ? participant.event === eventFilter : true) && (categoryFilter ? participant.eventCategory === categoryFilter : true);
  //   });

  // Calculate total pages and current participants
  //   const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  //   const currentParticipants = filteredParticipants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (participant) => {
    setSelectedParticipant(participant);
    setShowEditModal(true);
  };

  const handleRemove = (id) => {
    setParticipants(participants.filter((participant) => participant.id !== id));
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedParticipant(null);
  };

  const handleSaveChanges = () => {
    setParticipants(participants.map((participant) => (participant.id === selectedParticipant.id ? selectedParticipant : participant)));
    
    handleModalClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedParticipant({ ...selectedParticipant, [name]: value });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Event Participation List</h1>

      {/* Dropdowns for filtering participants */}
      <div className="mb-4 filter-dropdowns">
        <Form.Select
          className="category-dropdown"
          value={categoryFilter}
          onChange={(e) => {
            const selectedCategory = categories?.find((c) => c?.name == e.target.value);
            setCategoryFilter(e.target.value);
            setEventFilter(selectedCategory.availableEvents[0].id);
          }}
        >
          {categories?.map((category, categoryIndex) => (
            <option key={`category-${categoryIndex}`} value={category?.id}>
              {category?.name}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          className="event-dropdown me-2"
          value={eventFilter}
          onChange={(e) => {
            console.log("on available event change:", e.target.value);
            setEventFilter(e.target.value);
          }}
        >
          {categories?.map((category) => {
            if (category.id == categoryFilter) {
              return category?.availableEvents?.map((availableEvent, availableEventIndex) => (
                <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
                  {availableEvent?.title}
                </option>
              ));
            }
          })}
        </Form.Select>
      </div>

      {participants.length > 0 ? (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Participant Name</th>
                <th>College</th>
                <th>Email</th>
                <th>Category</th>
                <th>Event</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <ParticipantRow
                  key={participant.id}
                  category={categories.find((cat) => cat.id == availableEvent?.eventCategoryId)}
                  index={index}
                  availableEvent={availableEvent}
                  handleEdit={handleEdit}
                  handleRemove={handleRemove}
                  participant={participant}
                />
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert variant="info">No participants found.</Alert>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant && (
            <Form>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={selectedParticipant.name} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group controlId="formCollege">
                <Form.Label>College</Form.Label>
                <Form.Control type="text" name="college" value={selectedParticipant.college} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={selectedParticipant.email} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group controlId="formEvent">
                <Form.Label>Event</Form.Label>
                <Form.Control type="text" name="event" value={selectedParticipant.event} onChange={handleInputChange} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventParticipationPage;
