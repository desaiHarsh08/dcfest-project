/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { fetchCollegeById } from "../../services/college-apis";

import { generateQrcode, getPop } from "../../services/attendance-apis";
import {
  FaCheck,
  FaDownload,
  FaEdit,
  FaRemoveFormat,
  FaTrash,
} from "react-icons/fa";
import { fetchParticipationByCollegeIdAndAvailableEventId } from "../../services/college-participation-apis";

// eslint-disable-next-line react/prop-types
const ParticipantRow = ({
  tmpParticipants,
  pop,
  setPop,
  refetchPop,
  collegeParticipation,
  handleDisableParticipation,
  handleAttendance,
  participant,
  filteredParticipants,
  index,
  group,
  category,
  availableEvent,
  selectedRound,
  handleRemove,
  handleEdit,
}) => {
  const [college, setCollege] = useState();
  //   const [pop, setPop] = useState();

  const [confirmParticipation, setConfirmParticipation] = useState(false);

  console.log("participant:", participant);

  //   useEffect(() => {
  //     setPop(null);
  //   }, []);

  //   useEffect(() => {
  //     if (college && availableEvent && participant) {
  //       fetchPop(college, availableEvent, participant.group);
  //     }
  //   }, [college, availableEvent, refetchPop, participant]);

  //   useEffect(() => {
  //     if (confirmParticipation) {
  //       fetchPop(college, availableEvent, participant.group);
  //     }
  //   }, [confirmParticipation, filteredParticipants, refetchPop]);

  //   useEffect(() => {
  //     fetchCollegeById(participant?.collegeId)
  //       .then((data) => {
  //         setCollege(data);
  //       })
  //       .catch((err) => console.log(err));
  //   }, [participant?.collegeId]);

  //   useEffect(() => {
  //     if (college && participant && availableEvent) {
  //       fetchPop(college, availableEvent, participant.group);
  //     }
  //   }, [college, participant, refetchPop, selectedRound, availableEvent]);

//   useEffect(() => {
//     if (!college || !availableEvent || !participant || !selectedRound) return;

//     fetchPop(college, availableEvent, participant.group);
//   }, [
//     college?.id,
//     availableEvent?.id,
//     participant?.group,
//     selectedRound?.id,
//     refetchPop,
//   ]);

// In ParticipantRow
useEffect(() => {
    if (!college || !availableEvent || !participant || !selectedRound || index !== 0) return; // Only first row fetches
  
    // Optional: Skip if already loaded
    if (pop[participant.group]) return;
  
    fetchPop(college, availableEvent, participant.group);
  }, [college?.id, availableEvent?.id, participant?.group, selectedRound?.id, refetchPop, index, pop]); // Add pop and index to deps

  //   const fetchPop = async (college, availableEvent, group) => {
  //     if (!college || !availableEvent || !participant) {
  //       return;
  //     }
  //     setPop(null);
  //     // setPopP(null);
  //     try {
  //       const response = await getPop(
  //         college.id,
  //         availableEvent.id,
  //         selectedRound?.id,
  //         group
  //       );
  //       setPop(response);
  //       //   setPopP(response);
  //       return response;
  //     } catch (error) {
  //       console.log(error);
  //       setPop(null);
  //       //   setPopP(null);
  //       return null;
  //     }
  //   };

  // In ParticipantRow
  const fetchPop = async (college, availableEvent, group) => {
    if (!college || !availableEvent || !participant) {
      return;
    }
    // Only clear this group's entry, not all (or skip if you want to preserve)
    setPop((prev) => ({ ...prev, [group]: null })); // Clear only this group

    try {
      const response = await getPop(
        college.id,
        availableEvent.id,
        selectedRound?.id,
        group
      );
      setPop((prev) => ({ ...prev, [group]: response })); // Merge: key by group
      return response;
    } catch (error) {
      console.log(error);
      setPop((prev) => ({ ...prev, [group]: null })); // Clear on error
      return null;
    }
  };
//   const handlePdfOpen = () => {
//     if (!pop) {
//       return;
//     }
//     console.log(pop);
//     // Assuming `response` is the byte array (PDF content)
//     const pdfBlob = new Blob([pop], { type: "application/pdf" });

//     // Create a URL for the Blob
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     // Open the PDF in a new tab
//     window.open(pdfUrl, "_blank");
//   };

  //   const handleConfirmParticipants = async (group) => {
  //     if (!college || !availableEvent) {
  //       return;
  //     }
  //     try {
  //       setConfirmParticipation(true);
  //       const response = await generateQrcode(
  //         college.id,
  //         availableEvent.id,
  //         selectedRound.id,
  //         group
  //       );
  //       console.log(response);
  //       setPop(response);
  //       //   setPopP(response);
  //     } catch (error) {
  //       console.log(error);
  //       setPop(null);
  //       //   setPopP(null);
  //     } finally {
  //       setConfirmParticipation(false);
  //     }
  //   };

  // In ParticipantRow
  
  
  
  // In ParticipantRow
const handlePdfOpen = () => {
    const groupPop = pop[participant.group]; // Group-specific
    if (!groupPop) {
      return;
    }
    console.log(groupPop);
    const pdfBlob = new Blob([groupPop], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };
  
  const handleConfirmParticipants = async (group) => {
    if (!participant.collegeId || !availableEvent) {
        console.log(college, availableEvent, participant);
      return;
    }
    try {
      setConfirmParticipation(true);
      const response = await generateQrcode(
        participant.collegeId,
        availableEvent.id,
        selectedRound.id,
        group
      );
      console.log(response);
      setPop((prev) => ({ ...prev, [group]: response })); // Key by group
    } catch (error) {
      console.log(error);
      setPop((prev) => ({ ...prev, [group]: null }));
    } finally {
      setConfirmParticipation(false);
    }
  };
  return (
    <>
      <tr key={participant?.id}>
        <td>
          <input
            type="checkbox"
            checked={participant.present}
            onChange={(e) => handleAttendance(e, participant)}
          />
        </td>
        <td>{index + 1}</td>
        <td>{college?.icCode}</td>
        <td>{category?.name}</td>
        <td>{availableEvent?.title}</td>
        <td>{participant?.group}</td>
        <td>{participant?.name}</td>
        <td>{participant?.email}</td>
        <td>
          <Badge
            variant={participant?.type == "PERFORMER" ? "primary" : "warning"}
          >
            {participant?.type}
          </Badge>
        </td>
        <td>
          <Badge
            bg={
              participant.entryType == "NORMAL"
                ? "light text-dark border border-secondary"
                : "secondary"
            }
          >
            {participant?.entryType}
          </Badge>
        </td>
        <td>{participant?.handPreference}</td>
        <td className="d-flex">
          {participant?.id && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemove(participant.id)}
            >
              <FaTrash /> Remove
            </Button>
          )}
          <Button
            variant="info"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(participant, college)}
          >
            <FaEdit /> Edit
          </Button>
          {/* {JSON.stringify(participant)} */}
          {index == 0 && (
            <>
              {/* <Button
                variant={pop ? "ghost border border-2" : "warning"}
                onClick={() => {
                  console.log(pop);
                  //   console.log(popP);
                  if (pop) {
                    handlePdfOpen();
                  } else {
                    handleConfirmParticipants(participant?.group);
                  }
                }}
                
              >
                {pop ? <FaDownload /> : <FaCheck />}{" "}
                {fetchPop(college, availableEvent, participant.group) ? "Download" : "Confirm"}
              </Button>
               */}

              <Button
                variant={
                  pop[participant.group] ? "ghost border border-2" : "warning"
                }
                onClick={() => {
                  console.log("pop[participant.group]:", pop[participant.group]); // Log group-specific
                  console.log("participant.group:", participant.group); // Log group-specific
                  if (pop[participant.group]) {
                    handlePdfOpen(); // This needs group-specific too (see below)
                  } else {
                    handleConfirmParticipants(participant.group); // This fetches and sets
                  }
                }}
                // disabled={confirmParticipation || !!participant?.disableParticipation}
              >
                {pop[participant.group] ? <FaDownload /> : <FaCheck />}{" "}
                {pop[participant.group] ? "Download" : "Confirm"}
              </Button>
              <Button
                variant={"outline"}
                className="border"
                onClick={async () => {
                  console.log(
                    "Sending disableParticipation status:",
                    !!participant?.disableParticipation == false ? true : false,
                    participant
                  );
                  await handleDisableParticipation(
                    participant?.group,
                    !!participant?.disableParticipation == false ? true : false,
                    tmpParticipants
                  );
                }}
              >
                {participant?.disableParticipation === false ||
                participant?.disableParticipation === null
                  ? "Active"
                  : "Inactive"}
              </Button>
            </>
          )}
        </td>
      </tr>
    </>
  );
};

export default ParticipantRow;
