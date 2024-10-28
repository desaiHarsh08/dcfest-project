import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { generateOTP, verifyOTP } from "../../services/auth-apis";
import "../../styles/PhoneModal.css";

const PhoneModal = ({
  phone,
  index,
  users,
  setUsers,
}) => {
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log(phone);
  }, [phone]);

  const handleGenerateOtp = async () => {
    try {
      const response = await generateOTP({ phone });
      console.log(response);
    } catch (error) {
      console.log("Unable to generate the OTP", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOTP({ phone, otp });
      console.log(response);
      const newUsers = users.map((user, idx) => {
        if (idx === index) {
          return { ...user, phoneVerified: true }
        }
        return user;
      })
      setUsers(newUsers);
      setShowModal(false);
    } catch (error) {
      console.log("Unable to verify the OTP", error);
    }
  };

  return (
    <>
      <Button
        disabled={users[index]?.phoneVerified}
        variant="outline-secondary"
        onClick={() => {
          setShowModal(true);
          handleGenerateOtp();
        }}
      >
        {users[index]?.phoneVerified ? "Verified!" : "Get OTP"}
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phone Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>We have sent an OTP to {phone}. Please enter the OTP below:</p>
          <Form.Group controlId="otp">
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="otp-input"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleVerifyOtp}>
            Verify OTP
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PhoneModal;
