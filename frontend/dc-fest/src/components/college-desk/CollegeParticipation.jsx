/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import styles from "../../styles/CollegeParticipation.module.css"; // Import custom styles

import { fetchEventByAvailableEventId } from "../../services/event-apis";
import { fetchParticipantsByCollegeId, fetchParticipantsByEventIdAndCollegeId } from "../../services/participants-api";

const CollegeParticipation = ({ participations }) => {
  console.log("in cp, participations:", participations);
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState();

  useEffect(() => {
    if (participations && participations.length > 0) {
      fetchEventByAvailableEventId(participations[0]?.availableEventId).then((data) => {
        console.log("in college_participations, event fetched from availableEventId:", data);
        setEvent(data);
      });
    }
  }, [participations]);

  useEffect(() => {
    if (participations && participations.length > 0) {
      console.log("participations[0].collegeId:", participations[0].collegeId);
      fetchParticipantsByCollegeId(participations[0].collegeId).then((data) => {
        console.log("in college_participations, participants:", data);
        setParticipants(data);
      });
    }
  }, [event, participations]);

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
                Total Events Partcipated
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
                Student participation
              </h5>
              <p className={`card-text ${styles.statValue}`} style={{ color: "white" }}>
                {participants.length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-4">
          <div className={`card ${styles["custom-card"]} ${styles.warningCard} h-100`} style={{ backgroundColor: "blue", color: "white" }}>
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a warning-related icon */}
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                College
              </h5>
              <p className={`card-text ${styles.statValue}`} style={{ color: "white" }}>
                -
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeParticipation;
