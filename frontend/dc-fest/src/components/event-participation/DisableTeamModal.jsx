// /* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { Button, Form, Modal } from "react-bootstrap";
// import { disableParticipation } from "../../services/participants-api";
// import { fetchEventByAvailableEventId } from "../../services/event-apis";

// const DisableTeamModal = ({ showDisableTeamModal, selectedAvailableEvent, handleModalClose, participants, setParticipants, filteredParticipants, setFilteredParticipants }) => {
//   const [teams, setTeams] = useState([]);
//   const [event, setEvent] = useState();

//   useEffect(() => {
//     (async () => {
//       if (selectedAvailableEvent) {
//         try {
//           const response = await fetchEventByAvailableEventId(selectedAvailableEvent.id);
//           console.log("event", response);
//           setEvent(response);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     })();
//   }, [selectedAvailableEvent]);

//   useEffect(() => {
//     if (participants && event) {
//       const tmpTeams = [];
//       for (let i = 0; i < participants.length; i++) {
//         if (!tmpTeams.includes(participants[i].group) && participants[i].eventIds.includes(event.id)) {
//           tmpTeams.push({
//             group: participants[i].group,
//             status: participants[i].disableParticipation == true ? true : false,
//           });
//         }
//       }
//       setTeams(tmpTeams);
//     }
//   }, [participants, event]);

//   const handleDisableParticipation = async () => {
//     for (let i = 0; i < teams.length; i++) {
//       try {
//         console.log("teams[i]:", teams[i]);
//         const response = await disableParticipation(teams[i].group, event.id, teams[i].status);
//         console.log("response, disable", response);
//         setFilteredParticipants((prev) => {
//           return prev.map((participant) => {
//             if (participant.group === teams[i].group) {
//               return { ...participant, disableParticipation: teams[i].status };
//             }
//             return participant;
//           });
//         });
//         setParticipants((prev) => {
//           return prev.map((participant) => {
//             if (participant.group === teams[i].group && filteredParticipants.some((ele) => ele.id == participant.id)) {
//               return { ...participant, disableParticipation: teams[i].status };
//             }
//             return participant;
//           });
//         });
//       } catch (error) {
//         console.log(error);
//         alert("Error removing participation");
//         break;
//       }
//     }
//     handleModalClose();
//   };

//   const handleTeamChange = (e, index) => {
//     const newTeams = [...teams];
//     newTeams[index].status = e.target.checked;
//     setTeams(newTeams);
//   };

//   return (
//     <Modal show={showDisableTeamModal} onHide={handleModalClose}>
//       <Modal.Header closeButton>
//         <Modal.Title className="text-white">Remove Team</Modal.Title>
//       </Modal.Header>
//       <Modal.Body style={{ height: "400px", overflow: "auto" }}>
//         <div className="w-100">
//           {teams.map((team, index) => (
//             <Form.Group key={index} className="d-flex card px-2">
//               <Form.Check type="checkbox" id={`custom-switch-${index}`} onChange={(e) => handleTeamChange(e, index)} label={team.group} checked={team.status} />
//             </Form.Group>
//           ))}
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleModalClose}>
//           Close
//         </Button>
//         <Button variant="primary" disabled={event == null} onClick={handleDisableParticipation}>
//           Save Changes
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default DisableTeamModal;

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { disableParticipation } from "../../services/participants-api";
import { fetchEventByAvailableEventId } from "../../services/event-apis";

const DisableTeamModal = ({ showDisableTeamModal, selectedAvailableEvent, handleModalClose, participants, setParticipants, filteredParticipants, setFilteredParticipants }) => {
  const [teams, setTeams] = useState([]);
  const [event, setEvent] = useState();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchEventByAvailableEventId(selectedAvailableEvent.id);
        console.log("event", response);
        setEvent(response);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [selectedAvailableEvent]);

  useEffect(() => {
    if (participants && event) {
      const tmpTeams = [];
      for (let i = 0; i < participants.length; i++) {
        if (!tmpTeams.find((team) => team.group === participants[i].group) && participants[i].eventIds.includes(event.id)) {
          tmpTeams.push({
            group: participants[i].group,
            status: participants[i].disableParticipation === true,
          });
        }
      }
      setTeams(tmpTeams);
    }
  }, [participants, event]);

  const handleDisableParticipation = async () => {
    const updatedTeams = [...teams];

    for (let i = 0; i < teams.length; i++) {
      try {
        console.log("teams[i]:", teams[i]);
        const response = await disableParticipation(teams[i].group, event.id, teams[i].status);
        console.log("response, disable", response);

        // Update the team status in the local `updatedTeams` array
        updatedTeams[i].status = teams[i].status;

        // Update filtered participants
        setFilteredParticipants((prev) => prev.map((participant) => (participant.group === teams[i].group ? { ...participant, disableParticipation: teams[i].status } : participant)));

        // Update all participants
        setParticipants((prev) =>
          prev.map((participant) =>
            participant.group === teams[i].group && filteredParticipants.some((ele) => ele.id === participant.id) ? { ...participant, disableParticipation: teams[i].status } : participant
          )
        );
      } catch (error) {
        console.log(error);
        alert("Error removing participation");
        break;
      }
    }

    // Reassign updated teams to state
    setTeams(updatedTeams);

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
        <Button variant="primary" disabled={event == null} onClick={handleDisableParticipation}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableTeamModal;
