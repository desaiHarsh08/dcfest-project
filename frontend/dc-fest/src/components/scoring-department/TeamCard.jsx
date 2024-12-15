/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { fetchParticipationById } from "../../services/college-participation-apis";

/* eslint-disable no-unused-vars */
const TeamCard = ({ index, team, handleInputChange, calculateTotalScore }) => {
  console.log("team:", team);
  const [collegeParticipation, setCollegeParticipation] = useState();

  useEffect(() => {
    fetchParticipationById(team?.collegeParticipationId)
      .then((data) => {
        console.log(data);
        setCollegeParticipation(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{team?.teamNumber}</td>
      {team?.scoreParameters.map((scoreParameter, scoreParameterIndex) => (
        <td key={`scoreParameter-${scoreParameterIndex}`}>
          <div className="parameter-input">
            <input
              type="text"
              value={scoreParameter?.points}
              name="points"
              onBlur={() => {
                if (typeof scoreParameter?.points == "number" && (scoreParameter?.points < 0 || scoreParameter?.points > 25)) {
                  alert("Points can either be empyt or D or in range 0-25.");
                }
              }}
              onChange={(e) => handleInputChange(e, index, scoreParameterIndex)}
            />
          </div>
        </td>
      ))}
      <td>
        <p>{calculateTotalScore(team)}/100</p>
      </td>
      <td>
        <p>-</p>
      </td>
    </tr>
  );
};

export default TeamCard;
