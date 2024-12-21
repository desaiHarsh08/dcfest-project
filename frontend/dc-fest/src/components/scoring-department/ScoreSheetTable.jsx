/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap"
import TeamCard from "./TeamCard"

function ScoreSheetTable({ parameters, onParameterChange, teams, onCalculateTotalScore, onTeamChange }) {
  return (
    <div>
        <table className="custom-table">
        <thead>
          <tr>
            <th>Slot No.</th>
            <th>Team No.</th>
            {parameters?.map((param, index) => (
              <th key={`param-${index}`}>
                <p>Parameter {index + 1}</p>
                <div>
                  <input type="text" value={param} onChange={(e) => onParameterChange(e, index)} style={{ background: "transparent" }} />
                </div>
              </th>
            ))}
            <th>Total Score</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <TeamCard key={`team-${index}`} index={index} team={team} calculateTotalScore={onCalculateTotalScore} handleInputChange={onTeamChange} />
          ))}
        </tbody>
      </table>
      <div>
        <Button type="button">Save</Button>
      </div>
    </div>
  )
}

export default ScoreSheetTable