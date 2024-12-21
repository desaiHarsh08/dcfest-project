/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { Button, Table } from "react-bootstrap";
import { handlePromoteTeam } from "../../services/scorecard-apis";

const ScoreEntryTable = ({selectedAvailableEvent, selectedRound, selectedCategory, teams, setTeams }) => {
    console.log("selectedRound:", selectedRound);

    const getPromotedRoundId = (roundType) => {
        switch (roundType) {
            case "Preliminary": { // Find the SEMI_FINAL round from selectedAvailableEvent.rounds and return its id
                const promotedRoundPreliminary = selectedAvailableEvent.rounds.find(r => r.roundType === "SEMI_FINAL");
                console.log(promotedRoundPreliminary);
                return promotedRoundPreliminary ? promotedRoundPreliminary.id : null; 
            }
            
            case "SEMI_FINAL": { // Add logic for SEMI_FINAL promotion if needed
                const promotedRoundSemiFinal = selectedAvailableEvent.rounds.find(r => r.roundType === "FINAL");
                console.log(promotedRoundSemiFinal);
                return promotedRoundSemiFinal ? promotedRoundSemiFinal.id : null;
            }
            default:
                return null;
        }
    }

    const handleTeamRankChange = (e, teamIndex) => {
        console.log(teamIndex);
        let updatedTeams = [...teams];
        updatedTeams = updatedTeams.map((team, index) => {
            if (index == teamIndex) {
                team.rank = e.target.value;
            }
            return team;
        });
        
        console.log("after change:")

        setTeams(updatedTeams);
    }

    const handleTeamPromoted = (e, teamIndex) => {
        console.log(teamIndex);
        let updatedTeams = [...teams];
        updatedTeams = updatedTeams.map((team, index) => {
            if (index == teamIndex) {
                if (e.target.checked) {
                    team.promotedRoundId = getPromotedRoundId(selectedRound?.roundType);                }
                else {
                    team.promotedRoundId = null;
                }
            }
            return team;
        });
        
        console.log("after change:")

        setTeams(updatedTeams);
    }

    const handleSave = async () => {
        for (let i = 0; i < teams.length; i++) {
            try {
                const response = await handlePromoteTeam(teams[i]);
                console.log(response);
            } catch (error) {
                console.log("Error in promoting team");        
            }
        }
        alert("Data saved successfully!");
    }

  return (
    <div className="pb-5">
      <Table responsive bordered>
        <thead>
          <tr>
            <th>Sr. No</th>
            <th>Team Number</th>
            <th>Rank</th>
            <th>Qualified For</th>
          </tr>
        </thead>
        <tbody>
          {teams?.map((team, teamIndex) => (
            <tr key={teamIndex}>
              <td>{teamIndex + 1}</td>
              <td>{team?.teamNumber}</td>
              <td>
                <input type="number" value={team?.rank} onChange={(e) => handleTeamRankChange(e, teamIndex)} /> 
              </td>
              <td className="d-flex align-items-center h-100 pt-3">
                <input type="checkbox" value={!!team?.promotedRoundId}  onChange={(e) =>handleTeamPromoted(e, teamIndex)} />
                <p className="m-0">{selectedAvailableEvent?.rounds?.find(r=> r.id == team?.promotedRoundId)?.roundType}</p>
                </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button type="button" onClick={handleSave}>Save</Button>
    </div>
  );
};

export default ScoreEntryTable;
