/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchAvailableEventsById } from "../../services/available-events-apis";
import { Link } from "react-router-dom";
import CategoryName from "./CategoryName";
import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByEventIdAndCollegeId } from "../../services/participants-api";

const EventRow = ({ index, availableEventId, collegeId, onRemove }) => {
  const [event, setEvent] = useState();
  const [availableEvent, setAvailableEvent] = useState();

  const [participants, setParticipants] = useState([]);
  const [otseEntry, setOtseEntry] = useState([]);

  useEffect(() => {
    fetchEventByAvailableEventId(availableEventId)
      .then((data) => {
        setEvent(data);
        fetchAvailableEventsById(data.availableEventId)
          .then((data) => {
            setAvailableEvent(data);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log("Unable to fetch the event data", err));
  }, [availableEventId]);

  useEffect(() => {
    if (event) {
      fetchParticipantsByEventIdAndCollegeId(event?.id, collegeId)
        .then((data) => {
          setParticipants(data);
          setOtseEntry(data.filter((ele) => ele.entryType.toLowerCase() == "otse").length);
        })
        .catch((err) => console.log(err));
    }
  }, [event, collegeId]);

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <CategoryName categoryId={availableEvent?.eventCategoryId} />
      </td>
      <td>
        <div className="d-flex align-items-center gap-4 w-100">
          <div className="w-25 d-flex justify-content-end">
            <img src={`/${availableEvent?.slug}.jpg`} alt={""} style={{ height: "52px", width: "52px", objectFit: "contain" }} />
          </div>
          <p className="w-75 d-flex">{availableEvent?.title}</p>
        </div>
      </td>
      <td>{participants.length}</td>
      <td className="d-flex justify-content-center align-items-center">
        <Link to={`${event?.id}`} className="btn btn-primary text-decoration-none">
          View
        </Link>
      </td>
    </tr>
  );
};

export default EventRow;
