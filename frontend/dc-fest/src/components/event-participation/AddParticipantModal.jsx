/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { addParticipant, createParticipants, fetchSlotsOccupiedForEvent } from "../../services/participants-api";
import { fetchEventByAvailableEventId } from "../../services/event-apis";

export default function AddParticipantModal({
  handleModalClose,
  show,
  setNewParticipant,
  newParticipant,
  setGroup,
  group,
  participants,
  setParticipants,
  filteredParticipants,
  setFilteredParticipants,
  handleInputChange,
  selectedCollege,
  availableEvent,
  groups,
}) {
  const [loadingSave, setLoadingSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [slotsOccupied, setSlotsOccupied] = useState();
  const [event, setEvent] = useState();

  useEffect(() => {
    setNewParticipant((prev) => ({ ...newParticipant, group }));
  }, [group]);

  useEffect(() => {
    console.log("in ue of a-p, availableEvent:", availableEvent);
  }, [availableEvent]);

  useEffect(() => {
    console.log(availableEvent, participants);
    // Fetch the event
    (async () => {
      if (!event) {
        try {
          console.log("in add_part. modal, group:", group, "participants:", participants);
          const response = await fetchEventByAvailableEventId(availableEvent.id);
          setEvent(response);
          const tmpParticipant = {
            collegeId: selectedCollege.id,
            name: "",
            email: "",
            whatsappNumber: "",
            handPreference: "RIGHT_HANDED",
            male: false,
            group: group,
            entryType: participants[0]?.entryType,
            eventIds: [response.id],
            present: false,
            qrcode: participants[0]?.qrcode,
            teamNumber: participants[0]?.teamNumber,
          };
          console.log("tmpParticipant:", tmpParticipant);
          setNewParticipant((prev) => tmpParticipant);
        } catch (error) {
          console.log("error in ue", error);
        }
      }
    })();
  }, [availableEvent, group, event, participants, selectedCollege.id, setNewParticipant, newParticipant]);

  useEffect(() => {
    console.log("in ue, newParticipant:", newParticipant);
  }, [newParticipant]);

  const getSlotsOccupied = async () => {
    try {
      console.log("here fetching, eventId:", event?.id);
      const response = await fetchSlotsOccupiedForEvent(event?.id);
      console.log("response:", availableEvent?.title, response);
      setSlotsOccupied(response);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch the details!");
    }
  };

  const handleRuleChecks = (isSubmitting, deleteParticipantId) => {
    if (participants.length == 0 || !newParticipant || !availableEvent) {
      return;
    }

    console.log("in handleRuleChecks(), prev, participants:", participants);
    let newParticipants = [];
    if (newParticipant?.id) {
      newParticipants = participants.map((p) => {
        if (p.id == newParticipant?.id) {
          return newParticipant;
        }
        return p;
      });
    } else {
      // New entry
      newParticipants = [...participants, newParticipant];
    }

    if (deleteParticipantId) {
      newParticipants = participants.filter((p) => p.id != deleteParticipantId);
    }

    console.log("in handleRuleChecks(), after, newParticipants:", newParticipants);

    // Check for whatsapp_no.
    if (!deleteParticipantId && (newParticipant?.whatsappNumber.length > 11 || newParticipant?.whatsappNumber.length < 10)) {
      setIsValid(false);
      if (isSubmitting) {
        alert(`Please provide a valid number, currently ${newParticipant?.whatsappNumber.length}!`);
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

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!handleRuleChecks(true)) {
      alert("Please provide the correct participant entries... check the rules");
      return;
    }

    const accompanist = Number(availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")?.value);
    const maxParticipants = Number(availableEvent.eventRules.find((r) => r.eventRuleTemplate.name == "MAX_PARTICIPANTS")?.value);
    if ((accompanist && [...participants, newParticipant].length > accompanist + maxParticipants) || [...participants, newParticipant].filter((p) => p.type == "PERFORMER").length > maxParticipants) {
      alert("You can't add the details now... please refresh the page!");
      return;
    }

    console.log(newParticipant);

    const tmpParticipant = {
      ...newParticipant,
      collegeId: filteredParticipants[0].collegeId,
      entryType: filteredParticipants[0].entryType,
      teamNumber: filteredParticipants[0].teamNumber,
      eventIds: filteredParticipants[0].eventIds,
    };
    if (tmpParticipant.type == null) {
      alert("Please provide the valid participant type!");
      return;
    }
    console.log("tmpParticipant:", tmpParticipant);
    setLoadingSave(true);
    try {
      const response = await addParticipant(tmpParticipant);
      console.log(response);

      setParticipants([...participants, response]);
      setFilteredParticipants([...filteredParticipants, response]);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    } finally {
      handleModalClose();
      setLoadingSave(false);
    }
  };

  console.log("newParticipant:", newParticipant);
  console.log("event:", event);
  return (
    newParticipant &&
    event && (
      <Modal show={show} centered size="lg" onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-light">Add Participants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="w-100">
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label style={{ width: "200px" }}>Name</Form.Label>
              <Form.Control type="text" name="name" value={newParticipant?.name} onChange={handleInputChange} required className="w-100" />
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label style={{ width: "200px" }}>Email</Form.Label>
              <Form.Control type="email" name="email" value={newParticipant?.email} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label style={{ width: "200px" }}>Phone</Form.Label>
              <Form.Control type="text" name="whatsappNumber" value={newParticipant?.whatsappNumber} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3 d-flex gap-2 align-items-center">
              <Form.Label style={{ width: "200px" }}>Gender: </Form.Label>
              <div className="d-flex gap-5">
                <Form.Check
                  type="radio"
                  label="Male"
                  name={`male`} // Unique name for each participant's radio group
                  checked={newParticipant?.male}
                  onChange={() => {
                    handleInputChange({
                      target: { name: "male", value: true },
                    });
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Female"
                  name={`male`} // Same unique name for the pair
                  checked={!newParticipant?.male}
                  onChange={() => {
                    handleInputChange({
                      target: { name: "male", value: false },
                    });
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3 d-flex align-items-center gap-2">
              <Form.Label style={{ width: "200px" }}>Type</Form.Label>
              <Form.Select
                aria-label="Default select example"
                name="type"
                value={newParticipant?.type || "NONE"}
                onChange={(e) => {
                  setNewParticipant((prev) => ({
                    ...prev,
                    type: e.target.value == "NONE" ? null : e.target.value,
                  }));
                }}
                //   disabled={!availableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
              >
                <option value="NONE">Select the type</option>
                <option value={"ACCOMPANIST"}>ACCOMPANIST</option>
                <option value={"PERFORMER"}>PERFORMER</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center gap-2">
              <Form.Label style={{ width: "200px" }}>Hand Preference</Form.Label>
              <Form.Select
                aria-label="Default select example"
                name="handPreference"
                value={newParticipant?.handPreference}
                onChange={handleInputChange}
                //   disabled={!selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
              >
                <option value={"LEFT_HANDED"}>LEFT_HANDED</option>
                <option value={"RIGHT_HANDED"}>RIGHT_HANDED</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center gap-2">
              <Form.Label style={{ width: "200px" }}>Team</Form.Label>
              <Form.Select
                aria-label="Default select example"
                name="group"
                value={newParticipant?.group}
                onChange={(e) => {
                  setGroup(e.target.value);
                  handleInputChange(e);
                }}
                //   disabled={!selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
              >
                {groups?.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-5 d-flex align-items-center gap-2">
              <Form.Label style={{ width: "200px" }}>Entry</Form.Label>
              <Form.Select
                aria-label="Default select example"
                name="entryType"
                value={newParticipant?.entryType}
                onChange={(e) => {
                  setGroup(e.target.value);
                  handleInputChange(e);
                }}
                disabled
              >
                <option value="NORMAL">NORMAL</option>
                <option value="OTSE">OTSE</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="primary" className="round-0" disabled={loading} onClick={handleAdd}>
            {loadingSave ? "Please Wait..." : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  );
}
