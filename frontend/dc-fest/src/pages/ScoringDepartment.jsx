/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// import { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/ScoringDepartment.css";
// import { BsBuilding, BsCalendar, BsGeoAlt, BsPencilSquare, BsPerson, BsArrowLeft } from "react-icons/bs";
// import { getCollegeParticipationForScoreCard, getScoreCardSheet } from "../services/scorecard-apis";
// import TeamCard from "../components/scoring-department/TeamCard";
// import ScoreDetails from "../components/scoring-department/ScoreDetails";
// import { fetchCategories } from "../services/categories-api";
// import { Button, Form } from "react-bootstrap";
// import FilterEvents from "../components/scoring-department/FilterEvents";
// import ScoreSheetTable from "../components/scoring-department/ScoreSheetTable";
// import ScoreEntryTable from "../components/scoring-department/ScoreEntryTable";
// import { FaClipboardList, FaDownload } from "react-icons/fa";
// import { AuthContext } from "../providers/AuthProvider";

// const ScoringDepartment = () => {
//   const navigate = useNavigate();

//   const [teams, setTeams] = useState([]);
//   const [scoreSheetFile, setScoreSheetFile] = useState();
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedAvailableEvent, setAvailableEvent] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [eventFilter, setEventFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [selectedRound, setSelectedRound] = useState([]);
//   const [parameters, setParameters] = useState(["", "", "", ""]);
//   const [scoreEntryFlag, setScoreEntryFlag] = useState(false);

//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     if (user?.type == "REGISTRATION_DESK") {
//       navigate("/home/event-desk/registration", { replace: true });
//     }
//   }, [user]);

//   useEffect(() => {
//     if (selectedAvailableEvent && selectedRound) {
//       getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedRound.id)
//         .then((data) => {
//           console.log("fetching data for first round:", data);
//           data.sort((a, b) => a.slot - b.slot);
//           setTeams(data);
//         })
//         .catch((err) => console.log(err));
//       //   for (let i = 0; i < selectedAvailableEvent.rounds.length; i++) {
//       //     if (selectedAvailableEvent.rounds[i].id == selectedRound.id) {
//       //       if (i > 0) {
//       //         getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedAvailableEvent.rounds[0].id)
//       //           .then((data) => {
//       //             console.log("fetching data for first round:", data);
//       //             data.sort((a, b) => a.slot - b.slot);
//       //             setTeams(data);
//       //           })
//       //           .catch((err) => console.log(err));
//       //       } else {
//       //         getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedAvailableEvent.rounds[0].id)
//       //           .then((data) => {
//       //             console.log(data);
//       //             data.sort((a, b) => a.slot - b.slot);
//       //             setTeams(data);
//       //           })
//       //           .catch((err) => console.log(err));
//       //       }
//       //       break;
//       //     }
//       //   }
//     }
//   }, [selectedAvailableEvent, selectedRound]);

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         setLoading(true);
//         const categoriesData = await fetchCategories();
//         console.log("categoriesData:", categoriesData);
//         setCategories(categoriesData);

//         if (categoriesData.length > 0) {
//           //   const firstCategory = categoriesData.find((c) => c.name == "TEST_CATEGORY");
//           const firstCategory = categoriesData[0];
//           setCategoryFilter(firstCategory.id);
//           setSelectedCategory(firstCategory);

//           if (firstCategory.availableEvents?.length > 0) {
//             const firstEvent = firstCategory.availableEvents[0];
//             setEventFilter(firstEvent.id);
//             setAvailableEvent(firstEvent);
//             setSelectedRound(firstEvent.rounds[0]);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         setError("Failed to load categories.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInitialData();
//   }, []);

//   const fetchScoreSheet = async (availableEventId, roundId) => {
//     try {
//       const response = await getScoreCardSheet(availableEventId, roundId);
//       console.log("scoresheet:", response);
//       setScoreSheetFile(scoreSheetFile);
//       handlePdfOpen(response);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handlePdfOpen = (content) => {
//     if (!content) {
//       return;
//     }
//     console.log(content);
//     // Assuming `response` is the byte array (PDF content)
//     const pdfBlob = new Blob([content], { type: "application/pdf" });

//     // Create a URL for the Blob
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     // Open the PDF in a new tab
//     window.open(`${pdfUrl}`, "_blank");
//   };

//   // Calculate total score for a row
//   const calculateTotalScore = (team) => {
//     let p1 = 0,
//       p2 = 0,
//       p3 = 0,
//       p4 = 0;

//     console.log(team);
//     if (!p1 || p1 != "" || !p1.toUpperCase("D")) {
//       p1 = Number(team.scoreParameters[0]?.points);
//       if (isNaN(p1)) {
//         p1 = 0;
//       }
//     }
//     if (!p2 || p2 != "" || !p2.toUpperCase("D")) {
//       p2 = Number(team.scoreParameters[1]?.points);
//       if (isNaN(p2)) {
//         p2 = 0;
//       }
//     }
//     if (!p3 || p3 != "" || !p3.toUpperCase("D")) {
//       p3 = Number(team.scoreParameters[2]?.points);
//       if (isNaN(p3)) {
//         p3 = 0;
//       }
//     }
//     if (!p4 || p4 != "" || !p4.toUpperCase("D")) {
//       p4 = Number(team.scoreParameters[3]?.points);
//       if (isNaN(p4)) {
//         p4 = 0;
//       }
//     }

//     console.log("in cal., ", p1, p2, p3, p4);

//     const total = p1 + p2 + p3 + p4;
//     return Math.min(total, 100); // Ensure total score does not exceed 100
//   };

//   const handleParameterChange = (e, index) => {
//     let newParameters = [...parameters];
//     newParameters = newParameters.map((param, idx) => {
//       if (idx == index) {
//         return e.target.value;
//       }
//       return param;
//     });
//     setParameters(newParameters);
//   };

//   const handleTeamChange = (e, index, scoreParameterIndex) => {
//     const { name, value } = e.target;
//     let newTeams = [...teams];
//     console.log(newTeams);
//     newTeams = newTeams.map((team, idx) => {
//       if (index == idx) {
//         const newTeam = { ...team };
//         newTeam.scoreParameters = newTeam.scoreParameters.map((scoreParameter, scoreParameterIdx) => {
//           if (scoreParameterIndex == scoreParameterIdx) {
//             return { ...scoreParameter, [name]: value };
//           }
//           return scoreParameter;
//         });
//         return newTeam;
//       }
//       return team;
//     });

//     setTeams(newTeams);
//   };

//   return (
//     <div className="scoring-department">
//       <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
//         <BsArrowLeft /> Back
//       </button>
//       <h1 className="text-center">
//         <BsPencilSquare /> Scoring Department
//       </h1>
//       <p className="text-muted text-center">Enter the scores below to record and evaluate performance accurately for the scoring department.</p>

//       <div className="d-flex justify-content-between">
//         <FilterEvents
//           selectedCategory={selectedCategory}
//           eventFilter={eventFilter}
//           setAvailableEvent={setAvailableEvent}
//           setSelectedRound={setSelectedRound}
//           selectedAvailableEvent={selectedAvailableEvent}
//           selectedRound={selectedRound}
//           setEventFilter={setEventFilter}
//           categories={categories}
//           categoryFilter={categoryFilter}
//           setCategoryFilter={setCategoryFilter}
//           setSelectedCategory={setSelectedCategory}
//         />
//         {selectedAvailableEvent && selectedRound && (
//           <div>
//             {teams.length > 0 && !teams?.some((team) => team.slot == null) && (
//               <Button variant="success" onClick={() => fetchScoreSheet(selectedAvailableEvent?.id, selectedRound?.id)}>
//                 <FaDownload /> Download
//               </Button>
//             )}
//             <Button variant={scoreEntryFlag ? "info" : "light"} className={`${!scoreEntryFlag && "border"}`} onClick={() => setScoreEntryFlag((prev) => !prev)}>
//               <FaClipboardList /> Score Entry
//             </Button>
//           </div>
//         )}
//       </div>

//       <ScoreDetails selectedCategory={selectedCategory} selectedAvailableEvent={selectedAvailableEvent} selectedRound={selectedRound} />
//       {scoreEntryFlag ? (
//         <ScoreEntryTable selectedAvailableEvent={selectedAvailableEvent} selectedRound={selectedRound} selectedCategory={selectedCategory} teams={teams} setTeams={setTeams} />
//       ) : (
//         <ScoreSheetTable teams={teams} setTeams={setTeams} />
//       )}
//     </div>
//   );
// };

// export default ScoringDepartment;

import React, { useContext, useEffect } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

const ScoringDepartment = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.type == "REGISTRATION_DESK" || user?.type == "ATTENDANCE_DESK") {
      navigate(-1);
    }
  }, [user, navigate]);

  return (
    <div>
      <div className="container mt-5">
        <Row className="align-items-center mb-4">
          <Col xs={12} md={3} className="d-flex justify-content-start">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Col>
          <Col xs={12} md={6} className="text-center">
            <h1 className="section-heading">Scoring Department</h1>
          </Col>
        </Row>
        <Row className="justify-content-center">
          {/* Card for Event Registration */}
          {(user?.type == "ADMIN" || user?.type == "SCORE_SHEET_DESK") && (
            <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
              <Card className="event-card shadow animate-card h-100 w-100">
                <Card.Img
                  variant="top"
                  src="https://static.vecteezy.com/system/resources/previews/023/894/855/large_2x/score-sheet-icon-in-flat-design-vector.jpg"
                  alt="Event Registration"
                  className="img-fluid"
                  style={{ height: "200px", objectFit: "cover" }} // Maintain aspect ratio
                />
                <Card.Body className="d-flex justify-content-center align-items-center text-decoration-none flex-column">
                  <Card.Title className="card-title">Score Sheet</Card.Title>
                  <Card.Text className="card-text">Score-sheet.</Card.Text>
                  <Link to="score-sheet" className="d-flex justify-content-center align-items-center text-decoration-none">
                    <Button className="btn-custom" variant="primary" block>
                      View Scoresheet
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Card for Attendance */}
          {(user?.type == "ADMIN" || user?.type == "SCORE_ENTRY_DESK") && (
            <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
              <Card className="event-card shadow animate-card h-100 w-100">
                <Card.Img
                  variant="top"
                  src="https://static.vecteezy.com/system/resources/previews/025/216/404/large_2x/score-icon-design-free-vector.jpg"
                  alt="Attendance"
                  className="img-fluid"
                  style={{ height: "200px", objectFit: "cover" }} // Maintain aspect ratio
                />
                <Card.Body className="d-flex justify-content-center align-items-center text-decoration-none flex-column">
                  <Card.Title className="card-title text-center">Score Entry</Card.Title>
                  <Card.Text className="card-text text-center">Score Entry.</Card.Text>
                  <Link to="score-entry" className="d-flex justify-content-center align-items-center text-decoration-none">
                    <Button className="btn-custom" variant="primary" block>
                      View Score Entry
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Card for Participation */}
        </Row>
      </div>
    </div>
  );
};

export default ScoringDepartment;
