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

import { Spinner } from "react-bootstrap";

// export default CollegeRow;






const CollegeRow = ({ college, onDelete, index, loading }) => {
    return (
      <tr>
        <td>{index + 1}.</td>
        <td>{college.name}</td>
        <td>{college.icCode}</td>
        <td>{college.address}</td>
        <td>{college.phone}</td>
        <td>{college.email}</td>
        <td>
          <button
            className="btn btn-sm btn-danger"
            type="button"
            title="Delete"
            onClick={() => onDelete(college)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Delete"}
          </button>
        </td>
      </tr>
    );
  };
  
  export default CollegeRow;
  