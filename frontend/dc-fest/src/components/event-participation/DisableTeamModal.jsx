/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { disableParticipation } from "../../services/participants-api";

const DisableTeamModal = ({ showDisableTeamModal, handleModalClose, participants, setParticipants, filteredParticipants, setFilteredParticipants }) => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (participants) {
      const tmpTeams = [];
      for (let i = 0; i < participants.length; i++) {
        if (!tmpTeams.includes(participants[i].group)) {
          tmpTeams.push({
            group: participants[i].group,
            status: participants[i].disableParticipation == true ? true : false,
          });
        }
      }
      setTeams(tmpTeams);
    }
  }, [participants]);

  const handleDisableParticipation = async () => {
    for (let i = 0; i < teams.length; i++) {
      try {
        const response = await disableParticipation(teams[i].group, teams[i].status);
        console.log("response, disable", response);
        setFilteredParticipants((prev) => {
          return prev.map((participant) => {
            if (participant.group === teams[i].group) {
              return { ...participant, disableParticipation: teams[i].status };
            }
            return participant;
          });
        });
        setParticipants((prev) => {
          return prev.map((participant) => {
            if (participant.group === teams[i].group && filteredParticipants.some(ele => ele.id == participant.id)) {
              return { ...participant, disableParticipation: teams[i].status };
            }
            return participant;
          });
        });
      } catch (error) {
        console.log(error);
        alert("Error removing participation");
      }
    }
handleModalClose();
  };

  const handleTeamChange = (e, index) => {
    const newTeams = [...teams];
    newTeams[index].status = e.target.checked;
    setTeams(newTeams);
  };

  return (
    <Modal show={showDisableTeamModal} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Remove Team</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "400px", overflow: "auto" }}>
        <div className="w-100">
          {teams.map((team, index) => (
            <Form.Group key={index} className="d-flex card px-2">
              <Form.Check type="checkbox" id={`custom-switch-${index}`} onChange={(e) => handleTeamChange(e, index)} label={team.group} checked={team.status} />
            </Form.Group>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDisableParticipation}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableTeamModal;
