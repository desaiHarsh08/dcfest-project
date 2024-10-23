import React, { useEffect, useState } from "react";
import styles from "../../styles/ParticipationStats.module.css"; // Import custom styles
import { fetchColleges } from "../../services/college-apis";

const ParticipationStats = () => {
  const [stats, setStats] = useState();
  useEffect(() => {
    fetchColleges().then((data) => {
      console.log(data);
      const total = data.length;
      const sucessfulRegistration = data.filter(
        (ele) => ele.detailsUploaded
      ).length;
      const incompleteRegistration = total - sucessfulRegistration;
      setStats({
        total,
        sucessfulRegistration,
        incompleteRegistration,
      });
    });
  }, []);

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
                Total Registration
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {stats?.total}
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
                Successful Registration
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {stats?.sucessfulRegistration}
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
                Incomplete Registration
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {stats?.incompleteRegistration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationStats;
