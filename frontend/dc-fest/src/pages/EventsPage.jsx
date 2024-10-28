import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import EventCard from "../components/events/EventCard";
import { fetchAvailableEvents } from "../services/available-events-apis";
import { fetchCollegeByIcCode } from "../services/college-apis";

const EventsPage = () => {
  const { categorySlug, iccode } = useParams();
  const [events, setEvents] = useState([]);
  const [college, setCollege] = useState();
  const [error, setError] = useState(null); // State to hold any fetch errors
  const navigate = useNavigate();

  useEffect(() => {
    getCollege();

    fetchAvailableEvents()
      .then((data) => setEvents(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [categorySlug]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      setCollege(response);
    } catch (error) {
      console.log(error);
      alert('Unable to fetch college data');
    }
  }

  return (
    <Container>
      {/* Breadcrumbs */}
      <Row>
        <Col>
          <nav aria-label="breadcrumb" className="mt-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to={iccode ? `/${iccode}` : "/home"}>Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={iccode ? `/${iccode}/categories` : "/home/categories"}>Categories</Link>
              </li>
            </ol>
          </nav>
        </Col>
      </Row>

      {/* Page Title */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mt-5">
            List of Star Events for UMANG 2024
          </h1>
        </Col>
      </Row>

      {/* Events List */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {events.map((event, index) => (
          <EventCard key={`event-${index}`} event={event} college={college} />
        ))}
      </Row>
    </Container>
  );
};

export default EventsPage;
