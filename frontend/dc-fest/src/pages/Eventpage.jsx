import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/EventPage.module.css";
import EditModal from "./EditModal";
import { fetchEventBySlug } from "../services/event-apis";
import { AuthContext } from "../providers/AuthProvider";

const EventPage = () => {
  const { user } = useContext(AuthContext);
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEventBySlug(eventSlug)
      .then((data) => setEvent(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [eventSlug]);

  const handleUpdate = (updatedEvent) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      ...updatedEvent,
    }));
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.eventPage}>
      {/* Breadcrumb Button */}
      {/* <button className={styles.breadcrumbButton} onClick={() => navigate(-1)}>
        ← Back
      </button> */}

      {event && (
        <div className={styles.container}>
          {/* Event Image */}
          <div className={styles.imageContainer}>
            <img
              src={`/${event.slug}.jpg`}
              alt={event.title}
              className={styles.coverImage}
            />
          </div>

          {/* Event Content */}
          <div className={styles.eventContent}>
            {/* Event Title and One-Liner */}
            <h1 className={styles.eventTitle}>{event.title}</h1>
            <h2 className={styles.oneLiner}>{event.oneLiner}</h2>

            {/* Event Description */}
            <p className={styles.eventDescription}>{event.description}</p>

            {/* Event Details (Type and Venue) */}
            <div className={styles.details}>
              <h3 className={styles.detailsHeading}>Event Details</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🎟️</span>
                  <p className={styles.detailText}>
                    <strong>Type:</strong> {event.type}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📍</span>
                  <p className={styles.detailText}>
                    <strong>Venue:</strong> {event.venues[0]?.name || "N/A"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🕒</span>
                  <p className={styles.detailText}>
                    <strong>Start:</strong>{" "}
                    {new Date(event.venues[0]?.start).toLocaleString() || "N/A"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🕓</span>
                  <p className={styles.detailText}>
                    <strong>End:</strong>{" "}
                    {new Date(event.venues[0]?.end).toLocaleString() || "N/A"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>👥</span>
                  <p className={styles.detailText}>
                    <strong>Max Participants:</strong>{" "}
                    {event.maxParticipants || 20}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>👤</span>
                  <p className={styles.detailText}>
                    <strong>Min Participants:</strong>{" "}
                    {event.minParticipants || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Rules */}
            <div className={styles.rulesSection}>
              <h3>Event Rules</h3>
              <ul className={styles.rulesList}>
                {event.eventRules.map((rule, index) => (
                  <li
                    key={index}
                    className={`${styles.ruleItem} d-flex align-items-center gap-2`}
                  >
                    <p className="fw-bold">{rule.type}:</p>
                    <p className="d-flex gap-2">
                      {rule.type !== "OTSE" && <span>{rule.value}</span>}
                      <span>{rule.type === "TIME_LIMIT" && "Min."}</span>
                      {rule.type === "OTSE" && (
                        <span>
                          {rule.type === "OTSE" ? "Allowed" : "Not Allowed"}
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Event Rounds */}
            <div className={styles.roundsSection}>
              <h3>Event Rounds</h3>
              <ul className={styles.roundsList}>
                {event.rounds.map((round, index) => (
                  <li key={index} className={styles.roundItem}>
                    <strong>{round.name}</strong>
                    <span>{round.roundType}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Edit Button */}
          <button className={styles.editButton} onClick={openModal}>
            Edit Event
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={event}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default EventPage;
