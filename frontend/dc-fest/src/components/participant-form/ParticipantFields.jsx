/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Badge, Form } from "react-bootstrap";

const ParticipantFields = ({ participant, participantIndex, onChange, selectedAvailableEvent, iccode, hasNormalParticipants = false }) => {
  useEffect(() => {}, [selectedAvailableEvent]);

  // Check if OTSE slots are available
  const otseSlotsRule = selectedAvailableEvent?.eventRules?.find((rule) => rule.eventRuleTemplate.name == "OTSE_SLOTS");
  const otseSlotsAvailable = otseSlotsRule ? Number(otseSlotsRule.value) : 0;
  const isOtseAvailable = otseSlotsAvailable > 0;

  // Check if WAITING_LIST is available (from participant object set by ParticipationForm)
  const isWaitingListAvailable = participant?.isWaitingListAvailable === true;

  return (
    <div className="card p-3 rounded-0">
        {/* {JSON.stringify(participant)} */}
      <h5>Participant-{participantIndex + 1}</h5>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Name" name="name" value={participant?.name} onChange={(e) => onChange(e, participantIndex)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="email" placeholder="Email" name="email" value={participant?.email} onChange={(e) => onChange(e, participantIndex)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Whatsapp No." name="whatsappNumber" value={participant?.whatsappNumber} onChange={(e) => onChange(e, participantIndex)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check
          type="radio"
          label="Male"
          name={`gender-${participantIndex}`} // Unique name for each participant's radio group
          checked={participant.male}
          onChange={(e) => onChange({ target: { name: "male", value: true } }, participantIndex)}
        />
        <Form.Check
          type="radio"
          label="Female"
          name={`gender-${participantIndex}`} // Same unique name for the pair
          checked={!participant.male}
          onChange={(e) => onChange({ target: { name: "male", value: false } }, participantIndex)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Select
          aria-label="Default select example"
          name="type"
          value={participant.type}
          onChange={(e) => onChange(e, participantIndex)}
          //   disabled={!selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
          disabled
        >
          <option value={"ACCOMPANIST"}>ACCOMPANIST</option>
          <option value={"PERFORMER"}>PERFORMER</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-5">
        <Form.Label>Hand Preference </Form.Label>
        <Form.Select
          aria-label="Default select example"
          name="handPreference"
          value={participant.handPreference}
          onChange={(e) => onChange(e, participantIndex)}
          //   disabled={!selectedAvailableEvent?.eventRules.find((rule) => rule.eventRuleTemplate.name == "COLLEGE_ACCOMPANIST")}
        >
          <option value={"LEFT_HANDED"}>LEFT_HANDED</option>
          <option value={"RIGHT_HANDED"}>RIGHT_HANDED</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-5">
        <Form.Label>Entry Type</Form.Label>
        <Form.Select
          aria-label="Default select example"
          name="entryType"
          disabled={!!iccode || participant.isWaitingListForced}
          value={participant.entryType}
          onChange={(e) => {
            // Prevent selecting NORMAL if college already has NORMAL participants
            if (e.target.value === "NORMAL" && hasNormalParticipants) {
              alert("Your college has already added participants with NORMAL entry type. Only one NORMAL entry is allowed per college. Please select OTSE or WAITING_LIST instead.");
              return;
            }
            onChange(e, participantIndex);
          }}
        >
          <option value={"NORMAL"} disabled={hasNormalParticipants}>
            NORMAL {hasNormalParticipants ? "(Already Added)" : ""}
          </option>
          <option value={"OTSE"} disabled={!isOtseAvailable}>
            OTSE {!isOtseAvailable ? "(Not Available)" : ""}
          </option>
          {isWaitingListAvailable && <option value={"WAITING_LIST"}>WAITING_LIST</option>}
        </Form.Select>
        {hasNormalParticipants && <Form.Text className="text-muted">Your college already has participants with NORMAL entry type. Only one NORMAL entry is allowed per college.</Form.Text>}
      </Form.Group>
    </div>
  );
};

export default ParticipantFields;
