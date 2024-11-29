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

// import { Col, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
// import CollegeRow from "./CollegeRow";
// import { deleteCollege } from "../../services/college-apis";
// import { useState } from "react";
// import { fetchParticipantsByCollegeId } from "../../services/participants-api";

// const CollegeList = ({ colleges, setColleges, loading }) => {
//   const [loadingId, setLoadingId] = useState(null); // ID of the college being deleted
//   const [showModal, setShowModal] = useState(false); // For delete confirmation modal
//   const [selectedCollege, setSelectedCollege] = useState(null);

//   const handleShowModal = (college) => {
//     setSelectedCollege(college);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedCollege(null);
//     setShowModal(false);
//   };

//   const handleDelete = async () => {
//     setLoadingId(selectedCollege.id);
//     try {
//       const response = await deleteCollege(selectedCollege.id);
//       console.log(response);
//       //   alert(`"${selectedCollege.name}" got deleted!`);
//       const newColleges = colleges.filter((c) => c.id !== selectedCollege.id);
//       setColleges(newColleges);
//     } catch (error) {
//       alert(`Unable to delete "${selectedCollege.name}"... please try again later!`);
//       console.log(error);
//     } finally {
//       setLoadingId(null);
//       handleCloseModal();
//     }
//   };

//   //   if (colleges?.length == 0 && loading) {
//   //     return <p className="text-center my-5">Loading...!</p>;
//   //   }

//   //   if (colleges?.length === 0 && !loading) {
//   //     return <p className="text-center my-5">No college has registered!</p>;
//   //   }

//   const handleDownload = async (collegeId) => {
//     console.log("collegeId:", collegeId)
//     try {
//       const response = await fetchParticipantsByCollegeId(collegeId)
//       console.log("Fetching the response of collegeId", response[0])
//     } catch (error) {
//       console.log("Error while Downloading...", error)
//     }
//   }

//   return (
//     <>
//       <Row className="mt-5 justify-content-center">
//         <Col md={10}>
//           <h2 className="text-center mb-4">List of Colleges</h2>
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>Sr. No.</th>
//                 <th>College Name</th>
//                 <th>Iccode</th>
//                 <th>Address</th>
//                 <th>Phone</th>
//                 <th>Email</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {colleges.map((college, index) => (
//                 <CollegeRow
//                   key={`college-row-${index}`}
//                   college={college}
//                   onDelete={handleShowModal}
//                   index={index}
//                   onDownload={handleDownload}
//                   loading={loadingId === college.id} // Only show loading for the specific row
//                 />
//               ))}
//             </tbody>
//           </Table>
//         </Col>
//       </Row>

//       {/* Confirmation Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="d-flex gap-1">
//             <span>Are you sure you want to delete </span>
//             <strong>{selectedCollege?.name}</strong>?
//           </div>
//         </Modal.Body>
//         <Modal.Footer className="d-flex justify-content-end">
//           <Button variant="danger" onClick={handleDelete} disabled={loadingId === selectedCollege?.id}>
//             {loadingId === selectedCollege?.id ? <Spinner size="sm" animation="border" /> : "Delete"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default CollegeList;

// import { Col, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
// import CollegeRow from "./CollegeRow";
// import { deleteCollege } from "../../services/college-apis";
// import { useEffect, useState } from "react";
// import { fetchParticipants, fetchParticipantsByCollegeId } from "../../services/participants-api";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { fetchAvailableEvents } from "../../services/available-events-apis";
// import { fetchEvents } from "../../services/event-apis";

// const CollegeList = ({ colleges, setColleges, loading }) => {
//   const [loadingId, setLoadingId] = useState(null); // ID of the college being deleted
//   const [downloadingId, setDownloadingId] = useState(null); // ID of the college being downloaded
//   const [showModal, setShowModal] = useState(false); // For delete confirmation modal
//   const [selectedCollege, setSelectedCollege] = useState(null);
//   const [availableEvents, setAvailableEvents] = useState([])
//   const [events, setEvents] = useState([])

//   useEffect(() => {
//     fetchAvailableEvents().then((data) => {
//       console.log("availableEvents:", data)
//       setAvailableEvents(data)
//     }).catch((err) => {
//       console.log("Error while fetchAvailableEvents", err)
//     })
//   }, [])

//   useEffect(() => {
//     fetchEvents().then((data) => {
//       console.log("events:", data)
//       setEvents(data);
//     }).catch((err) => {
//       console.log("Error while fetchEvents.", err)
//     })


//   }, [])

//   const handleShowModal = (college) => {
//     setSelectedCollege(college);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedCollege(null);
//     setShowModal(false);
//   };

