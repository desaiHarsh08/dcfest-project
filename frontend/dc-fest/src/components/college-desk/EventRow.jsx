import { useEffect, useState } from "react";
import { fetchAvailableEventsById } from "../../services/available-events-apis";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { fetchCategoryById } from "../../services/categories-api";
import CategoryName from "./CategoryName";

const EventRow = ({ index, eventId, onRemove }) => {
  const [event, setEvent] = useState();

  useEffect(() => {
    fetchAvailableEventsById(eventId)
      .then((data) => {
        console.log("data: ", data);
        setEvent(data);
      })
      .catch((err) => console.log(err));
  }, [eventId]);

  return (
    <tr>
      <td>{index + 1}</td>
      <CategoryName categoryId={event?.id} />
      <td>{event?.title}</td>
      <td>{0}</td>
      <td>{0}</td>
      <td>{0}</td>
      <td className="d-flex justify-content-center align-items-center">
        <Link to={`${1}`} className="btn btn-primary text-decoration-none">
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
