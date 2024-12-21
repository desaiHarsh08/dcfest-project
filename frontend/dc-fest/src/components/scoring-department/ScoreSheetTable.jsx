/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap"
import TeamCard from "./TeamCard"
import { FaSave } from "react-icons/fa"
import { updateTeam } from "../../services/scorecard-apis";
import { useEffect } from "react";

function ScoreSheetTable({ teams,  setTeams }) {

    const handleTeamChange = (e, teamIndex) => {
        const {name, value} = e.target;
        let updatedTeams = [...teams];
        updatedTeams = updatedTeams.map((team, idx) => {
            if (idx == teamIndex) {
                return {...team, [name]: Number(value) }
            }
            return team;
        });

        setTeams(updatedTeams);
    }

    const handleSave = async() => { 
        let updatedTeams = [...teams];

        if (teams?.some(team => team.slot == null)) {
            alert("Please provide the slot for all the teams!");
            return;
        }

        for(let i = 0; i < updatedTeams.length; i++) {
            let team = updatedTeams[i];
            if (team?.slot == null) {
                alert(`Please provide a valid slot for ${team?.teamNumber}`);
                return;
            }
        
            if (team?.slot < 1 || team?.slot > updatedTeams.length) {
                alert(`Please provide a valid slot for ${team?.teamNumber}`);
                return;
            }

            if (teams.filter(t => t.slot == team.slot).length > 1) {
                alert("No two teams can have same slot no.!");
                return;
            }
        
            try {
                const response = await updateTeam(team);
                console.log("saved team:", response);
                updatedTeams = updatedTeams.map((team) => { 
                    if (team.id == response.id) {
                        return response;
                    }
                    return team;
                 });
            } catch (error) {
                console.log(error)
            }
        }

        // Sort the teams by their slots
        updatedTeams.sort((a, b) => a.slot - b.slot);

        setTeams(updatedTeams);

        alert("Slots Saved Successfully!");
     }
   
  return (
    <div className="pb-5">
        <table className="custom-table">
        <thead>
          <tr>
            <th>Slot No.</th>
            <th>Team No.</th>
            <th>Total Score</th>
            <th>Rank</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <TeamCard 
                key={`team-${index}`} 
                index={index} 
                team={team} 
                onTeamChange={handleTeamChange} 
                teams={teams}
                setTeams={setTeams} 
            />
          ))}
        </tbody>
      </table>
      <div>
        <Button type="button" disabled={teams?.some(team => team?.teamNumber == null)} onClick={handleSave}>
            <FaSave className="mx-1"/> 
              <span>Save</span>
        </Button>
      </div>
    </div>
  )
}

export default ScoreSheetTable