//   const handleDelete = async () => {
//     setLoadingId(selectedCollege.id);
//     try {
//       const response = await deleteCollege(selectedCollege.id);
//       console.log(response);
//       const newColleges = colleges.filter((c) => c.id !== selectedCollege.id);
//       setColleges(newColleges);
//     } catch (error) {
//       alert(`Unable to delete "${selectedCollege.name}"... please try again later!`);
//       console.log(error);
//     } finally {
//       setLoadingId(null);
//       handleCloseModal();
//     }
//   };

//   const getParticipants = async (collegeId) => {
//     setDownloadingId(collegeId); // Show spinner for the download button
//     try {
//       const response = await fetchParticipantsByCollegeId(collegeId);
//       return response;
//     } catch (error) {
//       console.log("Error while downloading:", error);
//       return null;
//     } finally {
//       setDownloadingId(null); // Hide spinner after download
//     }
//   }

//   const handleDownloadAll = async () => {
//     console.log("Downloading all reports");
//     let pages = 1;
//     let i = 0;
//     let participants = [];
//     do {
//       try {
//         console.log("Fetching for page:", i + 1);
//         const response = await fetchParticipants(i + 1);
//         console.log(i + 1, response);
//         participants = [...participants, ...response?.content];
//         pages = response?.totalPages;
//       } catch (error) {
//         console.log(i + 1, error);
//       } finally {
//         i += 1;

//       }
//     } while (i < pages);

//     if (!participants || participants.length == 0) {
//       alert("No data available for downloading");
//       return;
//     }

//     const formattedData = handleFormatData(participants);

//     const worksheet = XLSX.utils.json_to_sheet(formattedData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, `college-participants.xlsx`);

//   }

//   const handleFormatData = (participants) => {
//     let formattedData = [];
//     for (let i = 0; i < participants.length; i++) {
//       const p = [];
//       const obj = {
//         srno: i + 1,
//         name: participants[i].name,
//         email: participants[i].email,
//         whatsappNumber: participants[i].whatsappNumber,
//         gender: colleges.find(c => c.id == participants[i].collegeId).male ? "M" : "F",
//         college: colleges.find(c => c.id == participants[i].collegeId).name,
//         event: "",
//         type: participants[i].type,
//         entry: participants[i].entryType,
//         present: colleges.find(c => c.id == participants[i].collegeId).present ? "Present" : "-",
//       }
//       for (let j = 0; j < participants[i].eventIds.length; j++) {
//         const event = events.find(e => e.id == participants[i].eventIds[j]);
//         const availableEvent = availableEvents.find(a => a.id == event?.availableEventId);
//         obj.srno = i + 1 + j;
//         obj.event = availableEvent.title
//         p.push(obj);
//       }


//       formattedData = [...formattedData, ...p];
//     }

//     return formattedData;
//   }

//   const handleDownload = async (collegeId) => {
//     const participants = await getParticipants(collegeId);
//     if (participants == null || participants.length == 0) {
//       alert("No data available to download.");
//       return;
//     }

//     const formattedData = handleFormatData(participants);

//     const worksheet = XLSX.utils.json_to_sheet(formattedData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, `participants-${colleges.find(c => c.id == collegeId)?.name}.xlsx`);
//   };

//   return (
//     <>
//       <Button onClick={handleDownloadAll}>Download All</Button>
//       <Row className="mt-5 justify-content-center">
//         <Col md={10}>
//           <h2 className="text-center mb-4">List of Colleges</h2>
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>Sr. No.</th>
//                 <th>College Name</th>
//                 <th>Iccode</th>
//                 <th>Address</th>
//                 <th>Phone</th>
//                 <th>Email</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {availableEvents && events && colleges.map((college, index) => (
//                 <CollegeRow
//                   key={`college-row-${index}`}
//                   college={college}
//                   onDelete={handleShowModal}
//                   index={index}
//                   onDownload={handleDownload}
//                   loading={loadingId === college.id}
//                   downloading={downloadingId === college.id} // Pass downloading state
//                 />
//               ))}
//             </tbody>
//           </Table>
//         </Col>
//       </Row>

//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="d-flex gap-1">
//             <span>Are you sure you want to delete </span>
//             <strong>{selectedCollege?.name}</strong>?
//           </div>
//         </Modal.Body>
//         <Modal.Footer className="d-flex justify-content-end">
//           <Button variant="danger" onClick={handleDelete} disabled={loadingId === selectedCollege?.id}>
//             {loadingId === selectedCollege?.id ? <Spinner size="sm" animation="border" /> : "Delete"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default CollegeList;





