import React from "react";
import styles from "../../styles/CollegeParticipation.module.css"; // Import custom styles

const CollegeParticipation = ({ college }) => {
  return (
    <div className={`container ${styles.participationStats} mt-4`}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-4 mb-4">
          <div
            className={`card ${styles["custom-card"]} h-100 `}
            style={{ backgroundColor: "red", color: "white" }}
          >
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a suitable icon, e.g., Total icon */}
                <i className="fas fa-users"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Total Events Partcipated
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {college?.participations.length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-4">
          <div
            className={`card ${styles["custom-card"]} ${styles.successCard} h-100`}
            style={{ backgroundColor: "green", color: "white" }}
          >
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a success-related icon */}
                <i className="fas fa-check-circle"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Student participation
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                0
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-4">
          <div
            className={`card ${styles["custom-card"]} ${styles.warningCard} h-100`}
            style={{ backgroundColor: "blue", color: "white" }}
          >
            <div className="card-body text-center">
              <div className={styles.icon}>
                {/* Add a warning-related icon */}
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                College
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
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
