import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Badge, Card, ListGroup, Modal, Form } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import { createParticipants, deleteParticipant, fetchParticipantsByEventIdAndCollegeId, fetchSlotsOccupiedForEvent, updateParticipant } from "../services/participants-api";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchEventById } from "../services/event-apis";
import styles from "../styles/CollegeEvent.module.css";
import { FaMapMarkerAlt, FaRegClock, FaTicketAlt } from "react-icons/fa";
import { fetchCollegeByIcCode } from "../services/college-apis";
import { fetchParticipationsByAvailableEventId } from "../services/college-participation-apis";

const participantObj = {
  name: "",
  email: "",
  whatsappNumber: "",
  male: true,
  collegeId: null,
  type: "PERFORMER",
  entryType: "NORMAL",
  eventIds: [],
};

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
  const [slotsOccupied, setSlotsOccupied] = useState();
  const [college, setCollege] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [selectedParticipant, setSelectedParticipant] = useState(participantObj);

  useEffect(() => {
    fetchEventById(eventId)
      .then((data) => {
        fetchAvailableEventsById(data.availableEventId).then((data) => {
          setAvailableEvent(data);
          getSlotsOccupied();
        });
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

  const getSlotsOccupied = async () => {
    try {
      console.log("here fetching, eventId:", eventId);
      const response = await fetchSlotsOccupiedForEvent(eventId);
      console.log("response:", availableEvent?.title, response);
      setSlotsOccupied(response);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch the details!");
    }
  };

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
    const tmpParticipant = participants.find((p) => p.id == id);
    const isConfirm = confirm(`Are you sure that you want to delete "${tmpParticipant?.name}"?`);
    if (!isConfirm) {
      return;
    }

    setLoading(true);
    setDeletingId(id);
    if (!handleRuleChecks(true, id)) {
      console.log("Please read the rules...");
      return;
    }
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
    console.log(`in change, ${name}: ${value}`);
    setSelectedParticipant((prev) => {
      if (name == "male") {
        console.log({ ...prev, male: Boolean(value) });
        return { ...prev, male: Boolean(value) };
      }
      console.log({ ...prev, [name]: value });
      return { ...prev, [name]: value };
    });
  };

  const handleRuleChecks = (isSubmitting, deleteParticipantId) => {
    if (participants.length == 0 || !selectedParticipant || !availableEvent) {
      return;
    }

    console.log("in handleRuleChecks(), prev, participants:", participants);
    let newParticipants = [];
    if (selectedParticipant.id) {
      newParticipants = participants.map((p) => {
        if (p.id == selectedParticipant.id) {
          return selectedParticipant;
        }
        return p;
      });
    } else {
      // New entry
      newParticipants = [...participants, selectedParticipant];
    }

    if (deleteParticipantId) {
      newParticipants = participants.filter((p) => p.id != deleteParticipantId);
    }

    console.log("in handleRuleChecks(), after, newParticipants:", newParticipants);

    // Check for whatsapp_no.
    if (!deleteParticipantId && (selectedParticipant?.whatsappNumber.length > 11 || selectedParticipant?.whatsappNumber.length < 10)) {
      setIsValid(false);
      if (isSubmitting) {
        alert(`Please provide a valid number, currently ${selectedParticipant.whatsappNumber.length}!`);
      }
      return false;
    }

    // Check for blank field
    if (!deleteParticipantId) {
      for (const participant of newParticipants) {
        if (!participant.name.trim() || !participant.email.trim() || !participant?.whatsappNumber.trim()) {
          console.log("in loop, empty field");
          setIsValid(false);
          return false;
        }
      }
    }

    // Check for rules
    for (const rule of availableEvent.eventRules) {
      const ruleValue = Number(rule.value);
      switch (rule.eventRuleTemplate.name) {
        case "MIN_PARTICIPANTS":
          console.log("in case, MIN_PARTICIPANTS, newParticipants.filter((p) => p.type == 'PERFORMER').length:", newParticipants.filter((p) => p.type == "PERFORMER").length, "ruleValue:", ruleValue);
          if (deleteParticipantId) {
            if (newParticipants.filter((p) => p.type == "PERFORMER").length < ruleValue) {
              if (isSubmitting) {
                alert(`Oops... There should be minimum ${ruleValue} participants!`);
              }
              setIsValid(false);
              return false;
            }
          }
          break;

        case "MAX_PARTICIPANTS":
          console.log("in case, MAX_PARTICIPANTS, newParticipants.filter((p) => p.type == 'PERFORMER').length:", newParticipants.filter((p) => p.type == "PERFORMER").length, "ruleValue:", ruleValue);
          if (newParticipants.filter((p) => p.type == "PERFORMER").length > ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be maximum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MALE_PARTICIPANTS": {
          console.log("in case: MALE_PARTICIPANTS: -", "ruleValue:", ruleValue);
          const minParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MIN_PARTICIPANTS")?.value;
          const maxParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;

          // Include the new participant in the validation
          const malePerformers = newParticipants.filter((p) => p.male && p.type == "PERFORMER").length;
          const femalePerformers = newParticipants.filter((p) => !p.male && p.type == "PERFORMER").length;
          console.log(`malePerformers: ${malePerformers}, femalePerformers: ${femalePerformers}`);

          if (ruleValue == maxParticipants) {
            if (femalePerformers > 0) {
              if (isSubmitting) {
                alert(`Oops... There should be only MALE participants, and a minimum of ${minParticipants} is required!`);
              }
              setIsValid(false);
              return false;
            }
            // Skip validation if participants are below minimum
            if (malePerformers < minParticipants) {
              // Allow adding participants until minimum is met
              setIsValid(true);
              return true;
            }
          } else {
            // Validate exact male count when ruleValue is not maxParticipants
            if (malePerformers > ruleValue) {
              if (isSubmitting) {
                alert(`Oops... There should be exactly ${ruleValue} MALE participants!`);
              }
              setIsValid(false);
              return false;
            }
          }

          // If all validations pass
          setIsValid(true);
          return true;
        }

        case "FEMALE_PARTICIPANTS": {
          const minParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MIN_PARTICIPANTS")?.value;
          const maxParticipants = availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;

          // Include the new participant in the validation
          const malePerformers = newParticipants.filter((p) => p.male && p.type == "PERFORMER").length;
          const femalePerformers = newParticipants.filter((p) => !p.male && p.type == "PERFORMER").length;

          if (ruleValue == maxParticipants) {
            if (malePerformers > 0) {
              if (isSubmitting) {
                alert(`Oops... There should be only FEMALE participants, and a minimum of ${minParticipants} is required!`);
              }
              setIsValid(false);
              return false;
            }
            // Skip validation if participants are below minimum
            if (femalePerformers < minParticipants) {
              // Allow adding participants until minimum is met
              setIsValid(true);
              return true;
            }
          } else {
            // Validate exact male count when ruleValue is not maxParticipants
            if (femalePerformers > ruleValue) {
              if (isSubmitting) {
                alert(`Oops... There should be exactly ${ruleValue} FEMALE participants!`);
              }
              setIsValid(false);
              return false;
            }
          }

          // If all validations pass
          setIsValid(true);
          return true;
        }

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
    if (!handleRuleChecks(true)) {
      return;
    }

    console.log("here in after if");
    setLoadingSave(true);
    try {
      console.log("saving, selectedParticipant:", selectedParticipant);
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

    if (!handleRuleChecks(true)) {
      alert("Please provide the correct participant entries... check the rules");
      return;
    }

    const accompanist = Number(availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value);
    const maxParticipants = Number(availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value);
    if (
      (accompanist && [...participants, selectedParticipant].length > accompanist + maxParticipants) ||
      [...participants, selectedParticipant].filter((p) => p.type == "PERFORMER").length > maxParticipants
    ) {
      alert("You can't add the details now... please refresh the page!");
      return;
    }

    console.log(selectedParticipant);

    const newParticipant = {
      ...selectedParticipant,
      collegeId: participants[0].collegeId,
    };
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

  useEffect(() => {
    console.log("isValid:", isValid);
  }, [isValid]);

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
                {college &&
                  participants.length == 0 &&
                  slotsOccupied &&
                  slotsOccupied <= availableEvent.eventRules.find((rule) => rule.eventRuleTemplate?.name == "REGISTERED_SLOTS_AVAILABLE")?.value &&
                  new Date() < new Date("2024-12-10") && (
                    <Link to={"add"} className="btn btn-success shadow-sm" style={{ textDecoration: "none" }}>
                      Register Participant
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

      {participants && selectedParticipant && availableEvent && (
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
                  onChange={() =>
                    handleEditFormChange({
                      target: { name: "male", value: true },
                    })
                  }
                />
                <Form.Check
                  type="radio"
                  label="Female"
                  name={`male`} // Same unique name for the pair
                  checked={!selectedParticipant?.male}
                  onChange={() =>
                    handleEditFormChange({
                      target: { name: "male", value: false },
                    })
                  }
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
              <Form.Group className="mb-5">
                <Form.Label>Hand Preference</Form.Label>
                <Form.Select
                  aria-label="Default select example"
                  name="handPreference"
                  value={selectedParticipant.handPreference}
                  onChange={handleEditFormChange}
                  //   disabled={!selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
                >
                  <option value={"LEFT_HANDED"}>LEFT_HANDED</option>
                  <option value={"RIGHT_HANDED"}>RIGHT_HANDED</option>
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
              disabled={loading}
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
      )}
    </div>
  );
};

export default CollegeEvent;
