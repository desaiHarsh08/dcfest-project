import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row, ListGroup, Badge } from "react-bootstrap";
import { FaTicketAlt, FaUsers, FaRegClock, FaMapMarkerAlt, FaEdit, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import EditModal from "./EditModal";
import { fetchEventBySlug } from "../services/event-apis";
import { AiFillDelete } from "react-icons/ai";
import ConfirmationModal from "../components/event/ConfirmationModal";
import { deleteAvailableEvent } from "../services/available-events-apis";

const EventPage = () => {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCloseRegModal, setOpenCloseRegModal] = useState(false);

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

  const formatDate = (date) => {
    date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Utility function to format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  const handleDeleteEvent = async () => {
    if (!event.id) {
      alert("Unable to find the event!");
      return;
    }
    try {
      const response = await deleteAvailableEvent(event?.id);
      console.log("delete the event:", response);
      console.log(`${event.title} deleted successfully!`);
      navigate(-1);
    } catch (error) {
      alert("Unable to delete the event!");
      console.log(error);
    }
  };

  return (
    <Container className="py-5">
      {/* Back Button */}
      <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4" style={{ height: "38px", width: "89px" }}>
        <FaArrowLeft className="me-2" />
        Back
      </Button>
      {event && (
        <Row>
          {/* Event Image */}
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Img variant="top" src={`/${event?.slug}.jpg`} alt={event?.title} className="img-fluid rounded-lg" style={{ height: "100vh", width: "100vw", objectFit: "cover" }} />
            </Card>
          </Col>

          {/* Event Content */}
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{event?.title}</Card.Title>
                <Card.Subtitle className="mb-4 text-muted my-3 ">
                  <i>&quot;{event?.oneLiner}&quot;</i>
                </Card.Subtitle>
                <Card.Text>{event?.description}</Card.Text>
                <hr />
                <div>
                  <h5 className="my-4">Event Rules</h5>
                  <ListGroup>
                    {event?.eventRules.map((rule, index) => (
                      <ListGroup.Item key={index}>
                        <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
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
                        <h6>
                          Round {index + 1}: {round.roundType}
                        </h6>
                        <Badge pill bg="info" className="me-2">
                          {round.roundType}
                        </Badge>
                        <ListGroup variant="flush" className="mt-3">
                          <ListGroup.Item className="d-fle x justify-content-between align-items-start">
                            <div>
                              <FaMapMarkerAlt className="me-2" />
                              <strong>{round?.venue}</strong>
                            </div>
                            <div>
                              <p>
                                <FaCalendarAlt className="me-2" />
                                {formatDateTime(round?.startTime)} - {formatDateTime(round?.endTime)}
                              </p>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
                <Button variant="primary" onClick={openModal}>
                  <FaEdit className="me-2" /> Edit Event
                </Button>
                <Button variant="danger" onClick={() => setOpenDeleteModal(true)}>
                  <AiFillDelete className="me-2" /> Delete
                </Button>
                <ConfirmationModal
                  show={openDeleteModal}
                  onHide={() => setOpenDeleteModal(false)}
                  onConfirm={handleDeleteEvent}
                  title="Confirm?"
                  message={"Are your sure that you want to delete this event. This process cannot be undone."}
                />
                <Button variant="info" onClick={() => setOpenCloseRegModal(true)}>
                  <AiFillDelete className="me-2" /> Close Registration
                </Button>
                <ConfirmationModal
                  show={openCloseRegModal}
                  onHide={() => setOpenCloseRegModal(false)}
                  onConfirm={() => {}}
                  title="Confirm?"
                  message={"Are your sure that you want to close the registration for this event."}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Edit Modal */}
      <EditModal isOpen={isModalOpen} onClose={closeModal} event={event} onUpdate={handleUpdate} />
    </Container>
  );
};

export default EventPage;
