// src/pages/CollegeRepresentativePage.js
import React, { useState } from 'react';
import { Form, Button, Row, Col, Container, Card, Alert } from 'react-bootstrap';
import { FaUniversity, FaUserTie, FaChalkboardTeacher, FaCalendarCheck } from 'react-icons/fa';
import '../styles/CollegeRepresentativePage.css'; // Custom styles for a professional UI

const CollegeRepresentativePage = () => {
    const [formData, setFormData] = useState({
        collegeName: '',
        collegeAddress: '',
        mobileNumber: '',
        email: '',
        rep1Name: '',
        rep1Mobile: '',
        rep1Email: '',
        rep2Name: '',
        rep2Mobile: '',
        rep2Email: '',
        teacherName: '',
        teacherMobile: '',
        teacherEmail: '',
        event: '',
    });

    const [validated, setValidated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            // Add form submission logic (e.g., API call)
            console.log(formData);
            setShowAlert(true);
            // Optionally reset form
            setFormData({
                collegeName: '',
                collegeAddress: '',
                mobileNumber: '',
                email: '',
                rep1Name: '',
                rep1Mobile: '',
                rep1Email: '',
                rep2Name: '',
                rep2Mobile: '',
                rep2Email: '',
                teacherName: '',
                teacherMobile: '',
                teacherEmail: '',
                event: '',
            });
        }
        setValidated(true);
    };

    return (
        <div className="form-bg">
            <Container className="form-container">
                <Card className="shadow-lg p-4 rounded">
                    <Card.Body>
                        <h1 className="text-center form-title mb-4">College Representative Form</h1>
                        <p className="text-center form-subtitle mb-4">
                            Please fill out the details for the event. Either one or both representatives may fill the form.
                        </p>

                        {showAlert && (
                            <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                                Form submitted successfully!
                            </Alert>
                        )}

                        <div className="form-scroll">
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                {/* College Details */}
                                <Card className="section-card mb-4">
                                    <Card.Header>
                                        <FaUniversity className="section-icon" />
                                        <span>College Details</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="collegeName">
                                                    <Form.Label>College Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter College Name"
                                                        name="collegeName"
                                                        value={formData.collegeName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a college name.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="collegeAddress">
                                                    <Form.Label>College Address</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter College Address"
                                                        name="collegeAddress"
                                                        value={formData.collegeAddress}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a college address.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="mobileNumber">
                                                    <Form.Label>Mobile Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="Enter Mobile Number"
                                                        name="mobileNumber"
                                                        value={formData.mobileNumber}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Text className="text-muted">
                                                        All future correspondence will be done through this number.
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid mobile number.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="email">
                                                    <Form.Label>Email ID</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter Email ID"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Text className="text-muted">
                                                        All future correspondence will be sent to this ID.
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid email address.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Representative 1 Details */}
                                <Card className="section-card mb-4">
                                    <Card.Header>
                                        <FaUserTie className="section-icon" />
                                        <span>Representative 1 Details</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="rep1Name">
                                                    <Form.Label>Representative 1 Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter Representative 1 Name"
                                                        name="rep1Name"
                                                        value={formData.rep1Name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide the representative's name.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="rep1Mobile">
                                                    <Form.Label>Representative 1 Mobile No</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="Enter Representative 1 Mobile"
                                                        name="rep1Mobile"
                                                        value={formData.rep1Mobile}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid mobile number.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12}>
                                                <Form.Group controlId="rep1Email">
                                                    <Form.Label>Representative 1 Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter Representative 1 Email"
                                                        name="rep1Email"
                                                        value={formData.rep1Email}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid email address.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Representative 2 Details */}
                                <Card className="section-card mb-4">
                                    <Card.Header>
                                        <FaUserTie className="section-icon" />
                                        <span>Representative 2 Details</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="rep1Name">
                                                    <Form.Label>Representative 2 Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter Representative 1 Name"
                                                        name="rep1Name"
                                                        value={formData.rep1Name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide the representative's name.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="rep1Mobile">
                                                    <Form.Label>Representative 1 Mobile No</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="Enter Representative 1 Mobile"
                                                        name="rep1Mobile"
                                                        value={formData.rep1Mobile}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid mobile number.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12}>
                                                <Form.Group controlId="rep1Email">
                                                    <Form.Label>Representative 1 Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter Representative 1 Email"
                                                        name="rep1Email"
                                                        value={formData.rep1Email}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid email address.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Teacher's Details */}
                                <Card className="section-card mb-4">
                                    <Card.Header>
                                        <FaChalkboardTeacher className="section-icon" />
                                        <span>Teacher's Details</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="teacherName">
                                                    <Form.Label>Teacher's Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter Teacher's Name"
                                                        name="teacherName"
                                                        value={formData.teacherName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide the teacher's name.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="teacherMobile">
                                                    <Form.Label>Teacher's Mobile No</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="Enter Teacher's Mobile"
                                                        name="teacherMobile"
                                                        value={formData.teacherMobile}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid mobile number.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12}>
                                                <Form.Group controlId="teacherEmail">
                                                    <Form.Label>Teacher's Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter Teacher's Email"
                                                        name="teacherEmail"
                                                        value={formData.teacherEmail}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid email address.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Event Selection */}
                                <Card className="section-card mb-4">
                                    <Card.Header>
                                        <FaCalendarCheck className="section-icon" />
                                        <span>Event Selection</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col xs={12}>
                                                <Form.Group controlId="event">
                                                    <Form.Label>Select Event</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        name="event"
                                                        value={formData.event}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Select Event</option>
                                                        <option value="star-events">Star Events</option>
                                                        <option value="performing-arts">Performing Arts</option>
                                                        <option value="management-events">Management Events</option>
                                                        <option value="voices-in-action">Voices in Action</option>
                                                        <option value="fine-arts">Fine Arts</option>
                                                        <option value="literary-arts">Literary Arts</option>
                                                    </Form.Control>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please select an event.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <div className="text-center">
                                    <Button variant="primary" type="submit" className="px-5">
                                        Submit
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default CollegeRepresentativePage;
