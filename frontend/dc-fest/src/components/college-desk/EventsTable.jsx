import { Table } from "react-bootstrap";
import EventRow from "./EventRow";

const EventsTable = ({ events, onView, onRemove }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Sr. No</th>
          <th>Category</th>
          <th>Event</th>
          <th>Teams/Participants</th>
          <th>Normal Entry</th>
          <th>OTSE</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {events?.map((event, index) => (
          <EventRow
            index={index}
            key={`event-${index}`}
            eventId={event?.availableEventId}
            onRemove={() => {}}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default EventsTable;
