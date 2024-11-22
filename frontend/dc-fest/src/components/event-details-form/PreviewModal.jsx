/* eslint-disable react/prop-types */
import { Modal, Button, Card, ListGroup, Badge, Row, Col } from "react-bootstrap";
import { FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const PreviewModal = ({ show, event, onClose, onConfirm, formType = "Add", isLoading }) => {
  console.log(formType);
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    console.log(dateTime);
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
                    </ListGroup>
                  </div>
                  <hr />
                  <div>
                    <h5>Event Rules</h5>
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
                    {/* <ListGroup>
                      <h5>NOTE:</h5>
                      {event?.eventRules.map((rule, index) => {
                        if (rule.eventRuleTemplate.name.toLowerCase() == "note") {
                          return (
                            <ListGroup.Item key={index}>
                              <RTE defaultValue={rule.value} onChange={() => {}} />
                            </ListGroup.Item>
                          );
                        }
                      })}
                    </ListGroup> */}
                    <ListGroup>
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
                                <ListGroup.Item className="d-fle x justify-content-between align-items-start">
                                  <div>
                                    <FaMapMarkerAlt className="me-2" />
                                    <strong>{round?.venue}</strong>
                                  </div>
                                  <div>
                                    <p>
                                      <FaCalendarAlt className="me-2" />
                                      {formatDateTime(formType.toLowerCase() == "add" ? `${round?.startTime}` : round.startTime)} -{" "}
                                      {formatDateTime(formType.toLowerCase() == "add" ? `${round?.endTime}` : round?.endTime)}
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
