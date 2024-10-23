import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import EventCard from "../components/events/EventCard";
import { fetchAvailableEvents } from "../services/available-events-apis";

const EventsPage = () => {
  const { categorySlug } = useParams();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null); // State to hold any fetch errors

  useEffect(() => {
    fetchAvailableEvents()
      .then((data) => setEvents(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [categorySlug]);

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mt-5">
            List of Star Events for UMANG 2024
          </h1>
        </Col>
      </Row>
      <Row xs={1} md={2} lg={3} className="g-4">
        {events.map((event, index) => (
          <EventCard key={`event-${index}`} event={event} />
        ))}
      </Row>
    </Container>
  );
};

export default EventsPage;