import { Col, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
import CollegeRow from "./CollegeRow";
import { deleteCollege } from "../../services/college-apis";
import { useEffect, useState } from "react";
import { fetchParticipants, fetchParticipantsByCollegeId } from "../../services/participants-api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchAvailableEvents } from "../../services/available-events-apis";
import { fetchEvents } from "../../services/event-apis";
import { AiOutlineDownload } from "react-icons/ai";
import { fetchCategories } from "../../services/categories-api";

const CollegeList = ({ colleges, setColleges, loading }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDownLoad, setLoadingDownLoad] = useState(false);
  const [categories, setCategories] = useState()
  useEffect(() => {
    fetchAvailableEvents()
      .then((data) => {
        console.log("availableEvents:", data);
        setAvailableEvents(data)
      })
      .catch((err) => console.log("Error while fetching available events", err));
  }, []);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        console.log("events:", data);
        setEvents(data)
      })
      .catch((err) => console.log("Error while fetching events", err));
  }, []);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log("categories:", data);
        setCategories(data)
      })
      .catch((err) => console.log("Error while fetching events", err));
  }, []);

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
      await deleteCollege(selectedCollege.id);
      setColleges(colleges.filter((c) => c.id !== selectedCollege.id));
    } catch (error) {
      alert(`Unable to delete "${selectedCollege.name}". Please try again later!`);
    } finally {
      setLoadingId(null);
      handleCloseModal();
    }
  };

  const getParticipants = async (collegeId) => {
    setDownloadingId(collegeId);
    try {
      return await fetchParticipantsByCollegeId(collegeId);
    } catch (error) {
      console.log("Error while downloading:", error);
      return null;
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    let participants = [];
    let i = 0;
    setLoadingDownLoad(true);
    setCurrentPage(1);
    setPages(1);
    let pages;

    do {
      try {
        console.log("Fetching page:", i + 1);
        const response = await fetchParticipants(i + 1);
        participants = [...participants, ...response?.content];
        pages = response?.totalPages;
        console.log(i + 1, response.content);
        setCurrentPage(i + 1);
        setPages(response?.totalPages);
      } catch (error) {
        console.log("Error fetching page:", error);
      } finally {
        i++;
      }
    } while (i < pages);

    if (!participants.length) {
      alert("No data available for download.");
      return;
    }

    const formattedData = handleFormatData(participants);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `college-participants.xlsx`);
  };

  const handleFormatData = (participants) => {
    let formattedData = [];
    participants.forEach((participant, index) => {
      const eventsData = participant.eventIds.map((eventId) => {
        const event = events.find((e) => e.id === eventId);
        const availableEvent = availableEvents.find((a) => a.id === event?.availableEventId);
        const category = categories.find((c) => c.id === availableEvent?.eventCategoryId);
        return {
          srno: index + 1,
          name: participant.name,
          email: participant.email,
          whatsappNumber: participant.whatsappNumber,
          gender: participant.male ? "M" : "F",
          iccode: colleges.find(c => c.id == participant.collegeId)?.icCode,
          college: colleges.find((c) => c.id === participant.collegeId)?.name,
          category: category?.name || "",
          event: availableEvent?.title || "",
          type: participant.type,
          entry: participant.entryType,
          present: participant.present ? "Present" : "-",
        };
      });
      formattedData = [...formattedData, ...eventsData];
    });

    setLoadingDownLoad(false);

    return formattedData;
  };

  const handleDownload = async (collegeId) => {
    console.log("college:", collegeId);
    const participants = await getParticipants(collegeId);
    if (!participants?.length) {
      alert("No data available for download.");
      return;
    }

    const formattedData = handleFormatData(participants);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `participants-${colleges.find((c) => c.id === collegeId)?.name}.xlsx`);
  };

  return (
    <>
      <div className="d-flex justify-content-center my-3">
        <div>
          <Button
            variant="success"
            className="download-all-btn d-flex align-items-center gap-2"
            onClick={handleDownloadAll}
            disabled={availableEvents.length == 0 || events.length == 0 || (!colleges || colleges.length == 0) || (!categories || categories.length == 0) || loadingDownLoad}
          >
            <AiOutlineDownload size={20} />
            {loadingDownLoad ? "Please wait..." : "Download All Reports"}
          </Button>
          {loadingDownLoad && <p>Total Pages: {currentPage}/{pages}</p>}
        </div>

      </div>
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
                  key={college.id}
                  college={college}
                  index={index}
                  onDelete={handleShowModal}
                  onDownload={handleDownload}
                  loading={loadingId === college.id}
                  downloading={downloadingId === college.id}
                />
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

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
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loadingId === selectedCollege?.id}
          >
            {loadingId === selectedCollege?.id ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CollegeList;


