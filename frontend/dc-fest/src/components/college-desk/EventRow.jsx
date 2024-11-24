/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchAvailableEventsById } from "../../services/available-events-apis";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import CategoryName from "./CategoryName";
import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByEventId } from "../../services/participants-api";

const EventRow = ({ index, availableEventId, onRemove }) => {
  const [event, setEvent] = useState();
  const [availableEvent, setAvailableEvent] = useState();

  const [participants, setParticipants] = useState([]);
  const [otseEntry, setOtseEntry] = useState([]);

  useEffect(() => {
    console.log("availableEventId:", availableEventId);
    fetchEventByAvailableEventId(availableEventId)
      .then((data) => {
        setEvent(data);
        console.log(data);
        fetchAvailableEventsById(data.availableEventId)
          .then((data) => {
            console.log("available event: ", data);
            setAvailableEvent(data);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log("Unable to fetch the event data", err));
  }, [availableEventId]);

  useEffect(() => {
    if (event) {
      fetchParticipantsByEventId(event?.id)
        .then((data) => {
          console.log(data);
          setParticipants(data);
          setOtseEntry(data.filter((ele) => ele.entryType.toLowerCase() == "otse").length);
        })
        .catch((err) => console.log(err));
    }
  }, [event]);

  return (
    <tr>
      <td>{index + 1}</td>
      <CategoryName categoryId={availableEvent?.eventCategoryId} />
      <td>{availableEvent?.title}</td>
      <td>{participants.length}</td>
      <td>{participants.length - otseEntry}</td>
      <td>{otseEntry}</td>
      <td className="d-flex justify-content-center align-items-center">
        <Link to={`${event?.id}`} className="btn btn-primary text-decoration-none">
          View
        </Link>
        {/* <Button variant="danger" onClick={() => onRemove(index)}>
          Remove
        </Button> */}
      </td>
    </tr>
  );
};

export default EventRow;
