/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { fetchCollegeById } from "../../services/college-apis";

import { generateQrcode, getPop } from "../../services/attendance-apis";

// eslint-disable-next-line react/prop-types
const ParticipantRow = ({ participant, index, group, category, availableEvent, handleRemove, handleEdit }) => {
  const [college, setCollege] = useState();
  const [pop, setPop] = useState();

  const [confirmParticipation, setConfirmParticipation] = useState(false);

  useEffect(() => {
    if (college && availableEvent && participant) {
      fetchPop(college, availableEvent, participant.group);
    }
  }, [college && availableEvent && participant]);

  useEffect(() => {
    if (confirmParticipation) {
      fetchPop(college, availableEvent, participant.group);
    }
  }, [confirmParticipation]);

  useEffect(() => {
    fetchCollegeById(participant?.collegeId)
      .then((data) => {
        setCollege(data);
      })
      .catch((err) => console.log(err));
  }, [participant?.collegeId]);

  useEffect(() => {
    if (college && participant && availableEvent) {
      fetchPop();
    }
  }, [college, participant, availableEvent]);

  const fetchPop = async (college, availableEvent, group) => {
    if (!college || !availableEvent || !participant) {
      return;
    }

    console.log(college);
    try {
      const response = await getPop(college.id, availableEvent.id, availableEvent?.rounds[0].id, group);
      console.log(response);
      setPop(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePdfOpen = () => {
    if (!pop) {
      return;
    }
    console.log(pop);
    // Assuming `response` is the byte array (PDF content)
    const pdfBlob = new Blob([pop], { type: "application/pdf" });

    // Create a URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    // Open the PDF in a new tab
    window.open(pdfUrl, "_blank");
  };

  const handleConfirmParticipants = async (group) => {
    if (!college || !availableEvent) {
      return;
    }
    try {
      setConfirmParticipation(true);
      const response = await generateQrcode(college.id, availableEvent.id, availableEvent?.rounds[0].id, group);
      console.log(response);
      setPop(response);
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmParticipation(false);
    }
  };

  return (
    <>
      <tr key={participant?.id}>
        <td>{index + 1}</td>
        <td>{college?.icCode}</td>
        <td>{category?.name}</td>
        <td>{availableEvent?.title}</td>
        <td>{participant?.group}</td>
        <td>{participant?.name}</td>
        <td>{participant?.email}</td>
        <td>
          <Badge variant={participant?.type == "PERFORMER" ? "primary" : "warning"}>{participant?.type}</Badge>
        </td>
        <td>
          <Badge bg={participant.entryType == "NORMAL" ? "light text-dark border border-secondary" : "secondary"}>{participant?.entryType}</Badge>
        </td>
        <td>{participant?.handPreference}</td>
        <td className="d-flex">
          {participant?.id && (
            <Button variant="danger" size="sm" onClick={() => handleRemove(participant.id)}>
              Remove
            </Button>
          )}
          <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(participant, college)}>
            Edit
          </Button>
          {index == 0 && (
            <Button
              variant={pop ? "ghost border border-2" : "warning"}
              onClick={() => {
                if (pop) {
                  handlePdfOpen();
                } else {
                  handleConfirmParticipants(participant?.group);
                }
              }}
              disabled={confirmParticipation}
            >
              {pop ? "Download" : "Confirm"}
            </Button>
          )}
        </td>
      </tr>
    </>
  );
};

export default ParticipantRow;
