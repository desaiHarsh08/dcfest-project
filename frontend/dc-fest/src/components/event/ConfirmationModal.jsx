/* eslint-disable react/prop-types */
import { Modal, Button } from "react-bootstrap";

export default function ConfirmationModal({ show, isLoading, onHide, onConfirm, title, message }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirmation"}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "100px" }}>
        <p>{message || "Are you sure you want to proceed?"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" disabled={isLoading} className="rounded-2" onClick={onConfirm}>
          {isLoading ? "Please wait" : "Proceed"}
        </Button>
        {isLoading && <p>This may take few seconds...!</p>}
      </Modal.Footer>
    </Modal>
  );
}
