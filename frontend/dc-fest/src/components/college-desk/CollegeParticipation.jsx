/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import styles from "../../styles/CollegeParticipation.module.css"; // Import custom styles

import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByEventIdAndCollegeId } from "../../services/participants-api";

const CollegeParticipation = ({ participations }) => {
  console.log("in cp, participations:", participations);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    if (participations && participations.length > 0) {
      // Fetch participants for each event in the participations list
      const fetchAllParticipants = async () => {
        let totalCount = 0;
        const collegeId = participations[0]?.collegeId;

        for (const participation of participations) {
          try {
            // Fetch event by availableEventId
            const event = await fetchEventByAvailableEventId(participation.availableEventId);
            if (event?.id && collegeId) {
              // Fetch participants for this specific event and college
              const participants = await fetchParticipantsByEventIdAndCollegeId(event.id, collegeId);
              totalCount += participants.length;
            }
          } catch (error) {
            console.error(`Error fetching participants for event ${participation.availableEventId}:`, error);
            // Continue with other events even if one fails
          }
        }

        console.log("in college_participations, total participants count:", totalCount);
        setTotalParticipants(totalCount);
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
