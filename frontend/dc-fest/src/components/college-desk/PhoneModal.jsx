import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { generateOTP, verifyOTP } from "../../services/auth-apis";
import { Prev } from "react-bootstrap/esm/PageItem";

const PhoneModal = ({
  phone,
  verifyOtpStatus,
  setVerifyOtpStatus,
  isCollege,
  index,
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
      if (isCollege) {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          phoneCollege: true,
        }));
      } else if (index == 0) {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          phone1: true,
        }));
      } else {
        setVerifyOtpStatus((prev) => ({
          ...prev,
          phone2: true,
        }));
      }
    } catch (error) {
      console.log("Unable to generate the OTP", error);
    }
  };

  return (
    <>
      <Button
       disabled={(verifyOtpStatus?.phoneCollege|| verifyOtpStatus?.phone1 || verifyOtpStatus.phone2)}
        variant="outline-secondary"
        onClick={() => {
          setShowModal(true);
          handleGenerateOtp();
        }}
      >
        {(verifyOtpStatus?.phoneCollege|| verifyOtpStatus?.phone1 || verifyOtpStatus.phone2)?"Verified! ":  "Generate OTP"}
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
