// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
// import { fetchCollegeById } from "../../services/college-apis";

// // eslint-disable-next-line react/prop-types
// const ParticipantRow = ({ participant, index, category, availableEvent, handleRemove, handleEdit }) => {
//   const [college, setCollege] = useState();

//   useEffect(() => {
//     fetchCollegeById(participant?.collegeId)
//       .then((data) => {
//         setCollege(data);
//       })
//       .catch((err) => console.log(err));
//   }, [participant?.collegeId]);

//   return (
//     <>
//       <tr key={participant?.id}>
//         <td>{index + 1}</td>
//         <td>{college?.icCode}</td>
//         <td>{category?.name}</td>
//         <td>{availableEvent?.title}</td>
//         <td>{participant?.name}</td>
//         <td>{participant?.email}</td>
//         <td>{participant?.email}</td>
//         <td className="d-flex">
//           <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(participant, college)}>
//             Edit
//           </Button>
//           <Button variant="danger" size="sm" onClick={() => handleRemove(participant.id)}>
//             Remove
//           </Button>
//         </td>
//       </tr>
//     </>
//   );
// };

// export default ParticipantRow;

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { fetchCollegeById } from "../../services/college-apis";

// eslint-disable-next-line react/prop-types
const ParticipantRow = ({ participant, index, category, availableEvent, handleRemove, handleEdit }) => {
  const [college, setCollege] = useState();

  useEffect(() => {
    fetchCollegeById(participant?.collegeId)
      .then((data) => {
        setCollege(data);
      })
      .catch((err) => console.log(err));
  }, [participant?.collegeId]);

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
          <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(participant, college)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleRemove(participant.id)}>
            Remove
          </Button>
        </td>
      </tr>
    </>
  );
};

export default ParticipantRow;
