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
import { FaBolt, FaClipboardCheck, FaRegClock } from "react-icons/fa";

const participantObj = {
  name: "",
  email: "",
  whatsappNumber: "",
  male: true,
  collegeId: null,
  type: "PERFORMER",
  entryType: "NORMAL",
  eventIds: [],
  handPreference: "RIGHT_HANDED",
};

const ParticipationForm = ({ formType = "REGISTRATION", iccode, availableEvent, college, slotsOccupied, waitingListSlotsOccupied, collegeParticipation }) => {
  const navigate = useNavigate();

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
  const [actualParticipatedColleges, setActualParticipatedColleges] = useState([]);
  const [hasNormalParticipants, setHasNormalParticipants] = useState(false);

  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        // Show all events - OTSE_SLOTS only affects entry type availability, not event visibility
        console.log("Loading all categories with events");
        console.log("Final filtered data:", data);
        setCategories(data);

        if (availableEvent) {
          const tmpCategory = data.find((ele) => ele.id == availableEvent.eventCategoryId);
          setSelectedCategory(tmpCategory);
          setSelectedAvailableEvent(availableEvent);
          // Don't call handleSetDefaultParticipants here - wait for slots to be loaded
          // It will be called in the useEffect that depends on slotsOccupied
          console.log("available_event:", availableEvent);
        } else {
          // Find the first category that has available events
          const categoryWithEvents = data.find((cat) => cat?.availableEvents?.length > 0) || data[0];
          setSelectedCategory(categoryWithEvents);
          const firstEvent = categoryWithEvents?.availableEvents?.length > 0 ? categoryWithEvents.availableEvents[0] : null;
          setSelectedAvailableEvent(firstEvent);
          console.log("available_event:", firstEvent);
          if (firstEvent) {
            handleSetDefaultParticipants(firstEvent);
          }
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (!selectedCollege) {
      fetchColleges()
        .then((data) => {
          const participatedColleges = data.filter((c) => c.detailsUploaded);
          console.log("participatedColleges:", participatedColleges);
          setColleges(participatedColleges);
          setActualParticipatedColleges(participatedColleges);

          if (iccode) {
            const tmpSelectedCollege = data.find((ele) => ele.icCode === iccode);

            if (tmpSelectedCollege) {
              setSelectedCollege(tmpSelectedCollege);
            } else {
              setSelectedCollege(data[0]);
            }
          } else {
            setSelectedCollege(data[0]);
          }
        })
        .catch((err) => console.error("Error fetching colleges:", err));
    }
  }, [iccode, selectedCollege]);

  // Set default participants based on the selected event rules
  // Only update when we have slot information (for college end registration)
  useEffect(() => {
    if (selectedAvailableEvent && actualParticipatedColleges.length > 0) {
      // If iccode is provided (college end), wait for slots and college participation to be loaded
      if (iccode) {
        // Only set defaults if we have slot information
        // collegeParticipation can be null (not enrolled) or an object (enrolled), but not undefined
        if (slotsOccupied !== undefined && waitingListSlotsOccupied !== null) {
          console.log("Calling handleSetDefaultParticipants with collegeParticipation:", collegeParticipation);
          handleSetDefaultParticipants(selectedAvailableEvent);
        }
      } else {
        // Admin end - set defaults immediately
        handleSetDefaultParticipants(selectedAvailableEvent);
      }
    }
  }, [selectedAvailableEvent, actualParticipatedColleges, slotsOccupied, waitingListSlotsOccupied, collegeParticipation, iccode]);

  const handleFilterColleges = async () => {
    const event = await getEvent(selectedAvailableEvent?.id);
    if (!event) {
      alert("Error retrieving event details.");
      return;
    }
    const filteredColleges = [];
    for (let i = 0; i < actualParticipatedColleges.length; i++) {
      try {
        const res = await fetchParticipantsByEventIdAndCollegeId(event.id, actualParticipatedColleges[i].id);
        if (res.length == 0) {
          filteredColleges.push(actualParticipatedColleges[i]);
        }
      } catch (error) {
        alert("Error loading colleges.");
        return;
      }
    }
    console.log("in handleFilterColleges(), filtered college:", filteredColleges);
    setColleges(filteredColleges);
    setSelectedCollege(filteredColleges[0]);
  };

  // Revalidate details whenever participants change
  useEffect(() => {
    isValidDetails();
  }, [participants, selectedAvailableEvent]);

  // Check if college already has NORMAL entry type participants
  useEffect(() => {
    const checkNormalParticipants = async () => {
      if (!selectedCollege || !selectedAvailableEvent) {
        setHasNormalParticipants(false);
        return;
      }

      try {
        const event = await getEvent(selectedAvailableEvent.id);
        if (!event) {
          setHasNormalParticipants(false);
          return;
        }

        const existingParticipants = await fetchParticipantsByEventIdAndCollegeId(event.id, selectedCollege.id);
        const hasNormal = existingParticipants.some((p) => p.entryType === "NORMAL");
        setHasNormalParticipants(hasNormal);
        console.log("College has NORMAL participants:", hasNormal);
      } catch (error) {
        console.error("Error checking NORMAL participants:", error);
        setHasNormalParticipants(false);
      }
    };

    checkNormalParticipants();
  }, [selectedCollege, selectedAvailableEvent]);

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
    if (!selectedAvailableEvent) {
      setParticipants([participantObj]);
      return;
    }

    // Check if college is already in waiting list (has waitingListSequence set)
    const isCollegeInWaitingList = collegeParticipation?.waitingListSequence != null && collegeParticipation.waitingListSequence.startsWith("WL_");

    console.log("handleSetDefaultParticipants - collegeParticipation:", collegeParticipation);
    console.log("handleSetDefaultParticipants - isCollegeInWaitingList:", isCollegeInWaitingList);
    console.log("handleSetDefaultParticipants - waitingListSequence:", collegeParticipation?.waitingListSequence);

    // Check if registration slots are full and waiting list should be used
    const registeredSlotsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate?.name === "REGISTERED_SLOTS_AVAILABLE");
    const waitingListSlotsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
    const maxSlots = registeredSlotsRule ? Number(registeredSlotsRule.value) : null;
    // If waiting list rule is not present, treat it as 0 slots
    const maxWaitingListSlots = waitingListSlotsRule ? Number(waitingListSlotsRule.value) : 0;

    // Determine if waiting list should be used
    // Priority: If college is already in waiting list, use WAITING_LIST
    // Otherwise, check if registration is full and waiting list is available
    const isRegistrationFull = slotsOccupied != null && maxSlots != null && slotsOccupied >= maxSlots;
    const isWaitingListAvailable = isRegistrationFull && maxWaitingListSlots > 0 && waitingListSlotsOccupied != null && waitingListSlotsOccupied < maxWaitingListSlots;

    // If college is already in waiting list, use WAITING_LIST; otherwise check slot availability
    const defaultEntryType = isCollegeInWaitingList ? "WAITING_LIST" : isWaitingListAvailable ? "WAITING_LIST" : "NORMAL";

    console.log("handleSetDefaultParticipants - defaultEntryType:", defaultEntryType);

    const newParticipants = [];
    const minParticipantsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name === "MIN_PARTICIPANTS");
    const accompanistRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name === "COLLEGE_ACCOMPANIST");

    if (minParticipantsRule) {
      for (let i = 0; i < Number(minParticipantsRule.value); i++) {
        newParticipants.push({
          ...participantObj,
          entryType: defaultEntryType,
          isWaitingListAvailable: isWaitingListAvailable || isCollegeInWaitingList,
          isWaitingListForced: isCollegeInWaitingList || isWaitingListAvailable, // Force WAITING_LIST if college is in waiting list or registration is full
        });
      }
    }

    console.log("handleSetDefaultParticipants - newParticipants:", newParticipants);
    setParticipants(newParticipants);
  };
  // Function to validate participant details
  const isValidDetails = (isSubmitting) => {
    if (!selectedAvailableEvent || !selectedAvailableEvent.eventRules) {
      setIsValid(false);
      console.log("selectedAvailableEvent || selectedAvailableEvent.eventRules doesn't exist: -", selectedAvailableEvent);
      return false;
    }

    for (const participant of participants) {
        console.log("in validDetails(), loop, participant:", participant);
      if (!participant.name.trim() || !participant.email.trim() || !participant.whatsappNumber.trim()) {
        setIsValid(false);
        console.log("participant is empty:", participant, participants);
        return false;
      }
    }

    if (participants.some((p) => p.whatsappNumber.length > 11 || p.whatsappNumber.length < 10)) {
      setIsValid(false);
      console.log("glitch in wa:", participants);
      return false;
    }

    for (const rule of selectedAvailableEvent.eventRules) {
      const ruleValue = Number(rule.value);
      switch (rule.eventRuleTemplate.name) {
        case "MIN_PARTICIPANTS":
          if (participants.filter((p) => p.type == "PERFORMER").length < ruleValue) {
              console.log(`Oops... There should be minimum ${ruleValue} participants!`)
            if (isSubmitting) {
              alert(`Oops... There should be minimum ${ruleValue} participants!`);
            }
            setIsValid(false);
            return false;
          }
          break;

        case "MAX_PARTICIPANTS":
          if (participants.filter((p) => p.type == "PERFORMER").length > ruleValue) {
            console.log(`Oops... There should be maximum ${ruleValue} participants!`);
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
            console.log('COLLEGE_ACCOMPANIST case:', `Oops... There should be maximum ${ruleValue} accompanist!`)
            return false;
          }
          break;

        case "MALE_PARTICIPANTS": {
          const maxParticipants = selectedAvailableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;
          const minParticipants = selectedAvailableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MIN_PARTICIPANTS")?.value;

          console.log("minParticipants:", minParticipants)
          console.log("maxParticipants:", maxParticipants)
          console.log("ruleValue:", ruleValue);
          console.log("participants:", participants);
          if (ruleValue == maxParticipants) {
            if (participants.filter((p) => p.male && p.type == "PERFORMER").length < minParticipants || participants.filter((p) => !p.male && p.type == "PERFORMER").length != 0) {
                console.log(`Oops... There should be maximum ${ruleValue} participants!`);
              if (isSubmitting) {
                alert(`Oops... There should be min. ${minParticipants} MALE participants!`);
              }
              setIsValid(false);
              return false;
            }
          } else {
            if (participants.filter((p) => p.male).length !== ruleValue) {
              if (isSubmitting) {
                alert(`Oops... There should be ${ruleValue} MALE participants!`);
              }
              console.log(`Oops... There should be max. ${ruleValue} MALE participants!`)
              setIsValid(false);
              return false;
            }
          }
          break;
        }

        case "FEMALE_PARTICIPANTS": {
          const maxParticipants = selectedAvailableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;
          const minParticipants = selectedAvailableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MIN_PARTICIPANTS")?.value;

          if (ruleValue == maxParticipants) {
            if (participants.filter((p) => !p.male && p.type == "PERFORMER").length < minParticipants || participants.filter((p) => p.male && p.type == "PERFORMER").length != 0) {
              if (isSubmitting) {
                alert(`Oops... There should be ${minParticipants} FEMALE participants!`);
              }
              setIsValid(false);
              console.log(`Oops... There should be ${minParticipants} FEMALE participants!`)
              return false;
            }
          } else {
            if (participants.filter((p) => !p.male).length !== ruleValue) {
              if (isSubmitting) {
                alert(`Oops... There should be ${ruleValue} FEMALE participants!`);
              }
              setIsValid(false);
              console.log(`Oops... There should be ${ruleValue} FEMALE participants!`)
              return false;
            }
          }
          break;
        }

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

    for (let i = 0; i < participants.length / 2; i++) {
      if (participants[i].entryType != participants[participants.length - 1].entryType) {
        alert("Every participant should have same entry type");
        return;
      }
    }

    // Check participants if already registered
    try {
      const res = await fetchParticipantsByEventIdAndCollegeId(event.id, selectedCollege.id);
      console.log("checking from db whether exist: ", res);
      if (res.length > 0) {
        if (participants[0].entryType == "NORMAL" && res.filter((p) => p.entryType == "NORMAL").length > 0) {
          alert("Your college has already added participants with `NORMAL` entry type. Only one NORMAL entry is allowed per college. You can add OTSE or WAITING_LIST entry types instead.");
          return;
        }

        if (iccode) {
          navigate(-1);
          return;
        }
      }
    } catch (error) {
      console.log("error in fetchParticipantsByEventIdAndCollegeId() - ", error);
    }

    // if (iccode && new Date() > new Date("2025-12-11T14:00:00") && participants.some((p) => p.entryType == "NORMAL")) {
    //   alert(`"Oops! Umangfest-2025 registrations are closed. Don't miss out next time—contact the host college for help!`);
    //   return;
    // }

    setLoading(true);
    const participantsArr = [];
    for (const participant of participants) {
      const participantData = {
        ...participant,
        collegeId: selectedCollege.id,
        eventIds: [event.id],
      };
      participantsArr.push(participantData);
    }

    try {
      console.log("creating participant:", participantsArr, "selectedCollege:", selectedCollege);
      const res = await createParticipants(participantsArr);
      console.log(res);
      alert(`Participants successfully added: ${res.length}`);
    } catch (error) {
      alert(error.response.data.message);
      console.error("Error creating participant:", error.response.data.message);
    } finally {
      setLoading(false);
      handleSetDefaultParticipants(selectedAvailableEvent);
      if (iccode) {
        navigate(-1);
      }
    }
  };

  // Helper function to determine the correct entry type based on college waiting list status
  const getEntryTypeForNewParticipant = () => {
    // Check if college is already in waiting list (has waitingListSequence set)
    const isCollegeInWaitingList = collegeParticipation?.waitingListSequence != null && collegeParticipation.waitingListSequence.startsWith("WL_");

    if (isCollegeInWaitingList) {
      return "WAITING_LIST";
    }

    // Check if registration slots are full and waiting list should be used
    const registeredSlotsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate?.name === "REGISTERED_SLOTS_AVAILABLE");
    const waitingListSlotsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
    const maxSlots = registeredSlotsRule ? Number(registeredSlotsRule.value) : null;
    const maxWaitingListSlots = waitingListSlotsRule ? Number(waitingListSlotsRule.value) : 0;

    const isRegistrationFull = slotsOccupied != null && maxSlots != null && slotsOccupied >= maxSlots;
    const isWaitingListAvailable = isRegistrationFull && maxWaitingListSlots > 0 && waitingListSlotsOccupied != null && waitingListSlotsOccupied < maxWaitingListSlots;

    return isWaitingListAvailable ? "WAITING_LIST" : "NORMAL";
  };

  const handleAddParticipant = () => {
    if (!selectedAvailableEvent) return;
    // Grab the event_rule for `MAX_PARTICIPANTS`
    console.log("Selected events are as: ", selectedAvailableEvent);
    const eventRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS");
    console.log("eventRule:", eventRule);
    // Check if the number of participants are <= event_rule's value
    const maxMarticipants = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;

    if (participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants) {
      const entryType = getEntryTypeForNewParticipant();
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        {
          ...participantObj,
          entryType: entryType,
          isWaitingListAvailable: entryType === "WAITING_LIST",
          isWaitingListForced: entryType === "WAITING_LIST",
        },
      ]);
    }
  };

  const handleAddAccompanist = () => {
    if (!selectedAvailableEvent) return;
    // Grab the event_rule for `COLLEGE_ACCOMPANIST`
    console.log("Selected events are as: ", selectedAvailableEvent);
    const eventRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST");
    console.log("eventRule:", eventRule);
    // Check if the number of participants are <= event_rule's value
    const accompanist = eventRule?.value;
    if (participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist) {
      const entryType = getEntryTypeForNewParticipant();
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        {
          ...participantObj,
          type: "ACCOMPANIST",
          entryType: entryType,
          isWaitingListAvailable: entryType === "WAITING_LIST",
          isWaitingListForced: entryType === "WAITING_LIST",
        },
      ]);
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

    return !(participants.filter((p) => p.type == "PERFORMER").length < maxMarticipants);
  };

  const handleDisabledAccompanist = () => {
    const maxMarticipants = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value;
    const accompanist = selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value;

    return !(participants.filter((p) => p.type == "ACCOMPANIST").length < accompanist);
  };

  //   if (
  //     // new Date() > new Date("2025-12-11T14:00:00") &&
  //     selectedAvailableEvent
  //   ) {
  //     const otseRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "OTSE_SLOTS");
  //     console.log("otse-rule:", otseRule);
  //     if (otseRule && Number(otseRule.value) == 0) {
  //       //
  //       return (
  //         <div className="d-flex">
  //           <p>
  //             <span>Oops...</span>
  //             <strong>{selectedAvailableEvent?.title}</strong>
  //             <span>does&apos;t not contain any OTSE slots</span>
  //           </p>
  //         </div>
  //       );
  //     }
  //   }

  return (
    <>
      {/* {new Date() > new Date("2025-12-11T14:00:00") && (
        <div className="vw-100 d-flex positon-absolute justify-content-center" style={{ top: "83px", zIndex: "1", position: "absolute" }}>
          <div className="w-100 d-flex justify-content-center align-items-center gap-2 bottom-0 border" style={{ listStyle: "none", backgroundColor: "#ff6767", color: "white" }}>
            <FaBolt />
            <p style={{ fontSize: "12px" }} className="d-flex justify-content-center align-items-center p-0 m-0 py-1 fw-bold text-center">
              OTSE ENTRIES ACCEPETD
            </p>
          </div>
        </div>
      )} */}

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
                          <ParticipantFields
                            key={`participant-${index}`}
                            participant={participant}
                            participantIndex={index}
                            onChange={handleChange}
                            selectedAvailableEvent={selectedAvailableEvent}
                            iccode={iccode}
                            hasNormalParticipants={hasNormalParticipants}
                          />
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
                    <div className="d-flex flex-column justify-content-center mb-3">
                      <Button
                        disabled={!isValid || loading == true}
                        variant="primary"
                        type="submit"
                        size="lg"
                        //   className="w-100"
                      >
                        {/* {JSON.stringify(isValid)}
                        {JSON.stringify(loading)} */}
                        {loading ? "Please wait..." : "Register"}
                      </Button>
                      {loading && <p>This may take few seconds...</p>}
                    </div>
                  </Form>
                </div>
                {/* Footer with participant counts - moved inside Card.Body to prevent overlap */}
                <div className="mt-auto pt-3 border-top" style={{ backgroundColor: "aliceblue", marginTop: "auto" }}>
                  <ul className="d-flex flex-wrap justify-content-between align-items-center p-0 m-0 py-2 px-3" style={{ listStyle: "none" }}>
                    <li className="mb-1 mb-md-0">Min. Participants: {selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "MIN_PARTICIPANTS")?.value || "N/A"}</li>
                    <li className="mb-1 mb-md-0">
                      Max. Participants: {participants.filter((p) => p.type == "PERFORMER").length} /{" "}
                      {selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value || "N/A"}
                    </li>
                    <li className="mb-1 mb-md-0">
                      Accompanist: {participants.filter((p) => p.type == "ACCOMPANIST").length} /{" "}
                      {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value || 0}
                    </li>
                    {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MALE_PARTICIPANTS") && (
                      <li className="mb-1 mb-md-0">
                        Male: {participants.filter((p) => p.male).length} / {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "MALE_PARTICIPANTS")?.value}
                      </li>
                    )}
                    {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "FEMALE_PARTICIPANTS") && (
                      <li className="mb-1 mb-md-0">
                        Female: {participants.filter((p) => !p.male).length} / {selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "FEMALE_PARTICIPANTS")?.value}
                      </li>
                    )}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ParticipationForm;
