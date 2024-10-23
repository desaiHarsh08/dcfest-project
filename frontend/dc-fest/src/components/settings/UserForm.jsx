import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "../../styles/UserForm.css"
const UserForm = ({ formType, user = {}, onUserChange, onSave, index }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSave = () => {
    onSave();
    setShowModal(false); // Close modal after save
  };

  return (
    <>
      <div className="d-flex justify-content-start">
        <Button
          variant={formType === "ADD" ? "primary" : "danger"}
          className="mb-4" style={{width:"100px"}}
          onClick={() => setShowModal(true)}
        >
          {formType === "ADD" ? "Add User" : "Edit"} 
        </Button>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formType === "ADD" ? "Add User" : "Edit User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={user.name || ""}
                name="name"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              />
            </Form.Group>

            <Form.Group controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email || ""}
                name="email"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              />
            </Form.Group>

            <Form.Group controlId="formUserPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={user.password || ""}
                name="password"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              />
            </Form.Group>

            <Form.Group controlId="formUserPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={user.phone || ""}
                name="phone"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              />
            </Form.Group>

            <Form.Group controlId="formUserType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={user.type || ""}
                name="type"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              >
                <option value="">Select Type</option>
                <option value="Admin">ADMIN</option>
                <option value="Registration desk">REGISTRATION DESK</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            {formType === "ADD" ? "Create User" : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserForm;
