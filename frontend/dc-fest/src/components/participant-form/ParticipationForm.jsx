/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import FormHeading from "./FormHeading";
import SelectFields from "./SelectFields";
import ParticipantFields from "./ParticipantFields";
import { useEffect, useState } from "react";
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
  eventIds: [],
};

const ParticipationForm = ({ formType = "REGISTRATION" }) => {
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedCollege, setSelectedCollege] = useState();
  const [selectedAvailableEvent, setSelectedAvailableEvent] = useState();

  const [participants, setParticipants] = useState([participantObj]);

  const [showAlert, setShowAlert] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        setSelectedCategory(data[0]);
        setSelectedAvailableEvent(data[0]?.availableEvents[0]);
        handleSetDefaultParticipants(data[0]?.availableEvents[0]);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetchColleges()
      .then((data) => {
        console.log(data);
        setColleges(data);
        setSelectedCollege(data[0]?.id);
      })
      .catch((err) => console.log(err));
  }, []);

  // Updated handleChange function
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

  const getEvent = async (availableEventId) => {
    try {
      const response = await fetchEventByAvailableEventId(availableEventId);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const handleSetDefaultParticipants = (selectedAvailableEvent) => {
    const newParticipants = [];
    for (let i = 0; i < selectedAvailableEvent?.eventRules?.length; i++) {
      console.log(selectedAvailableEvent?.eventRules[i].eventRuleTemplate.name);
      if (selectedAvailableEvent?.eventRules[i].eventRuleTemplate.name == "NO_OF_PARTICIPANTS") {
        newParticipants.push(participantObj);
        break;
      }
      if (selectedAvailableEvent?.eventRules[i].eventRuleTemplate.name == "MIN_PARTICIPANTS") {
        console.log("value for min:", selectedAvailableEvent?.eventRules[i].value);
        for (let j = 0; j < Number(selectedAvailableEvent?.eventRules[i].value); j++) {
          newParticipants?.push(participantObj);
        }
        break;
      }
    }
    console.log(newParticipants);
    setParticipants(newParticipants);
  };

  const isValidDetails = () => {
    // Check for empty participant details
    for (let i = 0; i < participants.length; i++) {
      if ([participants[i].name.trim(), participants[i].email.trim(), participants[i].whatsappNumber.trim()].some((ele) => ele === "")) {
        return false;
      }
    }

    // Loop through each event rule and validate against the participants array
    for (let i = 0; i < selectedAvailableEvent?.eventRules.length; i++) {
      const eventRule = selectedAvailableEvent.eventRules[i];
      const ruleValue = Number(eventRule.value);

      switch (eventRule.name) {
        case "NO_OF_PARTICIPANTS":
          if (participants.length !== ruleValue) return false;
          break;

        case "MIN_PARTICIPANTS":
          if (participants.length < ruleValue) return false;
          break;

        case "MAX_PARTICIPANTS":
          if (participants.length > ruleValue) return false;
          break;

        case "MALE_PARTICIPANTS":
          if (participants.filter((p) => p.male).length !== ruleValue) return false;
          break;

        case "FEMALE_PARTICIPANTS":
          if (participants.filter((p) => !p.male).length !== ruleValue) return false;
          break;

        default:
          break;
      }
    }

    // Return true if all rules are passed
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("selectedCategory:", selectedCategory);
    console.log("selectedCollege:", selectedCollege);
    console.log("selected available event:", selectedAvailableEvent);

    console.log("participants:", participants);

    const event = await getEvent(selectedAvailableEvent?.id);
    if (event == null) {
      alert("Some error occured while adding participants!");
      return;
    }
    console.log("event:", event);

    const tmpParticipants = [...participants];
    let count = 0;
    for (let i = 0; i < tmpParticipants.length; i++) {
      tmpParticipants[i].collegeId = selectedCollege.id;
      tmpParticipants[i].eventIds = [event.id];
console.log(tmpParticipants[i], selectedCollege.id)
      try {
        const response = await createParticipants(tmpParticipants[i]);
        console.log("created participant:", response);
        count++;
      } catch (error) {
        console.log(error);
      }
    }
    alert(`Participants added: ${count}`);
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
                      {participants?.map((participant, participantIndex) => (
                        <ParticipantFields key={`participant-${participantIndex}`} participant={participant} participantIndex={participantIndex} onChange={handleChange} />
                      ))}
                    </div>
                  </div>
                  <div className=" d-flex justify-content-center">
                    <p>
                      <Button disabled={!(isValidDetails() && colleges.length > 0)} variant="primary" type="submit" size="lg" className="w-100">
                        Register
                      </Button>
                    </p>
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
