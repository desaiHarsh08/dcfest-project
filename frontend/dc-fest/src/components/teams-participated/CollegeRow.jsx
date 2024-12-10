/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaBarcode, FaEnvelope, FaMapMarkerAlt, FaMobileAlt, FaPhoneAlt, FaUniversity, FaUser } from "react-icons/fa";

const CollegeRow = ({ college, index, onDelete, onDownload, onEdit, loading, downloading, onChange, onRepresentativeChange }) => {
  const [open, setOpen] = useState(false);
  console.log(college);
  const handleSave = async (college) => {
    await onEdit(college); // Pass the updated data to the parent component
    setOpen(false); // Close the modal
  };

  return (
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
        <Button variant="success" size="sm" className="ms-2" onClick={() => setOpen(true)}>
          Edit
        </Button>

        <Modal show={open} onHide={() => setOpen(false)} centered size="xl">
          <Modal.Header closeButton>
            <Modal.Title className="text-white">Edit College</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-3 w-100">
              <div className="border rounded p-3 bg-light">
                <FaUniversity className="me-2 text-primary" />
                <strong>College Name:</strong>
                <div className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control ms-2 " value={college.name} name="name" onChange={(e) => onChange(e, index)} />
                </div>
                <FaMapMarkerAlt className="me-2 text-primary" />
                <strong>Address:</strong>
                <div className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control ms-2" value={college.address} name="address" onChange={(e) => onChange(e, index)} />
                </div>
                <FaBarcode className="me-2 text-primary" />
                <strong>IC Code:</strong>
                <div className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control ms-2" value={college.icCode} name="icCode" disabled />
                </div>
                <FaPhoneAlt className="me-2 text-primary" />
                <strong>Phone:</strong>
                <div className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control ms-2" value={college.phone} name="phone" onChange={(e) => onChange(e, index)} />
                </div>
                {college?.representatives.map((rep, repIndex) => (
                  <div key={`rep-${repIndex}`} className="my-3">
                    <strong>Representative Details {repIndex + 1}:</strong>
                    {college?.representatives?.length > 0 ? (
                      <div className="mt-2">
                        <div className="d-flex align-items-center mb-2">
                          <div className="d-flex align-items-center" style={{ width: "100px" }}>
                            <FaUser className="me-2 text-success" />
                            <strong>Name:</strong>
                          </div>
                          <input type="text" className="form-control ms-2" name={"name"} value={rep?.name} onChange={(e) => onRepresentativeChange(e, index, repIndex)} />
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <div className="d-flex align-items-center" style={{ width: "100px" }}>
                            <FaEnvelope className="me-2 text-success" />
                            <strong>Email:</strong>
                          </div>
                          <input type="text" className="form-control ms-2" name={"email"} value={rep?.email} onChange={(e) => onRepresentativeChange(e, index, repIndex)} />
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center" style={{ width: "100px" }}>
                            <FaMobileAlt className="me-2 text-success" />
                            <strong>Phone:</strong>
                          </div>
                          <input type="text" className="form-control ms-2" name={"phone"} value={rep?.phone} onChange={(e) => onRepresentativeChange(e, index, repIndex)} />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-muted">No representative details available.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-end">
            <Button variant="danger" onClick={() => handleSave(college)}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </td>
    </tr>
  );
};

export default CollegeRow;
