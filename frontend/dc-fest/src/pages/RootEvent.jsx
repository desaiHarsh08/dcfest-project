// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { fetchAvailableEventsBySlug } from "../services/available-events-apis";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Image,
//   Button,
//   Alert,
//   ListGroup,
// } from "react-bootstrap";
// import "../styles/RootEvent.css";
// const RootEvent = () => {
//   const { eventSlug } = useParams();
//   const [event, setEvent] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAvailableEventsBySlug(eventSlug)
//       .then((data) => setEvent(data))
//       .catch((err) => setError(err));
//   }, [eventSlug]);

//   if (error) {
//     return <Alert variant="danger">Error loading event: {error.message}</Alert>;
//   }

//   return (
//     <Container className="my-4">
//       <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
//         ← Back
//       </Button>

//       {event ? (
//         <Card className="p-4 shadow-lg">
//           <Row>
//             <Col md={4}>
//               <Image
//                 src={`/${event?.slug}.jpg`}
//                 alt={event?.title}
//                 className="img-fluid rounded mb-3"
//               />
//             </Col>
//             <Col md={8}>
//               <h1 className="text-primary mb-2">{event?.title}</h1>
//               <h2 className="text-muted mb-3">{event?.oneLiner}</h2>
//               <p>{event?.description}</p>

//               <h3 className="mt-4">Event Details</h3>
//               <Row>
//                 <Col md={6}>
//                   <p>
//                     <strong>Type:</strong> {event?.type}
//                   </p>
//                 </Col>
//                 <Col md={6}>
//                   <p>
//                     <strong>Venue:</strong> {event?.venues[0]?.name || "N/A"}
//                   </p>
//                 </Col>
//                 <Col md={6}>
//                   <p>
//                     <strong>Start:</strong>{" "}
//                     {new Date(event?.venues[0]?.start).toLocaleString() || "N/A"}
//                   </p>
//                 </Col>
//                 <Col md={6}>
//                   <p>
//                     <strong>End:</strong>{" "}
//                     {new Date(event?.venues[0]?.end).toLocaleString() || "N/A"}
//                   </p>
//                 </Col>
//                 <Col md={6}>
//                   <p>
//                     <strong>Max Participants:</strong>{" "}
//                     {event?.maxParticipants || 20}
//                   </p>
//                 </Col>
//                 <Col md={6}>
//                   <p>
//                     <strong>Min Participants:</strong>{" "}
//                     {event?.minParticipants || 1}
//                   </p>
//                 </Col>
//               </Row>

//               <h3 className="text-primary mt-4 mb-3">Event Rules</h3>
//               <ListGroup variant="flush">
//                 {event?.eventRules.map((rule, index) => (
//                   <ListGroup.Item
//                     key={index}
//                     className="d-flex align-items-center justify-content-between py-3 px-4 border-0 bg-white rounded shadow-sm mb-3"
//                     style={{ borderLeft: "4px solid #0d6efd" }}
//                   >
//                     <div className="d-flex align-items-center">
//                       {/* Icon based on rule type */}
//                       <span
//                         className={`me-3 ${
//                           rule.type === "OTSE" ? "text-success" : "text-warning"
//                         }`}
//                       >
//                         {rule.type === "OTSE" ? "✔️" : "ℹ️"}
//                       </span>

//                       <div>
//                         <p className="mb-0 fw-bold text-dark">{rule.type}</p>
//                         <small className="text-muted">{rule.description}</small>
//                       </div>
//                     </div>

//                     {/* Badge or Value */}
//                     <span
//                       className={`badge ${
//                         rule.type === "OTSE" ? "bg-success" : "bg-info"
//                       } text-white px-3 py-2`}
//                       style={{ fontSize: "0.85rem", fontWeight: "600" }}
//                     >
//                       {rule.type === "OTSE" ? "Allowed" : rule.value}
//                     </span>
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>

//               <h3 className="mt-4">Event Rounds</h3>
//               <ListGroup variant="flush">
//                 {event?.rounds.map((round, index) => (
//                   <ListGroup.Item key={index}>
//                     <strong>{round.name}</strong> - {round.roundType}
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>
//             </Col>
//           </Row>
//         </Card>
//       ) : (
//         <section className="dots-container">
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//         </section>
//       )}
//     </Container>
//   );
// };

// export default RootEvent;


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row, ListGroup, Badge } from "react-bootstrap";
import { FaTicketAlt, FaUsers, FaRegClock, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { fetchEventBySlug } from "../services/event-apis";
import EditModal from "./EditModal";

const RootEvent = () => {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEventBySlug(eventSlug)
      .then((data) => setEvent(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [eventSlug]);

  const handleUpdate = (updatedEvent) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      ...updatedEvent,
    }));
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Function to format date and time in AM/PM format
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
    //   weekday: "long", // Day of the week (e.g., Monday)
      year: "numeric", // Year (e.g., 2024)
      month: "long", // Month (e.g., November)
      day: "numeric", // Day (e.g., 14)
      hour: "2-digit", // Hour (e.g., 09)
      minute: "2-digit", // Minute (e.g., 30)
    //   second: "2-digit", // Second (e.g., 05)
      hour12: true, // Use AM/PM format
    });
  };

  return (
    <Container className="py-5">
      {event && (
        <Row>
          {/* Event Image */}
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Img
                variant="top"
                src={`/${event?.slug}.jpg`}
                alt={event?.title}
                className="img-fluid rounded-lg" // Added rounded corners and made image responsive
                style={{ height:"100vh", width:"100vw", objectFit: "cover" }} // Ensures the image looks good within a fixed height
              />
            </Card>
          </Col>

          {/* Event Content */}
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{event?.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{event?.oneLiner}</Card.Subtitle>
                <Card.Text>{event?.description}</Card.Text>
                <hr />
                <div>
                  <h5>Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTicketAlt className="me-2" />
                      <strong>Type:</strong> {event?.type}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Max Participants:</strong> {event?.maxParticipants || 20}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaUsers className="me-2" />
                      <strong>Min Participants:</strong> {event?.minParticipants || 1}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rules</h5>
                  <ListGroup>
                    {event?.eventRules.map((rule, index) => (
                      <ListGroup.Item key={index}>
                        <strong>{rule.eventRuleTemplate.name}:</strong>{" "}
                        {rule.type !== "OTSE" ? (
                          <span>{rule.value}</span>
                        ) : (
                          <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rounds</h5>
                  {event?.rounds.map((round, index) => (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Body>
                        <h6>Round {index + 1}: {round.roundType}</h6>
                        <Badge pill bg="info" className="me-2">{round.roundType}</Badge>
                        <ListGroup variant="flush" className="mt-3">
                          {round?.venues.map((venue, venueIndex) => (
                            <ListGroup.Item key={`venue-${venueIndex}`} className="d-flex justify-content-between">
                              <div>
                                <FaMapMarkerAlt className="me-2" />
                                <strong>{venue.name}</strong>
                              </div>
                              <div>
                                
                                <p><FaRegClock className="me-2" />{formatDateTime(venue.start)}</p>
                                <p><FaRegClock className="me-2" />{formatDateTime(venue.end)}</p>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

    </Container>
  );
};

export default RootEvent;
