import React, { useState } from 'react';
import {
    Container,
    Table,
    Button,
    Modal,
    Form,
    Tabs,
    Tab,
    Row,
    Col,
    InputGroup,
    FormControl,
    Alert,
    Card,
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ScoringDepartment = () => {
    // State for Events
    const [events, setEvents] = useState([
        {
            id: 1,
            name: 'Coding Challenge',
            participants: [
                { id: 1, name: 'John Doe', college: 'Engineering College', score: 85 },
                { id: 2, name: 'Alice Johnson', college: 'Science College', score: 90 },
                { id: 3, name: 'Bob Brown', college: 'Arts College', score: 75 },
            ],
            winners: [], // Will hold top 3 participants
        },
        {
            id: 2,
            name: 'Robotics Competition',
            participants: [
                { id: 1, name: 'Jane Smith', college: 'Engineering College', score: 88 },
                { id: 2, name: 'Mark Davis', college: 'Technology Institute', score: 92 },
                { id: 3, name: 'Emily Clark', college: 'Science College', score: 80 },
            ],
            winners: [],
        },
        // Add more events as needed
    ]);

    // State for Overall College-wise Scorecard
    const [overallScorecard, setOverallScorecard] = useState({});

    // State for Search Queries per Event
    const [searchQueries, setSearchQueries] = useState({});

    // State for Modals
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [currentParticipant, setCurrentParticipant] = useState({
        id: null,
        name: '',
        college: '',
        score: '',
    });
    const [showEditParticipantModal, setShowEditParticipantModal] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

    // Handlers for Alerts
    const showAlert = (message, variant = 'success') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: '' }), 3000);
    };

    // Handlers for Adding Event
    const handleAddEvent = (e) => {
        e.preventDefault();
        const eventName = e.target.eventName.value.trim();
        if (!eventName) {
            showAlert('Event name cannot be empty.', 'danger');
            return;
        }

        // Check for duplicate event names
        const duplicate = events.find(
            (event) => event.name.toLowerCase() === eventName.toLowerCase()
        );
        if (duplicate) {
            showAlert('An event with this name already exists.', 'warning');
            return;
        }

        const newEvent = {
            id: events.length + 1,
            name: eventName,
            participants: [],
            winners: [],
        };
        setEvents([...events, newEvent]);
        setShowAddEventModal(false);
        showAlert('Event added successfully!');
    };

    // Handlers for Adding Participant
    const handleAddParticipant = (e) => {
        e.preventDefault();
        const { name, college, score } = currentParticipant;
        if (!name || !college || score === '') {
            showAlert('All fields are required.', 'danger');
            return;
        }

        const eventIndex = events.findIndex((event) => event.id === currentEventId);
        if (eventIndex === -1) {
            showAlert('Event not found.', 'danger');
            return;
        }

        // Check for duplicate participant names within the event
        const duplicate = events[eventIndex].participants.find(
            (p) => p.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (duplicate) {
            showAlert('A participant with this name already exists in the event.', 'warning');
            return;
        }

        const newParticipant = {
            id: events[eventIndex].participants.length + 1,
            name: name.trim(),
            college: college.trim(),
            score: parseInt(score),
        };

        const updatedEvents = [...events];
        updatedEvents[eventIndex].participants.push(newParticipant);
        setEvents(updatedEvents);
        setShowAddParticipantModal(false);
        setCurrentParticipant({ id: null, name: '', college: '', score: '' });
        showAlert('Participant added successfully!');
    };

    // Handlers for Editing Participant
    const handleEditParticipant = (e) => {
        e.preventDefault();
        const { id, name, college, score } = currentParticipant;
        if (!name || !college || score === '') {
            showAlert('All fields are required.', 'danger');
            return;
        }

        const eventIndex = events.findIndex((event) => event.id === currentEventId);
        if (eventIndex === -1) {
            showAlert('Event not found.', 'danger');
            return;
        }

        const participantIndex = events[eventIndex].participants.findIndex(
            (p) => p.id === id
        );
        if (participantIndex === -1) {
            showAlert('Participant not found.', 'danger');
            return;
        }

        // Check for duplicate participant names within the event
        const duplicate = events[eventIndex].participants.find(
            (p) =>
                p.name.toLowerCase() === name.trim().toLowerCase() &&
                p.id !== id
        );
        if (duplicate) {
            showAlert('A participant with this name already exists in the event.', 'warning');
            return;
        }

        const updatedEvents = [...events];
        updatedEvents[eventIndex].participants[participantIndex] = {
            id,
            name: name.trim(),
            college: college.trim(),
            score: parseInt(score),
        };
        setEvents(updatedEvents);
        setShowEditParticipantModal(false);
        setCurrentParticipant({ id: null, name: '', college: '', score: '' });
        showAlert('Participant updated successfully!');
    };

    // Handlers for Deleting Participant
    const handleDeleteParticipant = (eventId, participantId) => {
        if (!window.confirm('Are you sure you want to delete this participant?')) return;

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
            showAlert('Event not found.', 'danger');
            return;
        }

        const updatedEvents = [...events];
        updatedEvents[eventIndex].participants = updatedEvents[eventIndex].participants.filter(
            (p) => p.id !== participantId
        );

        // Reassign participant IDs
        updatedEvents[eventIndex].participants = updatedEvents[eventIndex].participants.map(
            (p, idx) => ({ ...p, id: idx + 1 })
        );

        // If winners were already generated, regenerate them after deletion
        if (updatedEvents[eventIndex].winners.length > 0) {
            const participants = [...updatedEvents[eventIndex].participants];
            if (participants.length >= 3) {
                participants.sort((a, b) => b.score - a.score);
                updatedEvents[eventIndex].winners = participants.slice(0, 3);
            } else {
                updatedEvents[eventIndex].winners = [];
                showAlert('Not enough participants to maintain winners. Winners have been cleared.', 'warning');
            }
        }

        setEvents(updatedEvents);
        showAlert('Participant deleted successfully!');
    };

    // Handlers for Opening Add Participant Modal
    const openAddParticipantModal = (eventId) => {
        setCurrentEventId(eventId);
        setShowAddParticipantModal(true);
    };

    // Handlers for Opening Edit Participant Modal
    const openEditParticipantModal = (eventId, participant) => {
        setCurrentEventId(eventId);
        setCurrentParticipant({
            id: participant.id,
            name: participant.name,
            college: participant.college,
            score: participant.score,
        });
        setShowEditParticipantModal(true);
    };

    // Handler for Generating Winners
    const generateWinners = (eventId) => {
        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
            showAlert('Event not found.', 'danger');
            return;
        }

        const participants = [...events[eventIndex].participants];
        if (participants.length < 3) {
            showAlert('Not enough participants to generate winners.', 'warning');
            return;
        }

        // Sort participants by score in descending order
        participants.sort((a, b) => b.score - a.score);

        const topThree = participants.slice(0, 3);
        const updatedEvents = [...events];
        updatedEvents[eventIndex].winners = topThree;
        setEvents(updatedEvents);
        showAlert('Winners generated successfully!');

        // Update Overall Scorecard
        const scorecard = { ...overallScorecard };
        participants.forEach((p) => {
            if (!scorecard[p.college]) {
                scorecard[p.college] = 0;
            }
            scorecard[p.college] += p.score;
        });
        setOverallScorecard(scorecard);
    };

    // Handler for Search Input Change
    const handleSearchChange = (eventId, query) => {
        setSearchQueries((prev) => ({
            ...prev,
            [eventId]: query,
        }));
    };

    return (
        <Container fluid className="my-4">
            <Row className="justify-content-center">
                <Col xs={12} lg={10}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">Scoring Department</h2>

                            {alert.show && (
                                <Alert
                                    variant={alert.variant}
                                    onClose={() => setAlert({ show: false })}
                                    dismissible
                                >
                                    {alert.message}
                                </Alert>
                            )}

                            {/* Button to Add New Event */}
                            <div className="d-flex justify-content-end mb-3">
                                <Button variant="primary" onClick={() => setShowAddEventModal(true)}>
                                    <i className="bi bi-plus-lg me-2"></i>Add New Event
                                </Button>
                            </div>

                            {/* Tabs for Each Event */}
                            <Tabs defaultActiveKey={events[0]?.id} id="events-tabs" className="mb-3" fill>
                                {events.map((event) => {
                                    // Retrieve current search query for this event
                                    const searchQuery = searchQueries[event.id]
                                        ? searchQueries[event.id].toLowerCase()
                                        : '';

                                    // Filter participants based on search query
                                    const filteredParticipants = event.participants.filter(
                                        (p) =>
                                            p.name.toLowerCase().includes(searchQuery) ||
                                            p.college.toLowerCase().includes(searchQuery) ||
                                            p.score.toString().includes(searchQuery)
                                    );

                                    return (
                                        <Tab eventKey={event.id} title={event.name} key={event.id}>
                                            <Row className="align-items-center mb-3">
                                                <Col md={6} sm={12} className="mb-2 mb-md-0">
                                                    <InputGroup>
                                                        <FormControl
                                                            placeholder="Search Participants"
                                                            value={searchQueries[event.id] || ''}
                                                            onChange={(e) => handleSearchChange(event.id, e.target.value)}
                                                        />
                                                        <InputGroup.Text>
                                                            <i className="bi bi-search"></i>
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </Col>
                                                <Col md={6} sm={12} className="text-md-end">
                                                    <Button
                                                        variant="success"
                                                        className="me-2"
                                                        onClick={() => openAddParticipantModal(event.id)}
                                                    >
                                                        <i className="bi bi-person-plus me-1"></i>Add Participant
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        onClick={() => generateWinners(event.id)}
                                                        disabled={event.winners.length > 0}
                                                    >
                                                        <i className="bi bi-trophy me-1"></i>Generate Winners
                                                    </Button>
                                                </Col>
                                            </Row>

                                            {/* Participants Table */}
                                            <Table striped bordered hover responsive className="mb-4">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th style={{ width: '5%' }}>#</th>
                                                        <th style={{ width: '25%' }}>Name</th>
                                                        <th style={{ width: '25%' }}>College</th>
                                                        <th style={{ width: '15%' }}>Score</th>
                                                        <th style={{ width: '30%' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredParticipants.length > 0 ? (
                                                        filteredParticipants.map((participant) => (
                                                            <tr key={participant.id}>
                                                                <td>{participant.id}</td>
                                                                <td>{participant.name}</td>
                                                                <td>{participant.college}</td>
                                                                <td>{participant.score}</td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openEditParticipantModal(event.id, participant)
                                                                        }
                                                                        className="me-2"
                                                                    >
                                                                        <i className="bi bi-pencil-square me-1"></i>Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDeleteParticipant(event.id, participant.id)
                                                                        }
                                                                    >
                                                                        <i className="bi bi-trash me-1"></i>Delete
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center">
                                                                No participants found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>

                                            {/* Winners Section */}
                                            {event.winners.length > 0 && (
                                                <Card className="mt-4">
                                                    <Card.Header className="bg-success text-white">
                                                        Winners for {event.name}
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <Table striped bordered hover responsive>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ width: '10%' }}>Position</th>
                                                                    <th style={{ width: '35%' }}>Name</th>
                                                                    <th style={{ width: '35%' }}>College</th>
                                                                    <th style={{ width: '20%' }}>Score</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {event.winners.map((winner, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            {index === 0
                                                                                ? '1st Place'
                                                                                : index === 1
                                                                                    ? '2nd Place'
                                                                                    : '3rd Place'}
                                                                        </td>
                                                                        <td>{winner.name}</td>
                                                                        <td>{winner.college}</td>
                                                                        <td>{winner.score}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </Card.Body>
                                                </Card>
                                            )}
                                        </Tab>
                                    );
                                })}
                            </Tabs>

                            {/* Overall College-wise Scorecard */}
                            <Card className="mt-5">
                                <Card.Header className="bg-info text-white">
                                    Overall College-wise Scorecard
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover responsive>
                                        <thead className="table-dark">
                                            <tr>
                                                <th style={{ width: '5%' }}>#</th>
                                                <th style={{ width: '60%' }}>College</th>
                                                <th style={{ width: '35%' }}>Total Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(overallScorecard).length > 0 ? (
                                                Object.entries(overallScorecard)
                                                    .sort((a, b) => b[1] - a[1]) // Sort by score descending
                                                    .map(([college, score], index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{college}</td>
                                                            <td>{score}</td>
                                                        </tr>
                                                    ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center">
                                                        No scores available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>

                    {/* Add Event Modal */}
                    <Modal
                        show={showAddEventModal}
                        onHide={() => setShowAddEventModal(false)}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Event</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleAddEvent}>
                            <Modal.Body>
                                <Form.Group className="mb-3" controlId="eventName">
                                    <Form.Label>Event Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter event name"
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    <i className="bi bi-plus-lg me-1"></i>Add Event
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Add Participant Modal */}
                    <Modal
                        show={showAddParticipantModal}
                        onHide={() => setShowAddParticipantModal(false)}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add Participant</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleAddParticipant}>
                            <Modal.Body>
                                <Form.Group className="mb-3" controlId="participantName">
                                    <Form.Label>Participant Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter participant name"
                                        value={currentParticipant.name}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, name: e.target.value })
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="participantCollege">
                                    <Form.Label>College</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter college name"
                                        value={currentParticipant.college}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, college: e.target.value })
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="participantScore">
                                    <Form.Label>Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter score"
                                        value={currentParticipant.score}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, score: e.target.value })
                                        }
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowAddParticipantModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="success" type="submit">
                                    <i className="bi bi-person-plus me-1"></i>Add Participant
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Edit Participant Modal */}
                    <Modal
                        show={showEditParticipantModal}
                        onHide={() => setShowEditParticipantModal(false)}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Participant</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleEditParticipant}>
                            <Modal.Body>
                                <Form.Group className="mb-3" controlId="editParticipantName">
                                    <Form.Label>Participant Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter participant name"
                                        value={currentParticipant.name}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, name: e.target.value })
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="editParticipantCollege">
                                    <Form.Label>College</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter college name"
                                        value={currentParticipant.college}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, college: e.target.value })
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="editParticipantScore">
                                    <Form.Label>Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter score"
                                        value={currentParticipant.score}
                                        onChange={(e) =>
                                            setCurrentParticipant({ ...currentParticipant, score: e.target.value })
                                        }
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowEditParticipantModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="warning" type="submit">
                                    <i className="bi bi-save me-1"></i>Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default ScoringDepartment;
