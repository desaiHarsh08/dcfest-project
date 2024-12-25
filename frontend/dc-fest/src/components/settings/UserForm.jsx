/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "../../styles/UserForm.css";
import { FaEdit } from "react-icons/fa";
const UserForm = ({ formType, user, onUserChange, onSave, index }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="d-flex justify-content-between">
        {formType == "ADD" && <h1 className="text-center mb-4">Settings</h1>}
        <Button variant={formType === "ADD" ? "primary" : "success"} size="sm" className="mb-4" onClick={() => setShowModal(true)}>
          {formType === "ADD" ? "Add User" : <FaEdit />}
        </Button>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title className="text-white">{formType === "ADD" ? "Add User" : "Edit User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="w-100">
            <Form.Group controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={user.name || ""} name="name" onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)} />
            </Form.Group>

            <Form.Group controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email || ""}
                disabled={formType != "ADD"}
                style={{ background: formType != "ADD" ? "aliceblue" : "" }}
                name="email"
                onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}
              />
            </Form.Group>

            <Form.Group controlId="formUserPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="text" value={user.password || ""} name="password" onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)} />
            </Form.Group>

            <Form.Group controlId="formUserPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" value={user.phone || ""} name="phone" onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)} />
            </Form.Group>
            <Form.Group controlId="formUserPhone">
              <Form.Label>Do Suspend?</Form.Label>
              <Form.Check type="switch" value={user.disabled} name="disabled" onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)} />
            </Form.Group>

            <Form.Group controlId="formUserType">
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" value={user.type || ""} name="type" onChange={(e) => onUserChange(e, formType === "ADD" ? null : index)}>
                <option value="ADMIN">ADMIN</option>
                <option value="REGISTRATION_DESK">REGISTRATION_DESK</option>
                <option value="ATTENDANCE_DESK">ATTENDANCE_DESK</option>
                <option value="SCORE_SHEET_DESK">SCORE_SHEET_DESK</option>
                <option value="SCORE_ENTRY_DESK">SCORE_ENTRY_DESK</option>
                <option value="REPORT_DESK">REPORT_DESK</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              onSave();
              setShowModal(false);
            }}
          >
            {formType === "ADD" ? "Create User" : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserForm;
