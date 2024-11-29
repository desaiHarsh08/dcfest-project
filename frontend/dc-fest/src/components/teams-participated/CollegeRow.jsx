/* eslint-disable react/prop-types */
// const CollegeRow = ({ college, onDelete, index, loading }) => {
//   return (
//     <tr key={college.id}>
//       <td>{index + 1}.</td>
//       <td>{college.name}</td>
//       <td>{college.icCode}</td>
//       <td>{college.address}</td>
//       <td>{college.phone}</td>
//       <td>{college.email}</td>
//       <td>
//         <button disabled={loading} className="btn btn-sm btn-danger" type="button" title="Delete" onClick={() => onDelete(college)}>
//           {loading ? "Deleting..." : "Delete"}
//         </button>
//       </td>
//     </tr>
//   );
// };

// import { Spinner } from "react-bootstrap";
// import { fetchParticipantsByCollegeId } from "../../services/participants-api";

// // export default CollegeRow;



// const CollegeRow = ({ college, onDelete, index, loading, onDownload }) => {



//   return (college &&
//     <tr>
//       <td>{index + 1}.</td>
//       <td>{college.name}</td>
//       <td>{college.icCode}</td>
//       <td>{college.address}</td>
//       <td>{college.phone}</td>
//       <td>{college.email}</td>
//       <td className="d-flex justify-content-center align-items-center">
//         <button
//           className="btn btn-sm btn-danger"
//           type="button"
//           title="Delete"
//           onClick={() => onDelete(college)}
//           disabled={loading}
//         >
//           {loading ? <Spinner size="sm" animation="border" /> : "Delete"}
//         </button>
//         <button className="btn btn-success" onClick={() => onDownload(college.id)}>Download</button>
//       </td>
//     </tr>
//   );
// };

// export default CollegeRow;


import { Button, Spinner } from "react-bootstrap";

const CollegeRow = ({ college, index, onDelete, onDownload, loading, downloading }) => (
  <tr>
    <td>{index + 1}</td>
    <td>{college.name}</td>
    <td>{college.icCode}</td>
    <td>{college.address}</td>
    <td>{college.phone}</td>
    <td>{college.email}</td>
    <td className="d-flex">
      <Button variant="danger" size="sm" onClick={() => onDelete(college)} disabled={loading}>
        {loading ? <Spinner size="sm" animation="border" /> : "Delete"}
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="ms-2"
        onClick={() => onDownload(college.id)}
        disabled={downloading}
      >
        {downloading ? <Spinner size="sm" animation="border" /> : "Download"}
      </Button>
    </td>
  </tr>
);

export default CollegeRow;

