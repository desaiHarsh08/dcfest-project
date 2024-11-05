import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAvailableEventsBySlug } from "../services/available-events-apis";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Button,
  Alert,
  ListGroup,
} from "react-bootstrap";
import "../styles/RootEvent.css";
const RootEvent = () => {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableEventsBySlug(eventSlug)
      .then((data) => setEvent(data))
      .catch((err) => setError(err));
  }, [eventSlug]);

  if (error) {
    return <Alert variant="danger">Error loading event: {error.message}</Alert>;
  }

  return (
    <Container className="my-4">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
        ← Back
      </Button>

      {event ? (
        <Card className="p-4 shadow-lg">
          <Row>
            <Col md={4}>
              <Image
                src={`/${event.slug}.jpg`}
                alt={event.title}
                className="img-fluid rounded mb-3"
              />
            </Col>
            <Col md={8}>
              <h1 className="text-primary mb-2">{event.title}</h1>
              <h2 className="text-muted mb-3">{event.oneLiner}</h2>
              <p>{event.description}</p>

              <h3 className="mt-4">Event Details</h3>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Type:</strong> {event.type}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Venue:</strong> {event.venues[0]?.name || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(event.venues[0]?.start).toLocaleString() || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(event.venues[0]?.end).toLocaleString() || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Max Participants:</strong>{" "}
                    {event.maxParticipants || 20}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Min Participants:</strong>{" "}
                    {event.minParticipants || 1}
                  </p>
                </Col>
              </Row>

              <h3 className="text-primary mt-4 mb-3">Event Rules</h3>
              <ListGroup variant="flush">
                {event.eventRules.map((rule, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-center justify-content-between py-3 px-4 border-0 bg-white rounded shadow-sm mb-3"
                    style={{ borderLeft: "4px solid #0d6efd" }}
                  >
                    <div className="d-flex align-items-center">
                      {/* Icon based on rule type */}
                      <span
                        className={`me-3 ${
                          rule.type === "OTSE" ? "text-success" : "text-warning"
                        }`}
                      >
                        {rule.type === "OTSE" ? "✔️" : "ℹ️"}
                      </span>

                      <div>
                        <p className="mb-0 fw-bold text-dark">{rule.type}</p>
                        <small className="text-muted">{rule.description}</small>
                      </div>
                    </div>

                    {/* Badge or Value */}
                    <span
                      className={`badge ${
                        rule.type === "OTSE" ? "bg-success" : "bg-info"
                      } text-white px-3 py-2`}
                      style={{ fontSize: "0.85rem", fontWeight: "600" }}
                    >
                      {rule.type === "OTSE" ? "Allowed" : rule.value}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h3 className="mt-4">Event Rounds</h3>
              <ListGroup variant="flush">
                {event.rounds.map((round, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{round.name}</strong> - {round.roundType}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </Card>
      ) : (
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
      )}
    </Container>
  );
};

export default RootEvent;
