/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "../../styles/AcademicYearModal.css";

const AcademicYearEditModal = ({ show, onHide, academicYear, onSave }) => {
  const [formData, setFormData] = useState({
    year: "",
    startDateTime: "",
    endDateTime: "",
  });
  const [closeNow, setCloseNow] = useState(false);

  // Get current datetime in format for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get current date at midnight (00:00) for start date minimum
  // This allows selecting any time on today or future dates
  const getCurrentDateAtMidnight = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00`;
  };

  useEffect(() => {
    if (academicYear) {
      // Parse the datetime strings and format for datetime-local input
      const startDateTime = academicYear.startDate ? new Date(academicYear.startDate) : null;
      const endDateTime = academicYear.endDate ? new Date(academicYear.endDate) : null;

      // Format for datetime-local: YYYY-MM-DDTHH:mm
      const formatForDateTimeLocal = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        year: academicYear.year || "",
        startDateTime: formatForDateTimeLocal(startDateTime),
        endDateTime: formatForDateTimeLocal(endDateTime),
      });
      setCloseNow(false); // Reset checkbox when modal opens with new data
    }
  }, [academicYear]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCloseNowChange = (e) => {
    const isChecked = e.target.checked;
    setCloseNow(isChecked);

    if (isChecked) {
      // Set end date/time to current datetime
      const currentDateTime = getCurrentDateTimeLocal();
      setFormData((prev) => ({
        ...prev,
        endDateTime: currentDateTime,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert datetime-local format to ISO datetime strings
    const startDateTime = formData.startDateTime ? `${formData.startDateTime}:00` : null;
    const endDateTime = formData.endDateTime ? `${formData.endDateTime}:00` : null;

    const updatedData = {
      id: academicYear.id,
      year: formData.year,
      startDate: startDateTime,
      endDate: endDateTime,
      // isActive is not included - active status should be managed separately
    };

    onSave(updatedData);
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="academic-year-modal">
      <Modal.Header closeButton>
        <Modal.Title>Edit Academic Year</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <Form.Group className="mb-3">
            <Form.Label>Year</Form.Label>
            <Form.Control type="text" name="year" value={formData.year} onChange={handleChange} placeholder="e.g., 2025" required style={{ width: "100%" }} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date & Time</Form.Label>
            <Form.Control type="datetime-local" name="startDateTime" value={formData.startDateTime} onChange={handleChange} min={getCurrentDateAtMidnight()} required style={{ width: "100%" }} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date & Time</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Control
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime || ""}
                onChange={handleChange}
                required={!closeNow}
                readOnly={false}
                style={{ flex: 1, pointerEvents: closeNow ? "none" : "auto" }}
                key={`endDateTime-${academicYear?.id || "new"}`}
              />
              <Form.Check type="checkbox" id="closeNow" label="Close" checked={closeNow} onChange={handleCloseNowChange} style={{ whiteSpace: "nowrap" }} />
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AcademicYearEditModal;
