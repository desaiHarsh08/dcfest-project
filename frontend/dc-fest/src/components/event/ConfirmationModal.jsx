/* eslint-disable react/prop-types */
import { Modal, Button } from "react-bootstrap";

export default function ConfirmationModal({ show, onHide, onConfirm, title, message }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirmation"}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{height: "100px"}}>
        <p>{message || "Are you sure you want to proceed?"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="rounded-2" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" className="rounded-2" onClick={onConfirm}>
          Proceed
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
