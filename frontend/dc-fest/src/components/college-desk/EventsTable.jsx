/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";
import EventRow from "./EventRow";

const EventsTable = ({ events, onView, onRemove }) => {
  console.log("events:", events);
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
        {events &&
          events?.map((event, index) => (
            <>
              {event.id}
              <EventRow index={index} key={`event-${index}`} eventId={event.id} ava onRemove={() => {}} />
            </>
          ))}
      </tbody>
    </Table>
  );
};

export default EventsTable;
