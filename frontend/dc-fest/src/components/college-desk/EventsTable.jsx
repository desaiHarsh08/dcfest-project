/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";
import EventRow from "./EventRow";

const EventsTable = ({ events, onView, onRemove }) => {
  console.log("events:", events);
  return (
    <>
      {events?.length == 0 ? (
        <>
          <h4 className="text-center text-muted">Oops! No events found yet.</h4>
          <p className="text-center text-secondary">
            Don&apos;t let your participation stay empty—kickstart the excitement by
            enrolling in your next event today!
          </p>
        </>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Category</th>
              <th>Event</th>
              <th>Teams/Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events &&
              events?.map((event, index) => (
                <>
                  <EventRow
                    index={index}
                    key={`event-${index}`}
                    availableEventId={event.availableEventId}
                    collegeId={event?.collegeId}
                    onRemove={() => {}}
                  />
                </>
              ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default EventsTable;
