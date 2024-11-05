import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { generateOTP, verifyOTP } from "../../services/auth-apis";

const EmailModal = ({ email, index, users, setUsers }) => {
  useEffect(() => {
    setOtp("");
  }, []);

  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateOtp = async () => {
    setIsLoading(true);
    try {
      const response = await generateOTP({ email });
      console.log(response);
      setShowModal(true);
    } catch (error) {
      console.log("Unable to generate the OTP", error);
      alert("Unable to generate otp.. please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOTP({ email, otp });
      console.log(response);
      const newUsers = users.map((user, idx) => {
        if (idx === index) {
          return { ...user, emailVerified: true };
        }
        return user;
      });
      setUsers(newUsers);
      setShowModal(false);
    } catch (error) {
      console.log("Unable to generate the OTP", error);
    }
  };

  return (
    <>
      <Button
        disabled={users[index]?.emailVerified}
        variant="outline-secondary"
        onClick={() => {
          handleGenerateOtp();
        }}
      >
        {users[index]?.emailVerified
          ? "Verified! "
          : isLoading
          ? "Sending..."
          : "Get OTP"}
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>We have sent an OTP to {email}. Please enter the OTP below:</p>
          <Form.Group controlId="otp">
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              autoFocus
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

export default EmailModal;
