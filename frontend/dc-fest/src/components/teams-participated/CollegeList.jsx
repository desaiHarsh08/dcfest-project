/* eslint-disable react/prop-types */
// /* eslint-disable react/prop-types */
// import { Col, Row, Table } from "react-bootstrap";
// import CollegeRow from "./CollegeRow";
// import { deleteCollege } from "../../services/college-apis";
// import { useState } from "react";

// const CollegeList = ({ colleges, setColleges }) => {
//   const [loading, setLoading] = useState(false);
//   if (colleges?.length === 0) {
//     return <p className="text-center my-5">No college has registed!</p>;
//   }

//   const handleDelete = async (college) => {
//     let isConfirmed = confirm(`Are you sure that you want to delete <span>"${college?.name}"</span>?`);
//     if (isConfirmed) {
//       setLoading(true);
//       try {
//         const response = await deleteCollege(college?.id);
//         console.log(response);
//         alert(`"${college?.name}" got deleted!`);
//         const newColleges = colleges.filter((c) => c.id != college?.id);
//         setColleges(newColleges);
//       } catch (error) {
//         alert(`Unable to delete "${college?.name}"... please try again later!`);
//         console.log(error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <Row className="mt-5 justify-content-center">
//       <Col md={10}>
//         <h2 className="text-center mb-4">List of Colleges</h2>
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Sr. No.</th>
//               <th>College Name</th>
//               <th>Iccode</th>
//               <th>Address</th>
//               <th>Phone</th>
//               <th>Email</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {colleges.map((college, index) => (
//               <CollegeRow key={`college-row-${index}`} college={college} onDelete={handleDelete} index={index} loading={loading} />
//             ))}
//           </tbody>
//         </Table>
//       </Col>
//     </Row>
//   );
// };

// export default CollegeList;

import { Col, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
import CollegeRow from "./CollegeRow";
import { deleteCollege } from "../../services/college-apis";
import { useState } from "react";

const CollegeList = ({ colleges, setColleges, loading }) => {
  const [loadingId, setLoadingId] = useState(null); // ID of the college being deleted
  const [showModal, setShowModal] = useState(false); // For delete confirmation modal
  const [selectedCollege, setSelectedCollege] = useState(null);

  const handleShowModal = (college) => {
    setSelectedCollege(college);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCollege(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    setLoadingId(selectedCollege.id);
    try {
      const response = await deleteCollege(selectedCollege.id);
      console.log(response);
      //   alert(`"${selectedCollege.name}" got deleted!`);
      const newColleges = colleges.filter((c) => c.id !== selectedCollege.id);
      setColleges(newColleges);
    } catch (error) {
      alert(`Unable to delete "${selectedCollege.name}"... please try again later!`);
      console.log(error);
    } finally {
      setLoadingId(null);
      handleCloseModal();
    }
  };

//   if (colleges?.length == 0 && loading) {
//     return <p className="text-center my-5">Loading...!</p>;
//   }

//   if (colleges?.length === 0 && !loading) {
//     return <p className="text-center my-5">No college has registered!</p>;
//   }

  return (
    <>
      <Row className="mt-5 justify-content-center">
        <Col md={10}>
          <h2 className="text-center mb-4">List of Colleges</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>College Name</th>
                <th>Iccode</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college, index) => (
                <CollegeRow
                  key={`college-row-${index}`}
                  college={college}
                  onDelete={handleShowModal}
                  index={index}
                  loading={loadingId === college.id} // Only show loading for the specific row
                />
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-1">
            <span>Are you sure you want to delete </span>
            <strong>{selectedCollege?.name}</strong>?
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="danger" onClick={handleDelete} disabled={loadingId === selectedCollege?.id}>
            {loadingId === selectedCollege?.id ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CollegeList;
