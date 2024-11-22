/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchAvailableEventsById } from "../../services/available-events-apis";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import CategoryName from "./CategoryName";
import { fetchEventById } from "../../services/event-apis";

const EventRow = ({ index, eventId, onRemove }) => {
  const [event, setEvent] = useState();
  const [availableEvent, setAvailableEvent] = useState();

  useEffect(() => {
    fetchEventById(eventId)
      .then((data) => {
        setEvent(data);
        fetchAvailableEventsById(data.availableEventId)
          .then((data) => {
            console.log("available event: ", data);
            setAvailableEvent(data);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log("Unable to fetch the event data", err));
  }, [eventId]);

  return (
    <tr>
      <td>{index + 1}</td>
      <CategoryName categoryId={availableEvent?.eventCategoryId} />
      <td>{event?.title}</td>
      <td>{0}</td>
      <td>{0}</td>
      <td>{0}</td>
      <td className="d-flex justify-content-center align-items-center">
        <Link to={`${eventId}`} className="btn btn-primary text-decoration-none">
          View
        </Link>
        <Button variant="danger" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </td>
    </tr>
  );
};

export default EventRow;
