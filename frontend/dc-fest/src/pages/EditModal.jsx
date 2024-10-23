import React, { useState } from 'react';
import styles from '../styles/EditModal.module.css';

const EditModal = ({ isOpen, onClose, event, onUpdate }) => {
    const [eventDetails, setEventDetails] = useState(event);
    const [eventRounds, setEventRounds] = useState(event?.rounds || []);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoundsChange = (index, value) => {
        const updatedRounds = [...eventRounds];
        updatedRounds[index] = value;
        setEventRounds(updatedRounds);
    };

    const addRound = () => {
        setEventRounds((prev) => [...prev, '']);
    };

    const removeRound = (index) => {
        setEventRounds((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedEvent = {
            ...eventDetails,
            rounds: eventRounds,
        };
        onUpdate(updatedEvent);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Event</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <form onSubmit={handleSubmit}>
                    {/* Event Details Form */}
                    <div className={styles.formGroup}>
                        <label>Type</label>
                        <input
                            type="text"
                            name="type"
                            value={eventDetails.type}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Venue</label>
                        <input
                            type="text"
                            name="venue"
                            value={eventDetails.venue}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Start Date & Time</label>
                        <input
                            type="datetime-local"
                            name="start"
                            value={eventDetails.start}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>End Date & Time</label>
                        <input
                            type="datetime-local"
                            name="end"
                            value={eventDetails.end}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Max Participants</label>
                        <input
                            type="number"
                            name="maxParticipants"
                            value={eventDetails.maxParticipants}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Min Participants</label>
                        <input
                            type="number"
                            name="minParticipants"
                            value={eventDetails.minParticipants}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TIME_LIMIT (minutes)</label>
                        <input
                            type="number"
                            name="timeLimit"
                            value={eventDetails.timeLimit}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>OTSE</label>
                        <input
                            type="text"
                            name="otse"
                            value={eventDetails.otse}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Event Rounds */}
                    <h3>Event Rounds</h3>
                    {eventRounds.map((round, index) => (
                        <div key={index} className={styles.formGroup}>
                            <input
                                type="text"
                                value={round}
                                onChange={(e) => handleRoundsChange(index, e.target.value)}
                                placeholder={`Round ${index + 1}`}
                                required
                            />
                            <button type="button" onClick={() => removeRound(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addRound}>Add Round</button>

                    <button type="submit" className={styles.submitButton}>Update Event</button>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
