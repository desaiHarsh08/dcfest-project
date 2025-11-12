/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import styles from "../../styles/CollegeParticipation.module.css"; // Import custom styles

import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByEventIdAndCollegeId, fetchParticipantsByCollegeId } from "../../services/participants-api";

const CollegeParticipation = ({ participations }) => {
  console.log("in cp, participations:", participations);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    if (participations && participations.length > 0) {
      const fetchAllParticipants = async () => {
        const collegeId = participations[0]?.collegeId;
        if (!collegeId) {
          setTotalParticipants(0);
          return;
        }

        try {
          // Fetch all participants for the college (single API call)
          const allCollegeParticipants = await fetchParticipantsByCollegeId(collegeId);

          if (!Array.isArray(allCollegeParticipants) || allCollegeParticipants.length === 0) {
            setTotalParticipants(0);
            return;
          }

          // Fetch all events in parallel (fastest approach)
          const eventPromises = participations.map((p) => fetchEventByAvailableEventId(p.availableEventId).catch(() => null));
          const events = await Promise.all(eventPromises);

          // Build set of enrolled event IDs
          const enrolledEventIds = new Set();
          events.forEach((event) => {
            if (event?.id) enrolledEventIds.add(event.id);
          });

          // Count participants whose eventIds match enrolled events
          const totalCount = allCollegeParticipants.filter((participant) => {
            const participantEventIds = participant.eventIds || [];
            return participantEventIds.some((eventId) => enrolledEventIds.has(eventId));
          }).length;

          setTotalParticipants(totalCount);
        } catch (error) {
          console.error("Error fetching participant count:", error);
          // Fallback: count per event in parallel
          try {
            const counts = await Promise.allSettled(
              participations.map(async (p) => {
                try {
                  const event = await fetchEventByAvailableEventId(p.availableEventId);
                  if (event?.id) {
                    const participants = await fetchParticipantsByEventIdAndCollegeId(event.id, collegeId);
                    return Array.isArray(participants) ? participants.length : 0;
                  }
                  return 0;
                } catch {
                  return 0;
                }
              })
            );
            const totalCount = counts.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value : 0), 0);
            setTotalParticipants(totalCount);
          } catch {
            setTotalParticipants(0);
          }
        }
      };

      fetchAllParticipants();
    } else {
      setTotalParticipants(0);
    }
  }, [participations]);

  return (
    <div className={`container ${styles.participationStats} mt-4`}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-4 mb-4">
          <div className={`card ${styles["custom-card"]} h-100 `} style={{ backgroundColor: "red", color: "white" }}>
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a suitable icon, e.g., Total icon */}
                <i className="fas fa-users"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Total Events Registered
              </h5>
              <p className={`card-text ${styles.statValue}`} style={{ color: "white" }}>
                {participations.length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-4">
          <div className={`card ${styles["custom-card"]} ${styles.successCard} h-100`} style={{ backgroundColor: "green", color: "white" }}>
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a success-related icon */}
                <i className="fas fa-check-circle"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Total Students Participated
              </h5>
              <p className={`card-text ${styles.statValue}`} style={{ color: "white" }}>
                {totalParticipants}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeParticipation;
