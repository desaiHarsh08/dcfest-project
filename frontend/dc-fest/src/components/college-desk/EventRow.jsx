/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from "react";
import { fetchAvailableEventsById } from "../../services/available-events-apis";
import { Link } from "react-router-dom";
import CategoryName from "./CategoryName";
import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByEventIdAndCollegeId } from "../../services/participants-api";
import { fetchParticipationByCollegeIdAndAvailableEventId } from "../../services/college-participation-apis";
import { Badge } from "react-bootstrap";
import { initWebSocket, subscribeToWaitingListPromotion } from "../../services/websocketService";

const EventRow = ({ index, availableEventId, collegeId,  }) => {
  const [event, setEvent] = useState();
  const [availableEvent, setAvailableEvent] = useState();
  const [participants, setParticipants] = useState([]);
  const [collegeParticipation, setCollegeParticipation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch available event directly first
  useEffect(() => {
    if (availableEventId) {
      fetchAvailableEventsById(availableEventId)
        .then((data) => {
          setAvailableEvent(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Unable to fetch available event:", err);
          setLoading(false);
        });
    }
  }, [availableEventId]);

  // Fetch event model to get event ID for participants
  useEffect(() => {
    if (availableEventId) {
      fetchEventByAvailableEventId(availableEventId)
        .then((data) => {
            console.log("data:", data);
          setEvent(data);
        })
        .catch((err) => {
          console.error("Unable to fetch the event data:", err);
          // Event might not exist yet, that's okay
        });
    }
  }, [availableEventId]);

  useEffect(() => {
    if (event?.id && collegeId) {
      fetchParticipantsByEventIdAndCollegeId(event.id, collegeId)
        .then((data) => {
          setParticipants(data);
        })
        .catch((err) => {
          console.error("Unable to fetch participants:", err);
          setParticipants([]);
        });
    }
  }, [event, collegeId]);

  // Fetch college participation to check waiting list status
  const fetchCollegeParticipation = useCallback(() => {
    if (availableEventId && collegeId) {
      fetchParticipationByCollegeIdAndAvailableEventId(collegeId, availableEventId)
        .then((data) => {
          setCollegeParticipation(data);
        })
        .catch((err) => {
          console.error("Unable to fetch college participation:", err);
          setCollegeParticipation(null);
        });
    }
  }, [availableEventId, collegeId]);

  useEffect(() => {
    fetchCollegeParticipation();
  }, [fetchCollegeParticipation]);

  // WebSocket real-time updates for waiting list promotion
  useEffect(() => {
    if (!availableEventId) return;

    // Initialize WebSocket connection
    initWebSocket();

    // Subscribe to waiting list promotion events
    const subscription = subscribeToWaitingListPromotion(availableEventId, (data) => {
      console.log("📨 Waiting list promotion event received:", data);
      // Refetch college participation to check if waitingListSequence is now null
      fetchCollegeParticipation();
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [availableEventId, fetchCollegeParticipation]);

  // Show loading or error state
  if (loading) {
    return (
      <tr>
        <td>{index + 1}</td>
        <td colSpan={4} className="text-center">
          <span className="text-muted">Loading...</span>
        </td>
      </tr>
    );
  }

  // Show error state if available event is not found
  if (!availableEvent) {
    return (
      <tr>
        <td>{index + 1}</td>
        <td colSpan={4} className="text-center text-danger">
          <span>Event not found (ID: {availableEventId})</span>
        </td>
      </tr>
    );
  }

  

  return (
    <tr>
      <td>{index + 1}


        {/* {JSON.stringify(event)} */}
      </td>
      <td>
        {availableEvent?.eventCategoryId ? (
          <CategoryName categoryId={availableEvent.eventCategoryId} />
        ) : (
          <span className="text-muted">No Category</span>
        )}
      </td>
      <td>
        {availableEvent?.title ? (
          <div className="d-flex align-items-center gap-4 w-100">
            <div className="w-25 d-flex justify-content-end">
              <img
                src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}/${availableEvent.slug}.jpg`}
                alt={availableEvent.title}
                style={{ height: "52px", width: "52px", objectFit: "contain" }}
                onError={(e) => {
                  // Hide broken image
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="w-75 d-flex align-items-center gap-2">
              <p className="m-0">{availableEvent.title}</p>
              {collegeParticipation?.waitingListSequence && (
                <Badge bg="warning" text="dark" style={{ fontSize: "0.75rem" }}>
                  ⏳ Waiting List ({collegeParticipation.waitingListSequence})
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted">No Event Name</span>
        )}
      </td>
      <td>{participants.length}</td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        {/* Show View button if college has enrolled (has participation) OR if event exists */}
        {collegeParticipation || event?.id ? (
          <Link 
            to={`${event?.id}`} 
            className="btn btn-primary text-decoration-none"
          >
            View
          </Link>
        ) : (
          <span className="text-muted" title="Event will be created when you add participants">
            No Participants Yet
          </span>
        )}
      </td>
    </tr>
  );
};

export default EventRow;
