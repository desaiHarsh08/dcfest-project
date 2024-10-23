import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
} from 'react-bootstrap';
import {
    FaUser,
    FaUniversity,
    FaPhone,
    FaAddressCard,
    FaEnvelope,
    FaUsers,
    FaRegCalendarAlt
} from 'react-icons/fa';
import '../styles/EventRegistrationPage.css'; // Import the CSS file

const EventRegistrationPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        college: '',
        phone: '',
        address: '',
        email: '',
        participants: '',
        event: '',
        eventCategory: '', // New field for Event Category
    });

    const [showAlert, setShowAlert] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            // Handle form submission logic here, e.g., sending data to an API
            console.log('Form Data Submitted:', formData);
            setShowAlert(true);
            // Reset form
            setFormData({
                name: '',
                college: '',
                phone: '',
                address: '',
                email: '',
                participants: '',
                event: '',
                eventCategory: '', // Reset new field
            });
        }
        setValidated(true);
    };

    return (
        <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Row className="w-100">
                <Col xs={12} md={8} lg={6} className="mx-auto">
                    <Card className="shadow-lg">
                        <Card.Body className="d-flex flex-column" style={{ height: '600px' }}>
                            <div className="text-center mb-4">
                                <FaRegCalendarAlt size={50} color="#0d6efd" />
                                <h2 className="mt-3">Event Registration</h2>
                                <p className="text-muted">Fill out the form below to register for an event.</p>
                            </div>
                            {showAlert && (
                                <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                                    Registration successful!
                                </Alert>
                            )}
                            <div className="form-scroll-container flex-grow-1">
                                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formName">
                                        <Form.Label><FaUser className="me-2" /> Name of the Candidate</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your full name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide your name.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formCollege">
                                        <Form.Label><FaUniversity className="me-2" /> College Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your college name"
                                            name="college"
                                            value={formData.college}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide your college name.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formPhone">
                                        <Form.Label><FaPhone className="me-2" /> Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            pattern="^[0-9]{10}$"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid 10-digit phone number.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAddress">
                                        <Form.Label><FaAddressCard className="me-2" /> Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide your address.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label><FaEnvelope className="me-2" /> Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid email.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formParticipants">
                                        <Form.Label><FaUsers className="me-2" /> Total Number of Participants/Team</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter number of participants or team size"
                                            name="participants"
                                            value={formData.participants}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please enter at least 1 participant.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* New Event Category Field */}
                                    <Form.Group className="mb-4" controlId="formEventCategory">
                                        <Form.Label>Select Event Category</Form.Label>
                                        <Form.Select
                                            name="eventCategory"
                                            value={formData.eventCategory}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Choose an event category...</option>
                                            <option value="technical">Technical</option>
                                            <option value="cultural">Cultural</option>
                                            <option value="sports">Sports</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="seminar">Seminar</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            Please select an event category.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formEvent">
                                        <Form.Label>Select the Event You Want to Participate</Form.Label>
                                        <Form.Select
                                            name="event"
                                            value={formData.event}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Choose an event...</option>
                                            <option value="coding">Coding Contest</option>
                                            <option value="robotics">Robotics</option>
                                            <option value="quiz">Quiz Competition</option>
                                            <option value="sports">Sports Event</option>
                                            <option value="design">Design Workshop</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            Please select an event.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                            </div>
                            <div className="submit-button-container">
                                <Button variant="primary" type="submit" size="lg" className="w-100">
                                    Register
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EventRegistrationPage;
