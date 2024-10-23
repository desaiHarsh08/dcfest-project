// src/pages/EventParticipationPage.jsx
import React, { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Button, Modal, Form, Pagination } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/EventParticipationPage.css'; // Import custom CSS

const EventParticipationPage = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventFilter, setEventFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Number of items to display per page

  // Dummy data for participants
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      college: 'ABC University',
      email: 'john.doe@example.com',
      event: 'Tech Conference 2024',
      eventCategory: 'Technology',
      status: 'Attended',
    },
    {
      id: 2,
      name: 'Jane Smith',
      college: 'XYZ College',
      email: 'jane.smith@example.com',
      event: 'Health Awareness Seminar',
      eventCategory: 'Health',
      status: 'Attended',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      college: 'LMN Institute',
      email: 'mike.johnson@example.com',
      event: 'Art Exhibition',
      eventCategory: 'Arts',
      status: 'Absent',
    },
    {
      id: 4,
      name: 'Emily Davis',
      college: 'DEF Academy',
      email: 'emily.davis@example.com',
      event: 'Science Fair 2024',
      eventCategory: 'Science',
      status: 'Attended',
    },
    {
      id: 5,
      name: 'Chris Brown',
      college: 'GHI College',
      email: 'chris.brown@example.com',
      event: 'Music Fest',
      eventCategory: 'Music',
      status: 'Attended',
    },
  ];

  // Simulate data fetching
  useEffect(() => {
    const fetchParticipants = () => {
      setTimeout(() => {
        setParticipants(dummyData); // Set dummy data after 1 second
        setLoading(false); // Set loading to false
      }, 1000);
    };

    fetchParticipants();
  }, []); // Empty dependency array to run the effect once when the component mounts

  // Filtered participants based on selected event and category
  const filteredParticipants = participants.filter(participant => {
    return (
      (eventFilter ? participant.event === eventFilter : true) &&
      (categoryFilter ? participant.eventCategory === categoryFilter : true)
    );
  });

  // Calculate total pages and current participants
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const currentParticipants = filteredParticipants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (participant) => {
    setSelectedParticipant(participant);
    setShowEditModal(true);
  };

  const handleRemove = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedParticipant(null);
  };

  const handleSaveChanges = () => {
    setParticipants(participants.map(participant =>
      participant.id === selectedParticipant.id ? selectedParticipant : participant
    ));
    handleModalClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedParticipant({ ...selectedParticipant, [name]: value });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
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
          className="event-dropdown me-2"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">Select Event</option>
          <option value="Tech Conference 2024">Tech Conference 2024</option>
          <option value="Health Awareness Seminar">Health Awareness Seminar</option>
          <option value="Art Exhibition">Art Exhibition</option>
          <option value="Science Fair 2024">Science Fair 2024</option>
          <option value="Music Fest">Music Fest</option>
        </Form.Select>

        <Form.Select
          className="category-dropdown"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Technology">Technology</option>
          <option value="Health">Health</option>
          <option value="Arts">Arts</option>
          <option value="Science">Science</option>
          <option value="Music">Music</option>
        </Form.Select>
      </div>

      {currentParticipants.length > 0 ? (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Participant Name</th>
                <th>College</th>
                <th>Email</th>
                <th>Event</th>
                <th>Event Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentParticipants.map((participant, index) => (
                <tr key={participant.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Use index for numbering */}
                  <td>{participant.name}</td>
                  <td>{participant.college}</td>
                  <td>{participant.email}</td>
                  <td>{participant.event}</td>
                  <td>{participant.eventCategory}</td>
                  <td>{participant.status}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(participant)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(participant.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Component */}
          <Pagination className="justify-content-center mt-4">
            <Pagination.Prev onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} disabled={currentPage === 1} />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
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
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedParticipant.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formCollege">
                <Form.Label>College</Form.Label>
                <Form.Control
                  type="text"
                  name="college"
                  value={selectedParticipant.college}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedParticipant.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEvent">
                <Form.Label>Event</Form.Label>
                <Form.Control
                  type="text"
                  name="event"
                  value={selectedParticipant.event}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formCategory">
                <Form.Label>Event Category</Form.Label>
                <Form.Control
                  type="text"
                  name="eventCategory"
                  value={selectedParticipant.eventCategory}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  name="status"
                  value={selectedParticipant.status}
                  onChange={handleInputChange}
                />
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
