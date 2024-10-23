// src/pages/EventAttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/EventAttendancePage.css'; // Import custom CSS for animations and styles
import { Button, Container, Alert, Modal } from 'react-bootstrap'; // Import Bootstrap components

const EventAttendancePage = () => {
  const [scannedData, setScannedData] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const qrCode = new Html5Qrcode("reader");
    setHtml5QrCode(qrCode);
  }, []);

  const startScanning = () => {
    if (!html5QrCode) return;

    html5QrCode.start(
      { facingMode: "environment" }, // Use the environment facing camera
      {
        fps: 10,
        qrbox: 250 // Width and height of the scanning box
      },
      (decodedText) => {
        setScannedData(decodedText);
        markAttendance(decodedText);
      },
      (errorMessage) => {
        // Handle scanning error if necessary
      }
    ).catch((err) => {
      setError('Error starting QR scanner: ' + err);
    });
  };

  const markAttendance = (data) => {
    setShowModal(true); // Show the modal with scanned data
  };

  const handlePresent = () => {
    setAttendanceMarked(true);
    setShowModal(false); // Close the modal
    stopScanning(); // Stop the scanner after marking attendance
  };

  const stopScanning = () => {
    if (html5QrCode) {
      html5QrCode.stop().catch((err) => {
        console.error('Failed to stop scanning:', err);
      });
    }
  };

  return (
    <Container className="attendance-container">
      <h1 className="title">Event Attendance</h1>
      <Button variant="primary" onClick={startScanning}>
        Start Scanning QR Code
      </Button>
      <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "20px auto" }}></div>

     
      {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

      {/* Modal for attendance confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="name">
              <p>Name:</p>
              <p>Harshit Desai</p>
            </div>
            <div className="category">
              <p>Category:</p>
              <p>Star Event</p>
            </div>
            <div className="eventName">
              <p>Event Name:</p>
              <p>Beat Boxing (HUM MEI HEI DUM!)</p>
            </div>
            <div className="eventType">
              <p>Event Type:</p>
              <p>Individual</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePresent}>
            Present
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventAttendancePage;
