/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import styles from "../../styles/CollegeParticipation.module.css";

export default function StatsCards({ participants }) {
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const tmpEvents = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = 0; j < participants[i].eventIds.length; j++) {
        if (tmpEvents.includes(participants[i].eventIds[j])) {
          continue;
        }
        tmpEvents.push(participants[i].eventIds[j]);
      }
    }

    setTotalEvents(tmpEvents.length);
  }, [participants]);

  return (
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
              {totalEvents}
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
              {participants.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
