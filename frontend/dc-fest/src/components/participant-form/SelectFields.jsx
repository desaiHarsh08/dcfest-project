/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";

const SelectFields = ({
  selectedCategory,
  setSelectedCategory,
  onSetDefaultParticipants,
  categories,
  selectedAvailableEvent,
  setSelectedAvailableEvent,
  colleges,
  selectedCollege,
  setSelectedCollege,
  iccode,
  availableEvent,
}) => {
  console.log("in selects-field, iccode:", iccode);
  console.log("in selects-field, iccode:", availableEvent);
  return (
    <div id="event-participant-main-field" className="d-flex gap-3 w-100">
      <Form.Group className="field-card mb-4">
        <Form.Label>Category</Form.Label>
        <Form.Select
          value={selectedCategory?.id}
          onChange={(e) => {
            const category = categories?.find((c) => c?.id == e.target.value);
            setSelectedCategory(category);
            const availableEvent = category.availableEvents[0];
            setSelectedAvailableEvent(availableEvent);
            onSetDefaultParticipants(availableEvent);
          }}
          disabled={!!availableEvent}
          style={{ backgroundColor: availableEvent ? "aliceblue" : "" }}
        >
          {categories?.map((category, categoryIndex) => (
            <option key={`category-${categoryIndex}`} value={category.id}>
              {category?.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="field-card mb-4">
        <Form.Label>Event</Form.Label>
        <Form.Select
          value={selectedAvailableEvent?.id}
          onChange={(e) => {
            const availableEvent = selectedCategory?.availableEvents.find((a) => a.id == e.target.value);
            console.log("selected available event:", availableEvent);
            setSelectedAvailableEvent(availableEvent);
            onSetDefaultParticipants(availableEvent);
          }}
          disabled={!!availableEvent}
          style={{ backgroundColor: availableEvent ? "aliceblue" : "" }}
        >
          {selectedCategory?.availableEvents?.map((availableEvent, availableEventIndex) => (
            <option key={`available-event-${availableEventIndex}`} value={availableEvent?.id}>
              {availableEvent?.title}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-4 field-card">
        <Form.Label>{colleges?.length > 0 ? "College" : "No Colleges Available"}</Form.Label>
        <Form.Select
          style={{ backgroundColor: iccode ? "aliceblue" : "" }}
          value={selectedCollege?.id}
          onChange={(e) => {
            if (!iccode) {
              // Only allow change if iccode is undefined or falsy
              const college = colleges?.find((c) => c.id == e.target.value);
              setSelectedCollege(college);
            } else {
              console.log("College cannot be changed because iccode is provided:", iccode);
            }
          }}
          disabled={!!iccode}
        >
          {colleges?.map((college, collegeIndex) => (
            <option key={`college-${collegeIndex}`} value={college?.id}>
              {college?.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );
};

export default SelectFields;
