/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchParticipationEventsByCollegeId } from "../../services/college-participation-apis";
import { fetchCollegeByIcCode } from "../../services/college-apis";
import { AuthContext } from "../../providers/AuthProvider";
import BasicDetailsForm from "./BasicDetailsForm";
import CollegeParticipation from "./CollegeParticipation";
import EventsTable from "./EventsTable";
import ResetPasswordPage from "../../pages/ResetPasswordPage";
import Navbar from "../Navbar/Navbar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaHome, FaPlus, FaUserTie } from "react-icons/fa";

const DeskLayout = () => {
  const { iccode } = useParams();
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  const [college, setCollege] = useState();
  const [events, setEvents] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

  useEffect(() => {
    getCollege();
  }, [iccode, showResetPasswordForm]);

  useEffect(() => {
    if (college?.id) {
      console.log("College:", college);
      fetchParticipationEventsByCollegeId(college.id)
        .then((data) => {
          console.log("college's participation:", data);
          setEvents(data);
          setParticipation(data);
        })
        .catch((err) => console.log(err));
    }
  }, [college]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      setCollege(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (event) => {
    console.log("View Event:", event);
  };

  const handleRemove = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
  };

  return (
    <>
      {college && !college?.detailsUploaded ? (
        <BasicDetailsForm college={college} setCollege={setCollege} setShowResetPasswordForm={setShowResetPasswordForm} getCollege={getCollege} />
      ) : (
        <>
          <Navbar />
          <Container fluid className="py-3">
            {iccode && !(pathname.endsWith(`/${iccode}`) || pathname.endsWith(`/${iccode}/`)) && (
              <div className="mb-3">
                <Link to={`/${iccode}`} className="btn btn-outline-primary">
                  <FaHome className="me-2" /> Home
                </Link>
              </div>
            )}

            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary">{college?.name}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">Represented by:</Card.Subtitle>
                <ul className="list-unstyled">
                  {college?.representatives.map((rep) => (
                    <li key={`rep-${rep.id}`} className="mb-2">
                      <FaUserTie className="me-2 text-secondary" />
                      <strong>{rep.name}</strong> - {rep.email}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>

            {college && (
              <Row>
                <Col xs={12} className="mb-4">
                  <CollegeParticipation participations={participation}  />
                </Col>
              </Row>
            )}

            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">Events List</h4>
                <Link to={"categories"} className="btn btn-success" style={{ textDecoration: "none" }}>
                  <FaPlus className="me-2" /> Enroll Event
                </Link>
              </Card.Header>
              <Card.Body>
                <EventsTable events={events} onView={handleView} onRemove={handleRemove} />
              </Card.Body>
            </Card>
          </Container>
        </>
      )}
    </>
  );
};

export default DeskLayout;
