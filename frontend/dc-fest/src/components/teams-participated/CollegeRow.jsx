/* eslint-disable react/prop-types */
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
      <Button variant="primary" size="sm" className="ms-2" onClick={() => onDownload(college.id)} disabled={downloading}>
        {downloading ? <Spinner size="sm" animation="border" /> : "Download"}
      </Button>
    </td>
  </tr>
);

export default CollegeRow;
