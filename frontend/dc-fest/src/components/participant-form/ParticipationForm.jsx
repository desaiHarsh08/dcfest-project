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
import { createParticipants } from "../../services/participants-api";

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

const ParticipationForm = ({ formType = "REGISTRATION", iccode }) => {
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedCollege, setSelectedCollege] = useState();
  const [selectedAvailableEvent, setSelectedAvailableEvent] = useState();
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
        setSelectedCategory(data[0]);
        setSelectedAvailableEvent(data[0]?.availableEvents[0]);
        handleSetDefaultParticipants(data[0]?.availableEvents[0]);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch colleges if not already set
  useEffect(() => {
    if (!selectedCollege) {
      fetchColleges()
        .then((data) => {
          setColleges(data);
          if (iccode) {
            console.log("in if of college load, iccode:", iccode);
            const tmpSelectedCollege = data.find((ele) => ele.icCode == iccode);
            console.log(tmpSelectedCollege);
            setSelectedCollege(tmpSelectedCollege?.id);
          } else {
            setSelectedCollege(data[0]?.id);
          }
        })
        .catch((err) => console.error("Error fetching colleges:", err));
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setSelectedAvailableEvent(selectedCategory?.availableEvents[0]);
      handleSetDefaultParticipants(selectedCategory?.availableEvents[0]);
    }
  }, [selectedCategory]);

  // Set default participants based on the selected event rules
  //   useEffect(() => {
  //     if (selectedAvailableEvent) {
  //       handleSetDefaultParticipants(selectedAvailableEvent);
  //     }
  //   }, [selectedAvailableEvent]);

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

    for (const rule of selectedAvailableEvent.eventRules) {
      const ruleValue = Number(rule.value);
      switch (rule.eventRuleTemplate.name) {
        case "MIN_PARTICIPANTS":
          if (participants.length < ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be minimum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MAX_PARTICIPANTS":
          if (participants.length > ruleValue) {
            if (isSubmitting) {
              alert(`Oops... There should be maximum ${ruleValue} participants!`);
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

    setLoading(true);
    let successCount = 0;
    for (const participant of participants) {
      try {
        const participantData = {
          ...participant,
          collegeId: selectedCollege,
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
    } else {
      alert("Some erro occured... Please try again");
    }

    setLoading(false);
  };

  return (
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
                  />
                  <div id="participants-wrapper">
                    <h2>Participants Details</h2>
                    <div id="participants-container" className="d-flex flex-column gap-2">
                      {participants.map((participant, index) => (
                        <ParticipantFields key={`participant-${index}`} participant={participant} participantIndex={index} onChange={handleChange} />
                      ))}
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
  );
};

export default ParticipationForm;
