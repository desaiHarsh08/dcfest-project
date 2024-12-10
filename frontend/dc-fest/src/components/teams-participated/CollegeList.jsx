/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Col, Row, Table, Modal, Button, Spinner } from "react-bootstrap";
import CollegeRow from "./CollegeRow";
import { deleteCollege, updateCollege } from "../../services/college-apis";
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
  const [categories, setCategories] = useState();
  useEffect(() => {
    fetchAvailableEvents()
      .then((data) => {
        console.log("availableEvents:", data);
        setAvailableEvents(data);
      })
      .catch((err) => console.log("Error while fetching available events", err));
  }, []);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        console.log("events:", data);
        setEvents(data);
      })
      .catch((err) => console.log("Error while fetching events", err));
  }, []);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log("categories:", data);
        setCategories(data);
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

  const handleDownloadCollegeParticipants = async (collegeId) => {
    const college = colleges.find((c) => c.id == collegeId);
    const participants = await getParticipants(collegeId);
    if (!participants || participants.length == 0) {
      alert("No data available for downloading!");
      return;
    }

    const formattedData = handleFormatData(participants);

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `participants-${colleges.find((c) => c.id === collegeId)?.name}.xlsx`);
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
          iccode: colleges.find((c) => c.id == participant.collegeId)?.icCode,
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

  const handleDownload = async () => {
    // const formattedData = handleFormatData(participants);
    const formattedData = [];
    for (let i = 0, c = 0; i < colleges.length; i++) {
      for (let j = 0; j < colleges[i].representatives.length; j++) {
        console.log("adding college: ", colleges[i].icCode, ++c);
        formattedData.push({
          srno: formattedData.length + i + j + 1,
          iccode: colleges[i].icCode,
          name: colleges[i].name,
          email: colleges[i].email,
          phone: colleges[i].phone,
          points: colleges[i].points,
          rep_name: colleges[i].representatives[j].name,
          rep_email: colleges[i].representatives[j].email,
          rep_phone: colleges[i].representatives[j].phone,
          rep_whatsappNumber: colleges[i].representatives[j].whatsappNumber,
        });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `colleges.xlsx`);
  };

  const handleCollegeChange = (e, collegeIndex) => {
    const { name, value } = e.target;
    let newColleges = [...colleges];
    newColleges[collegeIndex][name] = value;

    setColleges(newColleges);
  };

  const handleRepresentativeChange = (e, collegeIndex, repIndex) => {
    const { name, value } = e.target;
    let newColleges = [...colleges];
    newColleges = newColleges.map((college, idx) => {
      if (collegeIndex == idx) {
        const newCollege = { ...college };
        newCollege.representatives = newCollege.representatives.map((rep, index) => {
          if (index == repIndex) {
            return { ...rep, [name]: value };
          }
          return rep;
        });
        return newCollege;
      }
      return college;
    });

    setColleges(newColleges);
  };

  const handleEdit = async (updatedCollege) => {
    try {
      const response = await updateCollege(updatedCollege);
      const newColleges = colleges.map((college) => {
        if (college.id == updatedCollege.id) {
          return response;
        }
        return college;
      });
      setColleges(newColleges);
    } catch (error) {
      alert("Unable to update the college... Please try again later!");
      console.log("error:", error);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center my-3"></div>
      <Row className="mt-5 justify-content-center">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center  my-3">
            <div className="d-flex align-items-center">
              <h2 className="m-0">List of Colleges</h2>
            </div>
            <Button variant="success" className="download-all-btn d-flex align-items-center gap-2" onClick={handleDownload} disabled={!colleges || colleges.length == 0}>
              <AiOutlineDownload size={20} />
              {loadingDownLoad ? "Please wait..." : "Download List"}
            </Button>
          </div>
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
                  onChange={handleCollegeChange}
                  onRepresentativeChange={handleRepresentativeChange}
                  index={index}
                  onDelete={handleShowModal}
                  onDownload={handleDownloadCollegeParticipants}
                  loading={loadingId === college.id}
                  downloading={downloadingId === college.id}
                  onEdit={handleEdit}
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
          <Button variant="danger" onClick={handleDelete} disabled={loadingId === selectedCollege?.id}>
            {loadingId === selectedCollege?.id ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CollegeList;
