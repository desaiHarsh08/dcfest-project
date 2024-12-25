/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useContext } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../styles/EventAttendancePage.css"; // Import custom CSS for animations and styles
import { Button, Container, Alert, Modal, Row, Col, Card, ListGroup, Badge, Table } from "react-bootstrap"; // Import Bootstrap components
import { markAttendanceForParticipant, scanQrcode } from "../services/attendance-apis";
import { FaClipboardList, FaMapMarkerAlt, FaRegClock, FaTicketAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { AuthContext } from "../providers/AuthProvider";
import { replace, useNavigate } from "react-router-dom";
const EventAttendancePage = () => {
  const [scannedData, setScannedData] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(true); // Controls the visibility of the scanner
  const [qrData, setQrData] = useState();
  const [scannedQrcodeResponse, setScannedQrcodeResponse] = useState();
  const [presentParticipantIds, setPresentParticipantIds] = useState([]);
  const [round, setRound] = useState();

  const qrcodeReaderRef = useRef(null);

  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.type == "REGISTRATION_DESK" || user?.type == "SCORE_SHEET_DESK" || user?.type == "SCORE_ENTRY_DESK") {
      navigate(-1);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (qrcodeReaderRef) {
      const qrCode = new Html5Qrcode("reader");
      setHtml5QrCode(qrCode);
    }
  }, [qrcodeReaderRef]);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      //   weekday: "long", // Day of the week (e.g., Monday)
      year: "numeric", // Year (e.g., 2024)
      month: "long", // Month (e.g., November)
      day: "numeric", // Day (e.g., 14)
      hour: "2-digit", // Hour (e.g., 09)
      minute: "2-digit", // Minute (e.g., 30)
      //   second: "2-digit", // Second (e.g., 05)
      hour12: true, // Use AM/PM format
    });
  };

  const startScanning = () => {
    if (!html5QrCode) return;

    html5QrCode
      .start(
        { facingMode: "environment" }, // Use the environment-facing camera
        {
          fps: 10,
          qrbox: 250, // Width and height of the scanning box
        },
        (decodedText) => {
          setQrData(decodedText);
          markAttendance(decodedText); // After QR code is scanned, mark attendance
        },
        (errorMessage) => {
          // Handle scanning error if necessary
        }
      )
      .catch((err) => {
        setError("Error starting QR scanner: " + err);
      });
  };

  const markAttendance = async (data) => {
    stopScanning(); // Stop the QR code scanner
    setQrData(data); // Set the scanned QR data
    setShowScanner(false); // Hide the scanner after QR code is scanned
    try {
      console.log("qrdata:", data);
      const response = await scanQrcode(data);
      console.log(response);
      setScannedQrcodeResponse(response);
      const tmpPresentIds = [];
      for (let i = 0; i < response.participants.length; i++) {
        if (response.participants[i].present) {
          tmpPresentIds.push(response.participants[i].id);
        }
      }
      setPresentParticipantIds(tmpPresentIds);
      console.log("scanned qrcode response:", response);
      console.log(response.availableEvent.rounds.find((r) => r.id == response.roundId));
      setRound(response.availableEvent.rounds.find((r) => r.id == response.roundId));
    } catch (error) {
      console.log(error);
      alert("Invalid Qrcode...!");
      setScannedQrcodeResponse(undefined);
      setShowScanner(true);
      setQrData(undefined);
    }
  };

  const handleSelectAll = (e) => {
    const { checked, value } = e.target;
    console.log(value, checked);
    let newPresentParticipantIds = [];
    const newScannedQrcodeResponse = { ...scannedQrcodeResponse };
    const newParticipants = [...newScannedQrcodeResponse.participants];
    for (let i = 0; i < newParticipants.length; i++) {
      newParticipants[i].present = checked;
      if (checked) {
        if (!newPresentParticipantIds.includes(newParticipants[i].id)) {
          newPresentParticipantIds.push(newParticipants[i].id);
        }
      } else {
        newPresentParticipantIds = newPresentParticipantIds.filter((p) => newParticipants[i].id != p.id);
      }
    }

    newScannedQrcodeResponse.participants = newParticipants;
    setScannedQrcodeResponse(newScannedQrcodeResponse);

    setPresentParticipantIds(newPresentParticipantIds);
  };

  const handleMarkPresent = async (participantId, status) => {
    if (!participantId || !scannedQrcodeResponse) {
      return;
    }
    try {
      const response = await markAttendanceForParticipant(scannedQrcodeResponse?.roundId, scannedQrcodeResponse?.participants[0].collegeId, participantId, status);
      console.log("mark attendance:", response);

      try {
        console.log("qrdata:", qrData);
        const response = await scanQrcode(qrData);
        setScannedQrcodeResponse(response);
        console.log("scanned qrcode response:", response);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePresent = () => {
    setAttendanceMarked(true);
    setShowModal(false); // Close the modal after marking attendance
    stopScanning(); // Stop the scanner after marking attendance
  };

  const stopScanning = () => {
    if (html5QrCode) {
      html5QrCode.stop().catch((err) => {
        console.error("Failed to stop scanning:", err);
      });
    }
  };

  const handleSave = async () => {
    const newScannedQrcodeResponse = { ...scannedQrcodeResponse };
    const newParticipants = [...scannedQrcodeResponse.participants];
    for (let i = 0; i < newParticipants.length; i++) {
      if (presentParticipantIds.includes(newParticipants[i].id)) {
        newParticipants[i].present = true;
      } else {
        newParticipants[i].present = false;
      }
    }

    for (let i = 0; i < newParticipants.length; i++) {
      try {
        await handleMarkPresent(newParticipants[i].id, newParticipants[i].present);
      } catch (error) {
        console.log("error in marking attedance:", error);
        return;
      }
    }

    newScannedQrcodeResponse.participants = newParticipants;
    setScannedQrcodeResponse(newScannedQrcodeResponse);
    alert("Attendance Saved Successfully!");
  };

  return (
    <Container fluid className="p-0">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ backgroundColor: "#4cc08a" }}
        className="text-white d-flex justify-content-center align-items-center mb-3"
      >
        <p className="m-0 py-2 d-flex align-items-center" style={{ fontSize: "18px", fontWeight: "bold" }}>
          <FaClipboardList className="me-2" style={{ fontSize: "23px" }} />
          Participants Attendance Desk
        </p>
      </motion.div>
      {showScanner && <h1 className="title text-center fs-2">Event Attendance</h1>}

      {showScanner && (
        <div className="d-flex flex-column justify-content-center ">
          <div className="d-flex justify-content-center">
            <Button variant="primary" onClick={startScanning}>
              Start Scanning QR Code
            </Button>
          </div>
          {showScanner && <div id="reader" ref={qrcodeReaderRef} style={{ width: "100%", maxWidth: "400px", margin: "20px auto" }}></div>}

          {error && (
            <Alert variant="danger" className="mt-4">
              {error}
            </Alert>
          )}
        </div>
      )}

      {scannedQrcodeResponse && (
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h1 className="title">Event Attendance</h1>
            {<p>Team Number: {scannedQrcodeResponse?.participants[0]?.teamNumber}</p>}
          </div>
          <Button
            variant="info"
            onClick={() => {
              setScannedQrcodeResponse(undefined);
              setShowScanner(true);
              setQrData(undefined);
            }}
          >
            Reset
          </Button>
        </div>
      )}

      {scannedQrcodeResponse && (
        <>
          <h3>
            {scannedQrcodeResponse?.availableEvent?.title} | {round?.roundType}
          </h3>
          <Row>
            {/* <Col md={3}>
            <Card className="border-0 shadow-sm py-3" style={{ background: "linear-gradient(135deg,#007bff,#004080)" }}>
              <Card.Img
                variant="top"
                src={`/${scannedQrcodeResponse?.availableEvent?.slug}.jpg`}
                alt={scannedQrcodeResponse?.availableEvent?.title}
                className="img-fluid rounded-lg" // Added rounded corners and made image responsive
                style={{ height: "200px", objectFit: "contain" }} // Ensures the image looks good within a fixed height
              />
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h1">{scannedQrcodeResponse?.availableEvent?.title}</Card.Title>
                <Card.Subtitle className="my-3 text-muted" style={{ fontStyle: "italic" }}>
                  {scannedQrcodeResponse?.availableEvent?.oneLiner}
                </Card.Subtitle>
                <Card.Text>{scannedQrcodeResponse?.availableEvent?.description}</Card.Text>
                <hr />
                <div>
                  <h5>Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTicketAlt className="me-2" />
                      <strong>Type:</strong> {scannedQrcodeResponse?.availableEvent?.type}
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                <hr />
                <div>
                  <h5>Event Rules</h5>
                  <ListGroup>
                    {scannedQrcodeResponse?.availableEvent?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate?.name?.toLowerCase().includes("otse")) {
                        return null;
                      }
                      if (rule.eventRuleTemplate?.name?.toLowerCase() != "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <strong>{rule.eventRuleTemplate.name}:</strong> {rule.type !== "OTSE" ? <span>{rule.value}</span> : <span>{rule.type === "OTSE" ? "Allowed" : "Not Allowed"}</span>}
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup>
                </div>
                <div>
                  <h5 className="my-4">NOTE:</h5>
                  <ListGroup>
                    {scannedQrcodeResponse?.availableEvent?.eventRules.map((rule, index) => {
                      if (rule.eventRuleTemplate.name.toLowerCase() === "note") {
                        return (
                          <ListGroup.Item key={index}>
                            <span dangerouslySetInnerHTML={{ __html: rule.value }} />
                          </ListGroup.Item>
                        );
                      }
                    })}
                  </ListGroup>
                </div>

                <hr />
                <div>
                  <h5>Event Rounds</h5>
                  {scannedQrcodeResponse?.availableEvent?.rounds.map((round, index) => (
                    <Card key={index} className="mb-3 shadow-sm" style={{ backgroundColor: round.id == scannedQrcodeResponse?.roundId ? "aliceblue" : "" }}>
                      <Card.Body>
                        <h6>
                          Round {index + 1}: {round.roundType == "SEMI_FINAL" ? "PRELIMS" : round.roundType}
                        </h6>
                        <Badge pill bg="info" className="me-2">
                          {round.roundType}
                        </Badge>
                        <ListGroup variant="flush" className="mt-3" style={{ backgroundColor: round.id == scannedQrcodeResponse?.roundId ? "aliceblue" : "" }}>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <div>
                              <FaMapMarkerAlt className="me-2" />
                              <strong>{round?.venue}</strong>
                            </div>
                            <div>
                              <p>
                                <FaRegClock className="me-2" />
                                {formatDateTime(round?.startTime)}
                              </p>
                              <p>
                                <FaRegClock className="me-2" />
                                {formatDateTime(round?.endTime)}
                              </p>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col> */}

            <Col className="container">
              <Button variant="success" onClick={handleSave}>
                Save
              </Button>
              <Table bordered hover responsive className="table-striped">
                <thead>
                  <tr>
                    <th className="d-flex align-items-center gap-2 justify-content-center">
                      <input type="checkbox" onChange={handleSelectAll} />
                      <p className="m-0">Select</p>
                    </th>
                    <th>Sr No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedQrcodeResponse?.participants.length > 0 &&
                    scannedQrcodeResponse?.participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              let newPresentParticipantIds = [...presentParticipantIds];
                              if (e.target.checked) {
                                if (!newPresentParticipantIds.includes(participant.id)) {
                                  newPresentParticipantIds.push(participant.id);
                                }
                              } else {
                                newPresentParticipantIds = newPresentParticipantIds.filter((pid) => pid != participant.id);
                              }

                              setPresentParticipantIds(newPresentParticipantIds);
                            }}
                            checked={presentParticipantIds.includes(participant?.id)}
                          />
                        </td>
                        <td>{index + 1}.</td>
                        <td>{participant.name}</td>
                        <td>{participant.email}</td>
                        <td style={{ minWidth: "147px" }}>{participant.whatsappNumber}</td>
                        <td>
                          <Badge bg={participant.type != "PERFORMER" ? "warning" : "info"}>{participant.type}</Badge>
                        </td>
                        <td>
                          <Badge bg={participant.entryType == "NORMAL" ? "light text-dark border border-secondary" : "secondary"}>{participant.entryType}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default EventAttendancePage;
