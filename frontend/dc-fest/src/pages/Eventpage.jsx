import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row, ListGroup, Badge } from "react-bootstrap";
import { FaMapMarkerAlt, FaEdit, FaArrowLeft, FaCalendarAlt, FaRegClock } from "react-icons/fa";
import EditModal from "../components/event/EditModal";
import { fetchEventBySlug } from "../services/event-apis";
import { AiFillDelete } from "react-icons/ai";
import ConfirmationModal from "../components/event/ConfirmationModal";
import { deleteAvailableEvent, toggleAvailableEventRegistration, toggleAvailableEventActive } from "../services/available-events-apis";

const EventPage = () => {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCloseRegModal, setOpenCloseRegModal] = useState(false);
  const [openToggleActiveModal, setOpenToggleActiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Admin route under /home should include inactive
    const includeInactive = true;
    fetchEventBySlug(eventSlug, includeInactive)
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
    const msg = error?.response?.data?.message || error?.message || "Failed to load event";
    return <p className="text-danger">{msg}</p>;
  }

  // Function to format time only
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Function to format date only
  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteEvent = async () => {
    if (!event.id) {
      alert("Unable to find the event!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await deleteAvailableEvent(event?.id);
      console.log("delete the event:", response);
      console.log(`${event.title} deleted successfully!`);
      navigate(-1);
    } catch (error) {
      alert("Unable to delete the event!");
      console.log(error);
    } finally {
      setIsLoading(true);
      setOpenDeleteModal(false);
    }
  };

  const handleCloseRegistration = async (event) => {
    setIsLoading(true);
    try {
      const response = await toggleAvailableEventRegistration(event.id);
      console.log("toggled reg, response:", response);
      console.log("New closeRegistration status:", response.closeRegistration);
      setEvent(response);
      console.log("Event state updated");
      // Remove alert since we have modal confirmation
    } catch (error) {
      console.log(error);
      alert("Oops! Unable to toggle the registration.");
    } finally {
      setIsLoading(false);
      setOpenCloseRegModal(false);
    }
  };

  const handleToggleActive = async (event) => {
    setIsLoading(true);
    try {
      const response = await toggleAvailableEventActive(event.id);
      setEvent(response);
    } catch (error) {
      console.log(error);
      alert("Unable to toggle active state.");
    } finally {
      setIsLoading(false);
      setOpenToggleActiveModal(false);
    }
  };

  //   const handleCloseRegistration = async () => {
  //     setIsLoading(true);
  //     try {
  //       const newEvent = { ...event };
  //       if (newEvent.closeRegistration) {
  //         newEvent.closeRegistration = false;
  //       } else {
  //         newEvent.closeRegistration = true;
  //       }
  //       const response = await updateAvailableEvent(newEvent);
  //       console.log("closed registration:", response);
  //       setEvent(newEvent);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsLoading(false);
  //       setOpenCloseRegModal(false);
  //     }
  //   };

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
              <Card.Img variant="top" src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}/${event?.slug}.jpg`} alt={event?.title} className="img-fluid rounded-lg" style={{ height: "100vh", width: "100vw", objectFit: "cover" }} />
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
                  <h5>Event Master</h5>
                  <p className="m-0 p-0">{event?.eventMaster}</p>
                  <p className="m-0 p-0">{event?.eventMasterPhone}</p>
                </div>
                <hr />
                <div>
                  <h5>Judges</h5>
                  <ul className="p-0">
                    {event?.judges.map((judge, index) => (
                      <li key={`judge-${index}`} className="d-flex gap-2">
                        <p>{index + 1}.</p>
                        <p>{judge?.name}</p>
                        <p>{judge?.phone}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <hr />
                <div>
                  <h5 className="my-4">Event Rules</h5>
                  <ListGroup>
                    {event?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate.name.toLowerCase() != "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup>
                </div>
                <div>
                  {/* <ListGroup>
                    <h5 className="my-4">NOTE:</h5>
                    {event?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate.name.toLowerCase() == "note") {
                        return (
                          <ListGroup.Item key={index}>
                            {++srno}. <span>{rule.value}</span>
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup> */}
                  <ListGroup>
                    <h5 className="my-4">NOTE:</h5>
                    {event?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate.name.toLowerCase() === "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <span dangerouslySetInnerHTML={{ __html: rule.value }} />
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rounds</h5>
                  {event?.rounds.map((round, index) => (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Body>
                        <h6>
                          Round {index + 1}: {round?.roundType}
                        </h6>
                        <Badge pill bg="info" className="me-2">
                          {round?.roundType}
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
                                <strong>Date:</strong> {formatDate(round?.startTime)}
                              </p>
                              <p>
                                <FaRegClock className="me-2" />
                                <strong>Start:</strong> {formatTime(round?.startTime)}
                              </p>
                              <p>
                                <FaRegClock className="me-2" />
                                <strong>End:</strong> {formatTime(round?.endTime)}
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
                  isLoading={isLoading}
                  onHide={() => setOpenDeleteModal(false)}
                  onConfirm={handleDeleteEvent}
                  title="Confirm?"
                  message={"Are your sure that you want to delete this event. This process cannot be undone."}
                />
                <Button variant={event?.closeRegistration ? "success" : "info"} onClick={() => setOpenCloseRegModal(true)}>
                  {event?.closeRegistration ? "Open Registration" : "Close Registration"}
                </Button>
                <Button className="ms-2" variant={event?.active ? "secondary" : "primary"} onClick={() => setOpenToggleActiveModal(true)}>
                  {event?.active ? "Deactivate" : "Activate"}
                </Button>
                <ConfirmationModal
                  show={openCloseRegModal}
                  onHide={() => setOpenCloseRegModal(false)}
                  onConfirm={() => handleCloseRegistration(event)}
                  isLoading={isLoading}
                  title="Confirm?"
                  message={`Are you sure that you want to ${event?.closeRegistration ? "open" : "close"} the registration for this event?`}
                />
                <ConfirmationModal
                  show={openToggleActiveModal}
                  onHide={() => setOpenToggleActiveModal(false)}
                  onConfirm={() => handleToggleActive(event)}
                  isLoading={isLoading}
                  title="Confirm?"
                  message={`Are you sure that you want to ${event?.active ? "deactivate" : "activate"} this event?`}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Edit Modal */}
      <EditModal isOpen={isModalOpen} setEvent={setEvent} onClose={closeModal} event={event} onUpdate={handleUpdate} />
    </Container>
  );
};

export default EventPage;
