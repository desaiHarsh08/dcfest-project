/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { fetchCollegeById } from "../../services/college-apis";

// eslint-disable-next-line react/prop-types
const ParticipantRow = ({ participant, index, category, availableEvent, handleRemove, handleEdit }) => {
  const [college, setCollege] = useState();
  console.log(category);
  useEffect(() => {
    fetchCollegeById(participant?.collegeId)
      .then((data) => {
        console.log(data);
        setCollege(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <tr key={participant.id}>
      <td>{index + 1}</td>
      <td>{participant?.name}</td>
      <td>{college?.icCode}</td>
      <td>{participant?.email}</td>
      <td>{category?.name}</td>
      <td>{availableEvent?.title}</td>
      <td className="d-flex">
        <Button variant="info" disabled size="sm" className="me-2" onClick={() => handleEdit(participant)}>
          Edit
        </Button>
        <Button variant="danger" disabled size="sm" onClick={() => handleRemove(participant.id)}>
          Remove
        </Button>
      </td>
    </tr>
  );
};

export default ParticipantRow;
