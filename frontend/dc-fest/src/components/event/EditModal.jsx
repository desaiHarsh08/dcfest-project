/* eslint-disable react/prop-types */
import styles from "../../styles/EditModal.module.css";
import EventForm from "../event-details-form/EventForm";
import { updateAvailableEvent } from "../../services/available-events-apis";

const EditModal = ({ isOpen, onClose, event, setEvent }) => {
  if (!isOpen) return null;

  const handleUpdateEvent = async (event) => {
    console.log("Updating event:", event);
    try {
      const response = await updateAvailableEvent(event);
      console.log(response);
    } catch (error) {
      alert(error.response.data);
      console.log(error);
    } finally {
      onClose();
    }
  };

  return (
    // <Modal show={isOpen} onHide={onClose} size="lg" centered>
    //   <Modal.Header closeButton>
    //     <Modal.Title>Edit Event</Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="d-flex justify-content-end">
          <button className="btn btn-light" type="button" onClick={onClose}>
            X
          </button>
        </div>
        <EventForm event={event} setEvent={setEvent} onConfirmAction={handleUpdateEvent} formType="Edit" />
      </div>
    </div>
    //   </Modal.Body>

    // </Modal>
  );
};

export default EditModal;
