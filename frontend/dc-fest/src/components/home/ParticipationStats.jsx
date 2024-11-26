import { useEffect, useState } from "react";
import styles from "../../styles/ParticipationStats.module.css"; // Import custom styles
import { fetchColleges } from "../../services/college-apis";
import { FaUsers, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"; // Import icons from react-icons

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
    <div className={'container ${styles.participationStats} mt-4'}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-4 mb-4">
          <div
            className={`card ${styles["custom-card"]} h-100 `}
            style={{ backgroundColor: "red", color: "white" }}
          >
            <div className="card-body text-center">
              <div className={styles.icon}>
                <FaUsers size={40} style={{color:"white"}} /> {/* Total icon */}
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Total Events Participated
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {!stats ? "..." : stats?.total}
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
                <FaCheckCircle size={40} style={{ color: "white" }} /> {/* Success-related icon */}
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
                Total Participants
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {!stats ? "..." : stats?.sucessfulRegistration}
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
                <FaExclamationCircle size={40} style={{ color: "white" }} /> {/* Warning-related icon */}
              </div>
              <h5 className="card-title" style={{ color: "white" }}>
               College Details
              </h5>
              <p
                className={`card-text ${styles.statValue}`}
                style={{ color: "white" }}
              >
                {!stats ? "..." : stats?.incompleteRegistration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationStats;