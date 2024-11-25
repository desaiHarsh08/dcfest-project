/* eslint-disable no-unused-vars */
// import { useParams } from "react-router-dom";
// import ParticipationForm from "../components/participant-form/ParticipationForm";
// import { useEffect, useState } from "react";
// import { fetchEventByAvailableEventId, fetchEventById } from "../services/event-apis";
// import { fetchAvailableEventsById } from "../services/available-events-apis";

// export default function AddParticipantByCollege() {
//   const { iccode, eventId } = useParams();
//   console.log(iccode);

//   const [event, setEvent] = useState();
//   const [availableEvent, setAvailableEvent] = useState();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchEventById(eventId)
//       .then((data) => {
//         setEvent(data);
//         console.log(data);
//         fetchAvailableEventsById(data.availableEventId)
//           .then((data) => {
//             console.log("available event: ", data);
//             setAvailableEvent(data);
//           })
//           .catch((err) => console.log(err));
//       })
//       .catch((err) => console.log("Unable to fetch the event data", err));
//   }, [eventId]);

//   return (
//     <div className="container vh-100 d-flex justify-content-center align-items-center">
//       <ParticipationForm formType="REGISTRATION" iccode={iccode} availableEvent={availableEvent} />;
//     </div>
//   );
// }

import { Link, useParams } from "react-router-dom";
import ParticipationForm from "../components/participant-form/ParticipationForm";
import { useEffect, useState } from "react";
import { fetchEventById } from "../services/event-apis";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchCollegeByIcCode } from "../services/college-apis";

export default function AddParticipantByCollege() {
  const { iccode, eventId } = useParams();
  console.log("IC Code:", iccode);

  const [event, setEvent] = useState(null);
  const [availableEvent, setAvailableEvent] = useState(null);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  useEffect(() => {
    fetchCollegeByIcCode(iccode)
      .then((data) => setCollege(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch event data
    fetchEventById(eventId)
      .then((data) => {
        setEvent(data);
        console.log("Event data:", data);
        return fetchAvailableEventsById(data.availableEventId);
      })
      .then((availableEventData) => {
        console.log("Available Event data:", availableEventData);
        setAvailableEvent(availableEventData);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to fetch event or available event data.");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="container vh-100 d-flex flex-column justify-content-center align-items-center">
        <h1>Loading...</h1>
        <p className="pb-5 mb-5">Fetching the college details</p>
        <p>Please wait... this will take few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!availableEvent) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <p>No available event found for the provided event ID.</p>
      </div>
    );
  }

  return (
    <div className="container vh-100 d-flex flex-column justify-content-center ">
      <div>
        <Link to={`../`} className="btn btn-outline-primary" style={{ textDecoration: "none" }}>
          &larr; Back
        </Link>
      </div>
      {iccode && availableEvent && college && <ParticipationForm formType="REGISTRATION" iccode={iccode} availableEvent={availableEvent} college={college} />}
    </div>
  );
}
