/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// /* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */

import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import FormHeading from "./FormHeading";
import SelectFields from "./SelectFields";
import ParticipantFields from "./ParticipantFields";
import { fetchCategories } from "../../services/categories-api";
import { fetchColleges } from "../../services/college-apis";
import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { createParticipants, fetchParticipantsByEventIdAndCollegeId } from "../../services/participants-api";
import { useNavigate } from "react-router-dom";

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

const ParticipationForm = ({ formType = "REGISTRATION", iccode, availableEvent, college }) => {
  const navigate = useNavigate();

  console.log("availableEvent in participation form from add participant page:", availableEvent);
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedCollege, setSelectedCollege] = useState();
  const [selectedAvailableEvent, setSelectedAvailableEvent] = useState(availableEvent);
  const [participants, setParticipants] = useState([participantObj]);
  const [isValid, setIsValid] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        if (availableEvent) {
          console.log("in if of pf");
          const tmpCategory = data.find((ele) => ele.id == availableEvent.eventCategoryId);
          setSelectedCategory(tmpCategory);
          setSelectedAvailableEvent(availableEvent);
          handleSetDefaultParticipants(availableEvent);
        } else {
          setSelectedCategory(data[0]);
          setSelectedAvailableEvent(data[0]?.availableEvents[0]);
          handleSetDefaultParticipants(data[0]?.availableEvents[0]);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch colleges if not already set
  //   useEffect(() => {
  //     if (!selectedCollege) {
  //       console.log("fetching college");
  //       fetchColleges()
  //         .then((data) => {
  //           setColleges(data);
  //           console.log("in 1st if of ue, college:", college);
  //           if (iccode) {
  //             console.log("college:", college);
  //             console.log("in if of college load, iccode:", iccode);
  //             const tmpSelectedCollege = data.find((ele) => ele.icCode === iccode);
  //             console.log("tmpSelectedCollege:", tmpSelectedCollege, tmpSelectedCollege.id);
  //             setSelectedCollege(tmpSelectedCollege.id);
  //             console.log(selectedCollege);
  //           } else {
  //             console.log("here");
  //             setSelectedCollege(data[0]?.id);
  //           }
  //         })
  //         .catch((err) => console.error("Error fetching colleges:", err));
  //     }
  //   }, []);

  useEffect(() => {
    if (!selectedCollege) {
      console.log("Fetching colleges...");
      fetchColleges()
        .then((data) => {
          setColleges(data);
          console.log("Fetched colleges:", data);

          if (iccode) {
            console.log("Matching college with iccode:", iccode);
            const tmpSelectedCollege = data.find((ele) => ele.icCode === iccode);

            if (tmpSelectedCollege) {
              console.log("Setting selected college based on iccode:", tmpSelectedCollege.id);
              setSelectedCollege(tmpSelectedCollege);
            } else {
              console.warn("No matching college found for iccode. Falling back to first college.");
              setSelectedCollege(data[0]);
            }
          } else {
            console.log("No iccode provided. Setting first college by default.");
            setSelectedCollege(data[0]?.id);
          }
        })
        .catch((err) => console.error("Error fetching colleges:", err));
    }
  }, [iccode, selectedCollege]);

  //   useEffect(() => {
  //     if (selectedCategory) {
  //       setSelectedAvailableEvent(selectedCategory?.availableEvents[0]);
  //       handleSetDefaultParticipants(selectedCategory?.availableEvents[0]);
  //     }
  //   }, [selectedCategory]);

  // Set default participants based on the selected event rules
  useEffect(() => {
    console.log("selectedAvailableEvent:", selectedAvailableEvent);
    if (selectedAvailableEvent) {
      handleSetDefaultParticipants(selectedAvailableEvent);
    }
  }, [selectedAvailableEvent]);

  // Revalidate details whenever participants change
  useEffect(() => {
    isValidDetails();
  }, [participants]);

  // Function to handle form input changes
  const handleChange = (e, participantIndex) => {
    const { name, value, type, checked } = e.target;

    setParticipants((prevParticipants) => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        [name]: type === "checkbox" ? checked : value,
      };
      return updatedParticipants;
    });
  };

  // Function to get event details by availableEventId
  const getEvent = async (availableEventId) => {
    try {
      const response = await fetchEventByAvailableEventId(availableEventId);
      return response;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  };

  // Function to initialize participants based on event rules
  const handleSetDefaultParticipants = (selectedAvailableEvent) => {
    console.log("in default set, selectedAvailableEvent:", selectedAvailableEvent);
    const newParticipants = [];
    const minParticipantsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name === "MIN_PARTICIPANTS");
    const accompanistRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name === "COLLEGE_ACCOMPANIST");

    if (minParticipantsRule) {
      for (let i = 0; i < Number(minParticipantsRule.value); i++) {
        newParticipants.push(participantObj);
      }
    }

    setParticipants(newParticipants);
  };
  // Function to validate participant details
  const isValidDetails = (isSubmitting) => {
    if (!selectedAvailableEvent || !selectedAvailableEvent.eventRules) {
      setIsValid(false);
      return false;
    }

    for (const participant of participants) {
      if (!participant.name.trim() || !participant.email.trim() || !participant.whatsappNumber.trim()) {
        setIsValid(false);
        return false;
      }
    }

    if (participants.some((p) => p.whatsappNumber.length > 11 || p.whatsappNumber.length < 10)) {
      setIsValid(false);
      return false;
    }

    for (const rule of selectedAvailableEvent.eventRules) {
      const ruleValue = Number(rule.value);
      switch (rule.eventRuleTemplate.name) {
        case "MIN_PARTICIPANTS":
          if (participants.filter((p) => p.type == "PERFORMER").length < ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be minimum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MAX_PARTICIPANTS":
          console.log("MAX_PARTICIPANTS:", participants.filter((p) => p.type == "PERFORMER").length);
          if (participants.filter((p) => p.type == "PERFORMER").length > ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be maximum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "COLLEGE_ACCOMPANIST":
          if (participants.filter((p) => p.type == "ACCOMPANIST").length > ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be maximum ${ruleValue} accompanist!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MALE_PARTICIPANTS":
          if (participants.filter((p) => p.male).length !== ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be ${ruleValue} MALE participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "FEMALE_PARTICIPANTS":
          if (participants.filter((p) => !p.male).length !== ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be female ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        // case "COLLEGE_ACOMPANIST":
        //   if (participants.filter((p) => !p.type == "ACCOMPANIST").length !== ruleValue) {
        //     if (isSubmitting) {
        //       alert(`Oops... There should be ${ruleValue} accompanist!`);
        //     }
        //     setIsValid(false);
        //     return false;
        //   }
        //   break;

        default:
          break;
      }
    }
    setIsValid(true);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCollege) {
      alert("Please select a college.");
      return;
    }

    isValidDetails(true);
    if (!isValid) {
      alert("Invalid participant details. Please review.");
      return;
    }

    const event = await getEvent(selectedAvailableEvent?.id);
    if (!event) {
      alert("Error retrieving event details.");
      return;
    }

    // Check participants if already registered
    try {
      const res = await fetchParticipantsByEventIdAndCollegeId(event.id, selectedCollege.id);
      console.log("Checked from db, participants:", res);
      if (res.length > 0) {
        alert("Your college had already added the participants, you may edit the details now!");
        navigate(-1);
        return;
      }
    } catch (error) {
      console.log("error in fetchParticipantsByEventIdAndCollegeId() - ", error);
    }

    setLoading(true);
    let successCount = 0;
    for (const participant of participants) {
      try {
        const participantData = {
          ...participant,
          collegeId: selectedCollege.id,
          eventIds: [event.id],
        };
        await createParticipants(participantData);
        successCount++;
      } catch (error) {
        console.error("Error creating participant:", error);
      }
    }
    if (successCount > 0) {
      handleSetDefaultParticipants(selectedAvailableEvent);
      alert(`Participants successfully added: ${successCount}`);
      navigate(-1);
    } else {
      alert("Some erro occured... Please try again");
    }

    setLoading(false);
  };

  const handleAddParticipant = () => {
    // Grab the event_rule for `MAX_PARTICIPANTS`
    console.log("Selected events are as: ", selectedAvailableEvent);
    const eventRule = selectedAvailableEvent.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS");
    console.log("eventRule:", eventRule);
    // Check if the number of participants are <= event_rule's value
    const maxMarticipants = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;

    if (participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants) {
      setParticipants((prevParticipants) => [...prevParticipants, { ...participantObj }]);
    }
  };

  const handleAddAccompanist = () => {
    // Grab the event_rule for `COLLEGE_ACCOMPANIST`
    console.log("Selected events are as: ", selectedAvailableEvent);
    const eventRule = selectedAvailableEvent.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST");
    console.log("eventRule:", eventRule);
    // Check if the number of participants are <= event_rule's value
    const accompanist = eventRule?.value;
    if (participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist) {
      setParticipants((prevParticipants) => [...prevParticipants, { ...participantObj, type: "ACCOMPANIST" }]);
    }
  };

  const handleDelete = (participantIndex) => {
    let newParticipants = [...participants];
    newParticipants = newParticipants.filter((p, idx) => idx != participantIndex);
    setParticipants(newParticipants);
  };

  const handleDisabled = () => {
    const maxMarticipants = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;
    const accompanist = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value;
    console.log("maxMarticipants:", maxMarticipants);
    console.log("accompanist:", accompanist);
    // if (accompanist) {
    //   return !(participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist && participants.length < maxMarticipants + accompanist);
    // } else {
    //   return !(participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants);
    // }

    return !(participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants);
  };

  const handleDisabledAccompanist = () => {
    const maxMarticipants = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;
    const accompanist = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value;
    console.log("maxMarticipants:", maxMarticipants);
    console.log("accompanist:", accompanist);
    // if (accompanist) {
    //   return !(participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist && participants.length < maxMarticipants + accompanist);
    // } else {
    //   return !(participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants);
    // }

    return !(participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist);
  };

  return (
    <>
      <Container fluid className="d-flex align-items-center justify-content-center bg-light" id="event-participant-container">
        <Row className="w-100 h-100 py-2">
          <Col xs={12} md={8} lg={8} className="mx-auto h-100">
            <Card className="shadow-lg h-100">
              <Card.Body className="d-flex flex-column" style={{ height: "700px" }}>
                <FormHeading type={formType} showAlert={showAlert} setShowAlert={setShowAlert} />
                <div className="form-scroll-container flex-grow-1">
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <SelectFields
                      iccode={iccode}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      onSetDefaultParticipants={handleSetDefaultParticipants}
                      categories={categories}
                      selectedAvailableEvent={selectedAvailableEvent}
                      setSelectedAvailableEvent={setSelectedAvailableEvent}
                      colleges={colleges}
                      selectedCollege={selectedCollege}
                      setSelectedCollege={setSelectedCollege}
                      availableEvent={availableEvent}
                    />
                    <div id="participants-wrapper">
                      <h2>Participants Details</h2>
                      <div id="participants-container" className="d-flex flex-column gap-2">
                        {participants.map((participant, index) => (
                          <ParticipantFields key={`participant-${index}`} participant={participant} participantIndex={index} onChange={handleChange} selectedAvailableEvent={selectedAvailableEvent} />
                        ))}
                      </div>
                      <div>
                        {selectedAvailableEvent && (
                          <>
                            <button type="button" disabled={handleDisabled()} className="btn btn-success btn-sm" onClick={handleAddParticipant}>
                              Add Participant
                            </button>
                            {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST") && (
                              <button type="button" disabled={handleDisabledAccompanist()} className="btn btn-info btn-sm" onClick={handleAddAccompanist}>
                                Add Accompanist
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="d-flex flex-column  justify-content-center">
                      <Button
                        disabled={!isValid || loading == true}
                        variant="primary"
                        type="submit"
                        size="lg"
                        //   className="w-100"
                      >
                        {loading ? "Please wait..." : "Register"}
                      </Button>
                      {loading && <p>This may take few seconds...</p>}
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <div className="container position-absolute bottom-0 border">
        <ul className="d-flex justify-content-between align-items-center p-0 m-0 py-2 " style={{ listStyle: "none", backgroundColor: "aliceblue" }}>
          <li>Min. Participants: {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MIN_PARTICIPANTS").value}</li>
          <li>
            Max. Participants: {participants.filter((p) => p.type == "PERFORMER").length} / {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS").value}
          </li>
          <li>
            Accompanist: {participants.filter((p) => p.type == "ACCOMPANIST").length} /{" "}
            {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value || 0}
          </li>
          {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MALE_PARTICIPANTS") && (
            <li>
              Male: {participants.filter((p) => p.male).length} / {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MALE_PARTICIPANTS")?.value}
            </li>
          )}
          {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "FEMALE_PARTICIPANTS") && (
            <li>
              Female: {participants.filter((p) => !p.male).length} / {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "FEMALE_PARTICIPANTS")?.value}
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default ParticipationForm;
