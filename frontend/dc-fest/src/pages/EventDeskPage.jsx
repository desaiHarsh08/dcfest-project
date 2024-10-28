// src/components/EventCards.jsx
import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/EventDeskPage.module.css'; // Custom CSS for animations and styles

const EventDeskPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    // Function to handle back navigation
    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="container mt-5">
            <Row className="align-items-center mb-4">
                <Col xs={12} md={3} className="d-flex justify-content-start">
                    <Button variant="secondary" className='w-50' onClick={handleGoBack}>Go Back</Button> {/* Go Back Button */}
                </Col>
                <Col xs={12} md={6} className="text-center">
                    <h1 className="section-heading">Event Management</h1>
                </Col>
            </Row>
            <Row className="justify-content-center">
                {/* Card for Event Registration */}
                <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
                    <Card className="event-card shadow animate-card h-100">
                        <Card.Img
                            variant="top"
                            src="https://static.vecteezy.com/system/resources/previews/034/464/554/non_2x/perfect-design-icon-of-event-list-vector.jpg"
                            alt="Event Registration"
                            className="img-fluid"
                            style={{ height: '200px', objectFit: 'cover' }} // Maintain aspect ratio
                        />
                        <Card.Body>
                            <Card.Title className="card-title">Event Registration</Card.Title>
                            <Card.Text className="card-text">
                                Register for upcoming events and stay updated on the latest activities.
                            </Card.Text>
                            <Link to="registration">
                                <Button className="btn-custom" variant="primary" block>
                                    Register Now
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card for Attendance */}
                <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
                    <Card className="event-card shadow animate-card h-100">
                        <Card.Img
                            variant="top"
                            src="https://static.vecteezy.com/system/resources/previews/000/213/458/non_2x/school-kids-studying-in-classroom-vector-illustration.jpg"
                            alt="Attendance"
                            className="img-fluid"
                            style={{ height: '200px', objectFit: 'cover' }} // Maintain aspect ratio
                        />
                        <Card.Body>
                            <Card.Title className="card-title">Attendance</Card.Title>
                            <Card.Text className="card-text">
                                Mark your attendance for the events you participate in.
                            </Card.Text>
                            <Link to="attendance">
                                <Button className="btn-custom" variant="primary" block>
                                    Mark Attendance
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card for Participation */}
                <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
                    <Card className="event-card shadow animate-card h-100">
                        <Card.Img
                            variant="top"
                            src="https://static.vecteezy.com/system/resources/previews/049/793/534/non_2x/fan-support-isolated-cartoon-illustrations-vector.jpg"
                            alt="Participation"
                            className="img-fluid"
                            style={{ height: '200px', objectFit: 'cover' }} // Maintain aspect ratio
                        />
                        <Card.Body>
                            <Card.Title className="card-title">Participation</Card.Title>
                            <Card.Text className="card-text">
                                View your participation in various events and activities.
                            </Card.Text>
                            <Link to="participation">
                                <Button className="btn-custom" variant="primary" block>
                                    View Participation
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EventDeskPage;
