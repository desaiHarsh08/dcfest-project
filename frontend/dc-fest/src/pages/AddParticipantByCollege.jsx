/* eslint-disable no-unused-vars */
import { Link, useNavigate, useParams } from "react-router-dom";
import ParticipationForm from "../components/participant-form/ParticipationForm";
import { useEffect, useState } from "react";
import { fetchEventById } from "../services/event-apis";
import { fetchAvailableEventsById } from "../services/available-events-apis";
import { fetchCollegeByIcCode } from "../services/college-apis";
import { fetchParticipantsByEventIdAndCollegeId, fetchSlotsOccupiedForEvent, fetchWaitingListSlotsOccupiedByAvailableEvent } from "../services/participants-api";
import { fetchParticipationByCollegeIdAndAvailableEventId } from "../services/college-participation-apis";

export default function AddParticipantByCollege() {
  const navigate = useNavigate();
  const { iccode, eventId } = useParams();
  console.log("IC Code:", iccode);

  const [event, setEvent] = useState(null);
  const [availableEvent, setAvailableEvent] = useState(null);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state
  const [participants, setParticipants] = useState([]);
  const [slotsOccupied, setSlotsOccupied] = useState();
  const [waitingListSlotsOccupied, setWaitingListSlotsOccupied] = useState(null);
  const [collegeParticipation, setCollegeParticipation] = useState(null);

  useEffect(() => {
    fetchCollegeByIcCode(iccode)
      .then((data) => setCollege(data))
      .catch((err) => console.log(err));
  }, [iccode]);

  // Fetch college participation when both college and availableEvent are available
  useEffect(() => {
    if (college && availableEvent) {
      fetchCollegeParticipation(college.id, availableEvent.id);
    }
  }, [college, availableEvent]);

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
        // getSlotsOccupied uses eventId (EventModel ID), not availableEventId
        if (eventId) {
          getSlotsOccupied(eventId);
        }
        // Fetch waiting list slots if event has waiting list quota
        const hasWaitingList = availableEventData.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList && availableEventData.id) {
          getWaitingListSlotsOccupied(availableEventData.id);
        }
        // Note: College participation will be fetched in the useEffect that depends on college and availableEvent
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to fetch event or available event data.");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (event && college && slotsOccupied && availableEvent) {
      fetchParticipantsByEventIdAndCollegeId(eventId, college.id).then((data) => {
        console.log(data);
        setParticipants(data);
        const maxSlotsAvailable = availableEvent.eventRules?.find((rule) => rule.eventRuleTemplate?.name == "REGISTERED_SLOTS_AVAILABLE")?.value;

        if (!maxSlotsAvailable) navigate(`/${iccode}/${eventId}`);

        // if (data.length > 0 || slotsOccupied + 1 > maxSlotsAvailable || new Date() > new Date("2025-12-11T14:00:00")) {
        //   navigate(`/${iccode}/${eventId}`);
        // }
      });
    }
  }, [eventId, college, slotsOccupied, availableEvent, event, iccode]);

  const getSlotsOccupied = async () => {
    try {
      console.log("here fetching, eventId:", eventId);
      const response = await fetchSlotsOccupiedForEvent(eventId);
      console.log("response:", availableEvent?.title, response);
      setSlotsOccupied(response);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch the details!");
    }
  };

  const getWaitingListSlotsOccupied = async (availableEventId) => {
    try {
      const response = await fetchWaitingListSlotsOccupiedByAvailableEvent(availableEventId);
      console.log("Waiting list slots occupied:", response);
      setWaitingListSlotsOccupied(response);
    } catch (error) {
      console.log("Error fetching waiting list slots:", error);
      setWaitingListSlotsOccupied(0);
    }
  };

  const fetchCollegeParticipation = async (collegeId, availableEventId) => {
    try {
      const response = await fetchParticipationByCollegeIdAndAvailableEventId(collegeId, availableEventId);
      console.log("College participation:", response);
      setCollegeParticipation(response);
    } catch (error) {
      console.log("Error fetching college participation:", error);
      // If participation doesn't exist, that's okay - college hasn't enrolled yet
      setCollegeParticipation(null);
    }
  };

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
    <div className=" vh-100 d-flex flex-column justify-content-center ">
      <div>
        <Link to={`../`} className="btn btn-outline-primary" style={{ textDecoration: "none" }}>
          &larr; Back
        </Link>
      </div>
      {iccode && availableEvent && college && (
        <ParticipationForm 
          formType="REGISTRATION" 
          iccode={iccode} 
          availableEvent={availableEvent} 
          college={college}
          slotsOccupied={slotsOccupied}
          waitingListSlotsOccupied={waitingListSlotsOccupied}
          collegeParticipation={collegeParticipation}
        />
      )}
    </div>
  );
}
