import { Card, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/EventDeskPage.module.css"; // Custom CSS for animations and styles
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const EventDeskPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const { user } = useContext(AuthContext);

  // Function to handle back navigation
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container mt-5">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3} className="d-flex justify-content-start">
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
        </Col>
        <Col xs={12} md={6} className="text-center">
          <h1 className="section-heading">Event Management</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        {/* Card for Event Registration */}
        {(user?.type == "ADMIN" || user?.type == "REGISTRATION_DESK") && (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
            <Card className="event-card shadow animate-card h-100 w-100">
              <Card.Img
                variant="top"
                src="https://static.vecteezy.com/system/resources/previews/034/464/554/non_2x/perfect-design-icon-of-event-list-vector.jpg"
                alt="Event Registration"
                className="img-fluid"
                style={{ height: "200px", objectFit: "cover" }} // Maintain aspect ratio
              />
              <Card.Body className="d-flex justify-content-center align-items-center text-decoration-none flex-column">
                <Card.Title className="card-title">Event Registration</Card.Title>
                <Card.Text className="card-text">Register for upcoming events and stay updated on the latest activities.</Card.Text>
                <Link to="registration" className="d-flex justify-content-center align-items-center text-decoration-none">
                  <Button className="btn-custom" variant="primary" block>
                    Register Now
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Card for Attendance */}
        {(user?.type == "ADMIN" || user?.type == "ATTENDANCE_DESK" || user?.type == "REGISTRATION_DESK") && (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
            <Card className="event-card shadow animate-card h-100 w-100">
              <Card.Img
                variant="top"
                src="https://static.vecteezy.com/system/resources/previews/000/213/458/non_2x/school-kids-studying-in-classroom-vector-illustration.jpg"
                alt="Attendance"
                className="img-fluid"
                style={{ height: "200px", objectFit: "cover" }} // Maintain aspect ratio
              />
              <Card.Body className="d-flex justify-content-center align-items-center text-decoration-none flex-column">
                <Card.Title className="card-title text-center">Attendance</Card.Title>
                <Card.Text className="card-text text-center">Mark your attendance for the events you participate in.</Card.Text>
                <Link to="attendance" className="d-flex justify-content-center align-items-center text-decoration-none">
                  <Button className="btn-custom" variant="primary" block>
                    Mark Attendance
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Card for Participation */}
        {(user?.type == "ADMIN" || user?.type == "REGISTRATION_DESK") && (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
            <Card className="event-card shadow animate-card h-100 w-100">
              <Card.Img
                variant="top"
                src="https://static.vecteezy.com/system/resources/previews/049/793/534/non_2x/fan-support-isolated-cartoon-illustrations-vector.jpg"
                alt="Participation"
                className="img-fluid"
                style={{ height: "200px", objectFit: "cover" }} // Maintain aspect ratio
              />
              <Card.Body className="d-flex justify-content-center align-items-center text-decoration-none flex-column">
                <Card.Title className="card-title text-center">Participation</Card.Title>
                <Card.Text className="card-text text-center">View your participation in various events and activities.</Card.Text>
                <Link to="participation" className="d-flex justify-content-center align-items-center text-decoration-none">
                  <Button className="btn-custom" variant="primary" block>
                    View Participation
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default EventDeskPage;
