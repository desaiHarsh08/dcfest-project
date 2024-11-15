/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";

const ParticipantFields = ({ participant, participantIndex, onChange }) => {
  console.log(participant);
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
    </div>
  );
};

export default ParticipantFields;
