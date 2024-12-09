/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Badge, Form } from "react-bootstrap";

const ParticipantFields = ({ participant, participantIndex, onChange, selectedAvailableEvent }) => {
  useEffect(() => {}, [selectedAvailableEvent]);

  return (
    <div className="card p-3 rounded-0">
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

      <Form.Group className="mb-5">
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
      <div className="mb-3">{new Date() > new Date("2024-12-11T14:00:00") && <Badge bg="danger">OTSE</Badge>}</div>
    </div>
  );
};

export default ParticipantFields;
