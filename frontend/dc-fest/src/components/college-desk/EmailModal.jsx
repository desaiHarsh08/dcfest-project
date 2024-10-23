import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { generateOTP, verifyOTP } from "../../services/auth-apis";

const EmailModal = ({
  email,
  verifyOtpStatus,
  setVerifyOtpStatus,
  isCollege,
  index,
}) => {
  useEffect(() => {
    console.log(email);
  }, [email]);

  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleGenerateOtp = async () => {
    try {
      const response = await generateOTP({ email });
      console.log(response);
    } catch (error) {
      console.log("Unable to generate the OTP", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOTP({ email, otp });
      console.log(response);
      if (isCollege) {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          emailCollege: true,
        }));
      } else if (index == 0) {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          email1: true,
        }));
      } else {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          email2: true,
        }));
      }
      setShowModal(false)
    } catch (error) {
      console.log("Unable to generate the OTP", error);
    }
  };

  return (
    <>
      <Button
      disabled={(verifyOtpStatus?.emailCollege|| verifyOtpStatus?.email1 || verifyOtpStatus.email2)}
        variant="outline-secondary"
        onClick={() => {
          setShowModal(true);
          handleGenerateOtp();
        }}
      >
        {(verifyOtpStatus?.emailCollege|| verifyOtpStatus?.email1 || verifyOtpStatus.email2)?"Verified! ":  "Generate OTP"}
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
