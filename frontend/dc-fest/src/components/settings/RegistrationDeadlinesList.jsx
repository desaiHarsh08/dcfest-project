/* eslint-disable react/prop-types */
import { Table, Button } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";

const RegistrationDeadlinesList = ({ academicYears, onEdit }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.log("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="mt-4">
      {/* <h4>Registration Deadlines</h4> */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>SR No.</th>
            <th>Year</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {academicYears && academicYears.length > 0 ? (
            academicYears.map((academicYear, index) => (
              <tr key={academicYear.id}>
                <td>{index + 1}</td>
                <td>{academicYear.year}</td>
                <td>{formatDateTime(academicYear.startDate)}</td>
                <td>{formatDateTime(academicYear.endDate)}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      backgroundColor: academicYear.isActive || academicYear.active ? "#d4edda" : "#e2e3e5",
                      color: academicYear.isActive || academicYear.active ? "#155724" : "#383d41",
                      border: `1px solid ${academicYear.isActive || academicYear.active ? "#c3e6cb" : "#d6d8db"}`,
                    }}
                  >
                    {academicYear.isActive || academicYear.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Button variant="success" size="sm" onClick={() => onEdit(academicYear)} className="d-flex align-items-center justify-content-center mx-auto" style={{ width: "fit-content" }}>
                    <FaEdit className="me-1" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No academic years found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default RegistrationDeadlinesList;
