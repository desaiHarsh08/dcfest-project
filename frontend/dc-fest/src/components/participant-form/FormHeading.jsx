/* eslint-disable react/prop-types */
import { Alert } from "react-bootstrap";
import { FaRegCalendarAlt } from "react-icons/fa";

const FormHeading = ({ type = "REGISTRATION", showAlert, setShowAlert }) => {
  console.log(type);

  return (
    <div className="text-center mb-4">
      {showAlert && (
        <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
          Registration successful!
        </Alert>
      )}
      <FaRegCalendarAlt size={50} color="#0d6efd" />
      <h2 className="mt-3">Event Registration</h2>
      <p className="text-muted">Fill out the form below to register for an event.</p>
    </div>
  );
};

export default FormHeading;
