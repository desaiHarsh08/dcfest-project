/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { getCollegeParticipationForScoreCard, getScoreCardSheet } from '../services/scorecard-apis';
import { fetchCategories } from '../services/categories-api';
import { BsArrowLeft, BsPencilSquare } from 'react-icons/bs';
import FilterEvents from '../components/scoring-department/FilterEvents';
import { Button } from 'react-bootstrap';
import { FaClipboardList, FaDownload } from 'react-icons/fa';
import ScoreDetails from '../components/scoring-department/ScoreDetails';
import ScoreEntryTable from '../components/scoring-department/ScoreEntryTable';
import ScoreSheetTable from '../components/scoring-department/ScoreSheetTable';

const ScoreEntryPage = () => {
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [scoreSheetFile, setScoreSheetFile] = useState();
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedAvailableEvent, setAvailableEvent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [eventFilter, setEventFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedRound, setSelectedRound] = useState([]);
    const [parameters, setParameters] = useState(["", "", "", ""]);
    const [scoreEntryFlag, setScoreEntryFlag] = useState(false);
  
    const { user } = useContext(AuthContext);
  
    useEffect(() => {
      if (user?.type == "REGISTRATION_DESK") {
        navigate("/home/event-desk/registration", { replace: true });
      }
    }, [user]);
  
    useEffect(() => {
      if (selectedAvailableEvent && selectedRound) {
        getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedRound.id)
          .then((data) => {
            console.log("fetching data for first round:", data);
            data.sort((a, b) => a.slot - b.slot);
            setTeams(data);
          })
          .catch((err) => console.log(err));
        //   for (let i = 0; i < selectedAvailableEvent.rounds.length; i++) {
        //     if (selectedAvailableEvent.rounds[i].id == selectedRound.id) {
        //       if (i > 0) {
        //         getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedAvailableEvent.rounds[0].id)
        //           .then((data) => {
        //             console.log("fetching data for first round:", data);
        //             data.sort((a, b) => a.slot - b.slot);
        //             setTeams(data);
        //           })
        //           .catch((err) => console.log(err));
        //       } else {
        //         getCollegeParticipationForScoreCard(selectedAvailableEvent?.id, selectedAvailableEvent.rounds[0].id)
        //           .then((data) => {
        //             console.log(data);
        //             data.sort((a, b) => a.slot - b.slot);
        //             setTeams(data);
        //           })
        //           .catch((err) => console.log(err));
        //       }
        //       break;
        //     }
        //   }
      }
    }, [selectedAvailableEvent, selectedRound]);
  
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const categoriesData = await fetchCategories();
          console.log("categoriesData:", categoriesData);
          setCategories(categoriesData);
  
          if (categoriesData.length > 0) {
            //   const firstCategory = categoriesData.find((c) => c.name == "TEST_CATEGORY");
            const firstCategory = categoriesData[0];
            setCategoryFilter(firstCategory.id);
            setSelectedCategory(firstCategory);
  
            if (firstCategory.availableEvents?.length > 0) {
              const firstEvent = firstCategory.availableEvents[0];
              setEventFilter(firstEvent.id);
              setAvailableEvent(firstEvent);
              setSelectedRound(firstEvent.rounds[0]);
            }
          }
        } catch (err) {
          console.error("Error fetching categories:", err);
          setError("Failed to load categories.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchInitialData();
    }, []);
  
    const fetchScoreSheet = async (availableEventId, roundId) => {
      try {
        const response = await getScoreCardSheet(availableEventId, roundId);
        console.log("scoresheet:", response);
        setScoreSheetFile(scoreSheetFile);
        handlePdfOpen(response);
      } catch (error) {
        console.log(error);
      }
    };
  
    const handlePdfOpen = (content) => {
      if (!content) {
        return;
      }
      console.log(content);
      // Assuming `response` is the byte array (PDF content)
      const pdfBlob = new Blob([content], { type: "application/pdf" });
  
      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      // Open the PDF in a new tab
      window.open(`${pdfUrl}`, "_blank");
    };
  
    // Calculate total score for a row
    const calculateTotalScore = (team) => {
      let p1 = 0,
        p2 = 0,
        p3 = 0,
        p4 = 0;
  
      console.log(team);
      if (!p1 || p1 != "" || !p1.toUpperCase("D")) {
        p1 = Number(team.scoreParameters[0]?.points);
        if (isNaN(p1)) {
          p1 = 0;
        }
      }
      if (!p2 || p2 != "" || !p2.toUpperCase("D")) {
        p2 = Number(team.scoreParameters[1]?.points);
        if (isNaN(p2)) {
          p2 = 0;
        }
      }
      if (!p3 || p3 != "" || !p3.toUpperCase("D")) {
        p3 = Number(team.scoreParameters[2]?.points);
        if (isNaN(p3)) {
          p3 = 0;
        }
      }
      if (!p4 || p4 != "" || !p4.toUpperCase("D")) {
        p4 = Number(team.scoreParameters[3]?.points);
        if (isNaN(p4)) {
          p4 = 0;
        }
      }
  
      console.log("in cal., ", p1, p2, p3, p4);
  
      const total = p1 + p2 + p3 + p4;
      return Math.min(total, 100); // Ensure total score does not exceed 100
    };
  
    const handleParameterChange = (e, index) => {
      let newParameters = [...parameters];
      newParameters = newParameters.map((param, idx) => {
        if (idx == index) {
          return e.target.value;
        }
        return param;
      });
      setParameters(newParameters);
    };
  
    const handleTeamChange = (e, index, scoreParameterIndex) => {
      const { name, value } = e.target;
      let newTeams = [...teams];
      console.log(newTeams);
      newTeams = newTeams.map((team, idx) => {
        if (index == idx) {
          const newTeam = { ...team };
          newTeam.scoreParameters = newTeam.scoreParameters.map((scoreParameter, scoreParameterIdx) => {
            if (scoreParameterIndex == scoreParameterIdx) {
              return { ...scoreParameter, [name]: value };
            }
            return scoreParameter;
          });
          return newTeam;
        }
        return team;
      });
  
      setTeams(newTeams);
    };
  
    return (
      <div className="scoring-department">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-center">
          <BsPencilSquare /> Scoring Department
        </h1>
        <p className="text-muted text-center">Enter the scores below to record and evaluate performance accurately for the scoring department.</p>
  
        <div className="d-flex justify-content-between">
          <FilterEvents
            selectedCategory={selectedCategory}
            eventFilter={eventFilter}
            setAvailableEvent={setAvailableEvent}
            setSelectedRound={setSelectedRound}
            selectedAvailableEvent={selectedAvailableEvent}
            selectedRound={selectedRound}
            setEventFilter={setEventFilter}
            categories={categories}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            setSelectedCategory={setSelectedCategory}
          />
          {selectedAvailableEvent && selectedRound && (
            <div>
              {teams.length > 0 && !teams?.some((team) => team.slot == null) && (
                <Button variant="success" onClick={() => fetchScoreSheet(selectedAvailableEvent?.id, selectedRound?.id)}>
                  <FaDownload /> Download
                </Button>
              )}
              <Button variant={scoreEntryFlag ? "info" : "light"} className={`${!scoreEntryFlag && "border"}`} onClick={() => setScoreEntryFlag((prev) => !prev)}>
                <FaClipboardList /> Score Entry
              </Button>
            </div>
          )}
        </div>
  
        <ScoreDetails selectedCategory={selectedCategory} selectedAvailableEvent={selectedAvailableEvent} selectedRound={selectedRound} />
        {scoreEntryFlag ? (
          <ScoreEntryTable selectedAvailableEvent={selectedAvailableEvent} selectedRound={selectedRound} selectedCategory={selectedCategory} teams={teams} setTeams={setTeams} />
        ) : (
          <ScoreSheetTable teams={teams} setTeams={setTeams} />
        )}
      </div>
    );
}

export default ScoreEntryPage