/* eslint-disable react/prop-types */
import { Modal, Button, Card, ListGroup, Badge, Row, Col } from "react-bootstrap";
import { FaTicketAlt, FaUsers, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";

const PreviewModal = ({ show, event, onClose, onConfirm, isLoading }) => {
  // Function to format date and time in AM/PM format
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Event Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {event && (
          <Row className="w-100">
            {/* Event Content */}
            <Col className="col-12">
              <Card className="mb-4">
                <Card.Body>
                  <Card.Text>
                    Note: Event&apos;s banner: <strong>{event?.slug}.jpg</strong>
                  </Card.Text>
                  <Card.Title className="h1">{event?.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted" style={{ fontStyle: "italic" }}>
                    {event?.oneLiner}
                  </Card.Subtitle>
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
                          <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                  <hr />
                  <div>
                    <h5>Event Rounds</h5>
                    {event?.rounds.map((round, index) => {
                      if (round?.venue.trim() != "") {
                        return (
                          <Card key={index} className="mb-3 shadow-sm">
                            <Card.Body>
                              <h6>
                                Round {index + 1}: {round?.roundType}
                              </h6>
                              <Badge pill bg="info" className="me-2">
                                {round?.roundType}
                              </Badge>
                              <ListGroup variant="flush" className="mt-3">
                                <ListGroup.Item className="d-flex justify-content-between">
                                  <div>
                                    <FaMapMarkerAlt className="me-2" />
                                    <strong>{round?.venue}</strong>
                                  </div>
                                  <div>
                                    <p>
                                      <FaRegClock className="me-2" />
                                      {/* {round?.startDate} {round?.startTime} */}
                                    </p>
                                    <p>
                                      <FaRegClock className="me-2" />
                                      {/* {round?.endDate} {round?.endTime} */}
                                    </p>
                                  </div>
                                </ListGroup.Item>
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        );
                      }
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={onConfirm}>
          {isLoading ? "Please wait..." : "Confirm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
