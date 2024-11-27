import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Badge, Card, ListGroup, Modal, Form } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import { createParticipants, deleteParticipant, fetchParticipantsByEventIdAndCollegeId, updateParticipant } from "../services/participants-api";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchEventById } from "../services/event-apis";
import styles from "../styles/CollegeEvent.module.css";
import { FaMapMarkerAlt, FaRegClock, FaTicketAlt } from "react-icons/fa";
import { fetchCollegeByIcCode } from "../services/college-apis";

const CollegeEvent = () => {
  const { iccode, eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [availableEvent, setAvailableEvent] = useState();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  const [show, setShow] = useState(false);
  const [addFlag, setAddFlag] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [college, setCollege] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [selectedParticipant, setSelectedParticipant] = useState();

  useEffect(() => {
    fetchEventById(eventId)
      .then((data) => {
        fetchAvailableEventsById(data.availableEventId).then((data) => setAvailableEvent(data));
      })
      .catch((err) => console.log(err));
  }, [eventId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchCollegeByIcCode(iccode);
        console.log("college:", response);
        setCollege(response);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (college) {
      getParticipants();
    }
  }, [college]);

  const getParticipants = async () => {
    try {
      const response = await fetchParticipantsByEventIdAndCollegeId(eventId, college.id);
      setParticipants(response);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (id) => {
    setLoading(true);
    setDeletingId(id);
    try {
      await deleteParticipant(id);
      alert("Participant Deleted Successfully!");
      setParticipants(participants.filter((participant) => participant.id !== id));
      getParticipants();
    } catch (error) {
      alert("Unable to delete the participant. Please try again later.");
      console.log(error);
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateTime) => {
    console.log("in format date time:", dateTime);
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

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedParticipant((prev) => ({ ...prev, [name]: value }));
    isValidDetails();
  };

  // Function to validate participant details

  const isValidDetails = (isSubmitting) => {
    console.log("I m in is validdetails", availableEvent);
    if (!availableEvent || !availableEvent.eventRules) {
      setIsValid(false);
      return false;
    }

    let newParticipants = [];
    // if (availableEvent.type.toUpperCase() == "INDIVIDUAL") {
    //   newParticipants = [selectedParticipant];
    // } else {
    //   const minParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MIN_PARTICIPANTS").value;
    //   const maxParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS").value;
    //   if (minParticipants == maxParticipants) {
    //     newParticipants = participants.map((p) => {
    //       if (p.id == selectedParticipant.id && p.type == "PERFORMER") {
    //         return selectedParticipant;
    //       }
    //       return p;
    //     });
    //   } else {
    //     newParticipants = [...participants, selectedParticipant];
    //   }
    // }
    if (selectedParticipant.id) {
      newParticipants = participants.map((p) => {
        if (p.id == selectedParticipant.id) {
          return selectedParticipant;
        }
        return p;
      });
    } else {
      newParticipants = [...participants, selectedParticipant];
    }

    console.log("newParticipants:", newParticipants);
    console.log("selectedParticipant:", selectedParticipant);

    for (const participant of newParticipants) {
      if (!participant.name.trim() || !participant.email.trim() || !participant.whatsappNumber.trim()) {
        console.log("in loop, empty field");
        setIsValid(false);
        return false;
      }
    }

    if (selectedParticipant.whatsappNumber.length > 11 || selectedParticipant.whatsappNumber.length < 10) {
      setIsValid(false);
      if (isSubmitting) {
        alert(`Please provide a valid number, currently ${selectedParticipant.whatsappNumber.length}!`);
      }
      return false;
    }

    for (const rule of availableEvent.eventRules) {
      const ruleValue = Number(rule.value);
      console.log(rule.eventRuleTemplate.name, ruleValue);
      switch (rule.eventRuleTemplate.name) {
        case "MIN_PARTICIPANTS":
          if (newParticipants.filter((p) => p.type == "PERFORMER").length < ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be minimum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MAX_PARTICIPANTS":
          console.log("MAX_PARTICIPANTS:", newParticipants.filter((p) => p.type == "PERFORMER").length);
          if (newParticipants.filter((p) => p.type == "PERFORMER").length > ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be maximum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MALE_PARTICIPANTS":
          if (newParticipants.filter((p) => p.male).length !== ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be ${ruleValue} MALE participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "FEMALE_PARTICIPANTS":
          if (newParticipants.filter((p) => !p.male).length !== ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be female ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "COLLEGE_ACOMPANIST":
          if (newParticipants.filter((p) => !p.type == "ACCOMPANIST").length !== ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be ${ruleValue} accompanist!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        default:
          break;
      }
    }
    setIsValid(true);
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Im in handle Save", isValid);
    if (!isValidDetails(true)) {
      return;
    }

    console.log("here in after if");
    setLoadingSave(true);
    try {
      const response = await updateParticipant(selectedParticipant);
      console.log(response);
      getParticipants();
      setParticipants(
        participants.map((p) => {
          if (p.id == selectedParticipant.id) {
            return selectedParticipant;
          }
          return p;
        })
      );
      handleClose();
    } catch (error) {
      console.log(error);
      alert("Unable to save the changes... please try again later!");
    } finally {
      setAddFlag(false);
      setLoadingSave(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!isValidDetails(true)) {
      alert("Please provide the correct participant entries... check the rules");
      return;
    }

    console.log(selectedParticipant);

    const newParticipant = { ...selectedParticipant, collegeId: participants[0].collegeId };
    console.log(newParticipant);
    setLoadingSave(true);
    try {
      const response = await createParticipants(newParticipant);
      console.log(response);

      setParticipants([...participants, newParticipant]);
      getParticipants();
      handleClose();
    } catch (error) {
      console.log(error);
      alert("Unable to save the changes... please try again later!");
    } finally {
      setAddFlag(false);
      setLoadingSave(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Container fluid className="mt-4">
        {/* Back to Home Button */}
        <Row className="mb-4">
          <Col>
            <Link to={`/${iccode}`} className="btn btn-outline-primary" style={{ textDecoration: "none" }}>
              &larr; Back to Home
            </Link>
          </Col>
        </Row>

        {/* Event Details Section */}
        <Row>
          <Col md={3}>
            {/* <div className={`${styles["event-card"]} shadow rounded`}>
              <div className={`${styles["banner"]}`}>
                <img src={`/${availableEvent?.slug}.jpg`} alt="Event" className={`${styles["event-image"]} rounded`} />
              </div>
              <div className="p-4">
                <h4 className="fw-bold text-primary">{availableEvent?.title}</h4>
                <Badge bg="primary" className={`${styles["badge-gradient"]} mb-3`}>
                  {availableEvent?.type}
                </Badge>
                <p className="text-muted">
                  <i>{availableEvent?.oneLiner}</i>
                </p>
                <p>{availableEvent?.description}</p>

                {availableEvent?.rounds?.map((round) => (
                  <div key={round.id} className="mb-3">
                    <p>
                      <strong>Round:</strong> {round.roundType}
                    </p>
                    <p>
                      <strong>Venue:</strong> {round.venue}
                    </p>
                    <p>
                      <strong>Start:</strong> {new Date(round.startTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>End:</strong> {new Date(round.endTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div> */}
            <Card className="border-0 shadow-sm py-3" style={{ background: "linear-gradient(135deg,#007bff,#004080)" }}>
              <Card.Img
                variant="top"
                src={`/${availableEvent?.slug}.jpg`}
                alt={availableEvent?.title}
                className="img-fluid rounded-lg" // Added rounded corners and made image responsive
                style={{ height: "200px", objectFit: "contain" }} // Ensures the image looks good within a fixed height
              />
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{availableEvent?.title}</Card.Title>
                <Card.Subtitle className="my-3 text-muted" style={{ fontStyle: "italic" }}>
                  {availableEvent?.oneLiner}
                </Card.Subtitle>
                <Card.Text>{availableEvent?.description}</Card.Text>
                <hr />
                <div>
                  <h5>Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTicketAlt className="me-2" />
                      <strong>Type:</strong> {availableEvent?.type}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rules</h5>
                  <ListGroup>
                    {availableEvent?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate?.name?.toLowerCase().includes("otse")) {
                        return null;
                      }
                      if (rule.eventRuleTemplate?.name?.toLowerCase() != "note") {
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
                  <h5 className="my-4">NOTE:</h5>
                  <ListGroup>
                    {availableEvent?.eventRules.map((rule, index) => {
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
                  {availableEvent?.rounds.map((round, index) => (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Body>
                        <h6>
                          Round {index + 1}: {round.roundType == "SEMI_FINAL" ? "PRELIMS" : round.roundType}
                        </h6>
                        <Badge pill bg="info" className="me-2">
                          {round.roundType}
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
                                {formatDateTime(round?.startTime)}
                              </p>
                              <p>
                                <FaRegClock className="me-2" />
                                {formatDateTime(round?.endTime)}
                              </p>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Participants Section */}
          <Col md={9}>
            <div className={`${styles["participants-section"]} shadow p-4 rounded`}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <h4 className="text-secondary">Participants</h4>
                  {participants.length > 0 &&
                    availableEvent &&
                    availableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value > participants.filter((p) => p.type == "PERFORMER").length && (
                      <button
                        type="button"
                        className="btn border btn-primary"
                        onClick={() => {
                          handleShow();
                          console.log("fired");
                          setAddFlag(true);
                          setSelectedParticipant({
                            name: "",
                            email: "",
                            whatsappNumber: "",
                            male: true,
                            collegeId: null,
                            type: "PERFORMER",
                            entryType: "NORMAL",
                            eventIds: [eventId],
                          });
                        }}
                      >
                        Add Participant
                      </button>
                    )}
                  {participants.length > 0 &&
                    availableEvent &&
                    availableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value > participants.filter((p) => p.type == "ACCOMPANIST").length && (
                      <button
                        type="button"
                        className="btn border btn-primary"
                        onClick={() => {
                          handleShow();
                          console.log("fired");
                          setAddFlag(true);
                          setSelectedParticipant({
                            name: "",
                            email: "",
                            whatsappNumber: "",
                            male: true,
                            collegeId: null,
                            type: "ACCOMPANIST",
                            entryType: "NORMAL",
                            eventIds: [eventId],
                          });
                        }}
                      >
                        Add Accompanist
                      </button>
                    )}
                </div>
                {college && participants.length == 0 && (
                  <Link to={"add"} className="btn btn-success shadow-sm" style={{ textDecoration: "none" }}>
                    + Add Participant
                  </Link>
                )}
              </div>

              {/* Participants Table */}
              <Table bordered hover responsive className="table-striped">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Entry</th>
                    <th>Ranking</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td>{index + 1}.</td>
                        <td>{participant.name}</td>
                        <td>{participant.email}</td>
                        <td style={{ minWidth: "147px" }}>{participant.whatsappNumber}</td>
                        <td>
                          <Badge bg={participant.type != "PERFORMER" ? "warning" : "info"}>{participant.type}</Badge>
                        </td>
                        <td>
                          <Badge bg={participant.entryType == "NORMAL" ? "light text-dark border border-secondary" : "secondary"}>{participant.entryType}</Badge>
                        </td>
                        <td>{participant.ranking || "-"}</td>
                        <td>
                          {(availableEvent?.eventRules?.find((r) => r.eventRuleTemplate.name === "MIN_PARTICIPANTS")?.value < participants.filter((p) => p.type === "PERFORMER").length ||
                            participant.type === "ACCOMPANIST") && (
                            <Button
                              variant={deletingId === participant.id ? "secondary" : "danger"}
                              onClick={() => handleDelete(participant.id)}
                              size="sm"
                              disabled={loading && deletingId === participant.id}
                            >
                              {loading && deletingId === participant.id ? "Deleting..." : "Delete"}
                            </Button>
                          )}

                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              handleShow();
                              setSelectedParticipant(participant);
                              setAddFlag(false);
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No participants yet. Add the first one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={show} centered size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{addFlag ? "Add" : "Edit"} Participants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="w-100">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={selectedParticipant?.name} onChange={handleEditFormChange} required className="w-100" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={selectedParticipant?.email} onChange={handleEditFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name="whatsappNumber" value={selectedParticipant?.whatsappNumber} onChange={handleEditFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="radio"
                label="Male"
                name={`male`} // Unique name for each participant's radio group
                checked={selectedParticipant?.male}
                onChange={(e) => handleEditFormChange({ target: { name: "male", value: true } })}
              />
              <Form.Check
                type="radio"
                label="Female"
                name={`male`} // Same unique name for the pair
                checked={!selectedParticipant?.male}
                onChange={(e) => handleEditFormChange({ target: { name: "male", value: false } })}
              />
            </Form.Group>

            <Form.Group className="mb-5">
              {console.log(
                "college_accompanist: ",
                availableEvent?.eventRules.find((rule) => rule.name == "COLLEGE_ACCOMPANIST")
              )}
              <Form.Select
                aria-label="Default select example"
                name="type"
                value={selectedParticipant?.type}
                onChange={handleEditFormChange}
                //   disabled={!availableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
                disabled
              >
                <option value={"ACCOMPANIST"}>ACCOMPANIST</option>
                <option value={"PERFORMER"}>PERFORMER</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loadingSave}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={loadingSave}
            onClick={(e) => {
              if (!addFlag) {
                handleSave(e);
              } else {
                handleAdd(e);
              }
            }}
          >
            {loadingSave ? "Please Wait..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CollegeEvent;
