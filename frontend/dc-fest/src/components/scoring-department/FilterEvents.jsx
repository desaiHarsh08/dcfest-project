/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";

const FilterEvents = ({ categories, categoryFilter, setCategoryFilter, setSelectedCategory, selectedCategory, eventFilter, setEventFilter, setAvailableEvent, setSelectedRound, selectedAvailableEvent, selectedRound }) => {
  return (
    <>
      {categories.length > 0 && (
        <Form.Select
          className="category-dropdown"
          value={categoryFilter}
          onChange={(e) => {
            const tmpSelectedCategory = categories.find((c) => c.id == e.target.value);
            setCategoryFilter(e.target.value);
            setSelectedCategory(tmpSelectedCategory);
            if (tmpSelectedCategory) {
              const firstEvent = tmpSelectedCategory.availableEvents[0];
              setEventFilter(firstEvent.id);
              setAvailableEvent(firstEvent);
              setSelectedRound(firstEvent.rounds[0]);
            }
          }}
        >
          {categories.map((category, categoryIndex) => (
            <option key={`category-${categoryIndex}`} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      )}
      {selectedCategory && (
        <div className="d-flex">
          <Form.Select
            className="event-dropdown me-2"
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);

              const tmpAvailableEvent = selectedCategory?.availableEvents?.find((ele) => ele.id == e.target.value);
              setAvailableEvent(tmpAvailableEvent);
              setSelectedRound(tmpAvailableEvent.rounds[0]);
            }}
          >
            {selectedCategory?.availableEvents?.map((availableEvent, availableEventIndex) => (
              <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
                {availableEvent.title}
              </option>
            ))}
          </Form.Select>
          {console.log("selectedRound:", selectedRound)}
          {selectedAvailableEvent && selectedRound && (
            <Form.Select
              className="event-dropdown me-2"
              value={selectedRound?.id}
              onChange={(e) => {
                const round = selectedAvailableEvent.rounds.find((r) => r.id == e.target.value);
                console.log("round in change:", round);
                setSelectedRound(round);
              }}
            >
              {selectedAvailableEvent?.rounds?.map((round, roundIndex) => (
                <option key={`round-${roundIndex}`} value={round.id}>
                  {round?.roundType}
                </option>
              ))}
            </Form.Select>
          )}
        </div>
      )}
    </>
  );
};

export default FilterEvents;
