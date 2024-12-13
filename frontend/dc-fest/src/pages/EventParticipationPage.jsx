/* eslint-disable no-unused-vars */
// import { useEffect, useState } from "react";
// import { Table, Container, Alert, Button, Modal, Form } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "../styles/EventParticipationPage.css"; // Import custom CSS
// import { fetchCategories } from "../services/categories-api";
// import { deleteParticipant, fetchParticipantsByEventId } from "../services/participants-api";
// import { fetchEventByAvailableEventId } from "../services/event-apis";
// import ParticipantRow from "../components/event-participation/ParticipantRow";
// import { fetchColleges } from "../services/college-apis";
// import * as XLSX from "xlsx";

// const EventParticipationPage = () => {
//   const [participants, setParticipants] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedParticipant, setSelectedParticipant] = useState(null);
//   const [selectedCollege, setSelectedCollege] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedAvailableEvent, setAvailableEvent] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [eventFilter, setEventFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");

//   const [categories, setCategories] = useState([]);
//   const [colleges, setColleges] = useState([]);

//   const getParticipants = async () => {
//     try {
//       setLoading(true);
//       const event = await fetchEventByAvailableEventId(eventFilter);
//       const participantsData = await fetchParticipantsByEventId(event.id);
//       setParticipants(participantsData);
//     } catch (err) {
//       console.error("Error fetching participants:", err);
//       setError("Failed to load participants.");
//     } finally {
//       setLoading(false);
//     }
//   }
//   // Fetch participants when eventFilter changes
//   useEffect(() => {
//     if (eventFilter) {
//       getParticipants()
//     }
//   }, [eventFilter,]);

//   useEffect(() => {
//     fetchColleges().then(data => {
//       console.log(data)
//       setColleges(data)
//     }).catch(err => {
//       console.log(err)
//     })
//   }, [])

//   // Fetch categories and initialize filters
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         setLoading(true);
//         const categoriesData = await fetchCategories();
//         setCategories(categoriesData);

//         if (categoriesData.length > 0) {
//           const firstCategory = categoriesData[0];
//           setCategoryFilter(firstCategory.id);
//           setSelectedCategory(firstCategory);

//           if (firstCategory.availableEvents?.length > 0) {
//             const firstEvent = firstCategory.availableEvents[0];
//             setEventFilter(firstEvent.id);
//             setAvailableEvent(firstEvent);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         setError("Failed to load categories.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInitialData();
//   }, []);

//   const handleEdit = (participant, college) => {
//     setSelectedParticipant(participant);
//     setSelectedCollege(college);
//     setShowEditModal(true);
//   };

//   const handleRemove = async (id) => {
//     const isConfirm = confirm("Are you sure you want to delete this participant.")
//     if (!isConfirm) {
//       return
//     }
//     try {
//       const response = await deleteParticipant(id)
//       console.log(response)
//       getParticipants()
//     } catch (error) {
//       console.error("Something error", err)
//     }
//   };

//   const handleModalClose = () => {
//     setShowEditModal(false);
//     setSelectedParticipant(null);
//   };

//   const handleSaveChanges = () => {
//     setParticipants((prev) => prev.map((participant) => (participant.id === selectedParticipant.id ? selectedParticipant : participant)));
//     handleModalClose();
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSelectedParticipant((prev) => ({ ...prev, [name]: value }));
//   };

//   if (error) {
//     return (
//       <Container className="mt-4">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );
//   }

//   const handleFormatData = () => {
//     let formattedData = [];
//     participants.forEach((participant, index) => {
//       const eventsData = participant.eventIds.map((eventId) => {
//         return {
//           srno: index + 1,
//           name: participant.name,
//           email: participant.email,
//           whatsappNumber: participant.whatsappNumber,
//           gender: participant.male ? "M" : "F",
//           iccode: colleges.find(c => c.id == participant.collegeId)?.icCode,
//           college: colleges.find((c) => c.id === participant.collegeId)?.name,
//           category: selectedCategory?.name || "",
//           event: selectedAvailableEvent?.title || "",
//           type: participant.type,
//           entry: participant.entryType,
//           present: participant.present ? "Present" : "-",
//         };
//       });
//       formattedData = [...formattedData, ...eventsData];
//     });

//     return formattedData;
//   };

//   const handleDownload = () => {
//     if (!participants.length) {
//       alert("No data available for download.");
//       return;
//     }

//     const formattedParticipants = handleFormatData();

//     const worksheet = XLSX.utils.json_to_sheet(formattedParticipants);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

//     saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${selectedAvailableEvent?.slug}-participants.xlsx`);
//   };

//   return (
//     <Container className="mt-4">
//       <h1 className="text-center mb-4">Event Participation List</h1>

//       {/* Dropdowns for filtering participants */}
//       <div className="mb-4 filter-dropdowns">
//         <Form.Select
//           className="category-dropdown"
//           value={categoryFilter}
//           onChange={(e) => {
//             const tmpSelectedCategory = categories.find((c) => c.id == e.target.value);
//             setCategoryFilter(e.target.value);
//             setSelectedCategory(tmpSelectedCategory);

//             if (tmpSelectedCategory) {
//               const firstEvent = tmpSelectedCategory.availableEvents[0];
//               setEventFilter(firstEvent.id);
//               setAvailableEvent(firstEvent);
//             }
//           }}
//         >
//           {categories.map((category, categoryIndex) => (
//             <option key={`category-${categoryIndex}`} value={category.id}>
//               {category.name}
//             </option>
//           ))}
//         </Form.Select>

//         <Form.Select
//           className="event-dropdown me-2"
//           value={eventFilter}
//           onChange={(e) => {
//             setEventFilter(e.target.value);

//             const tmpAvailableEvent = selectedCategory?.availableEvents?.find((ele) => ele.id == e.target.value);
//             setAvailableEvent(tmpAvailableEvent);
//           }}
//         >
//           {selectedCategory?.availableEvents?.map((availableEvent, availableEventIndex) => (
//             <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
//               {availableEvent.title}
//             </option>
//           ))}
//         </Form.Select>
//       </div>
//       <Button variant="success" disabled={colleges.length == 0 || participants.length == 0} onClick={handleDownload}>Download</Button>

//       {participants.length > 0 && (
//         <div className="mb-5 pb-5">
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Participant Name</th>
//                 <th>ICCODE</th>
//                 {/* <th>Group/Participant Id</th> */}
//                 <th>Email</th>
//                 <th>Category</th>
//                 <th>Event</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {participants.map((participant, index) => (
//                 <ParticipantRow
//                   key={participant.id}
//                   category={categories.find((cat) => cat.id === selectedAvailableEvent?.eventCategoryId)}
//                   index={index}
//                   availableEvent={selectedAvailableEvent}
//                   participant={participant}
//                   handleEdit={handleEdit}
//                   handleRemove={handleRemove}
//                 />
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       )}

//       {/* Edit Modal */}
//       <Modal show={showEditModal} onHide={handleModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Participant</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedParticipant && (
//             <Form className="w-100">
//               <Form.Group controlId="formName">
//                 <Form.Label>Name</Form.Label>
//                 <Form.Control type="text" name="name" value={selectedParticipant.name} onChange={handleInputChange} />
//               </Form.Group>
//               <Form.Group controlId="formCollege">
//                 <Form.Label>ICCODE</Form.Label>
//                 <Form.Control type="text" name="icCode" value={selectedCollege?.icCode || ""} style={{ backgroundColor: "aliceblue" }} />
//               </Form.Group>
//               <Form.Group controlId="formEmail">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control type="email" name="email" value={selectedParticipant.email} onChange={handleInputChange} />
//               </Form.Group>
//               <Form.Group controlId="formEvent">
//                 <Form.Label>Whatsapp Number</Form.Label>
//                 <Form.Control type="text" name="whatsappNumber" value={selectedParticipant.whatsappNumber || ""} onChange={handleInputChange} />
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleModalClose}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleSaveChanges}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default EventParticipationPage;

import { useEffect, useState } from "react";
import { Table, Container, Alert, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "../styles/EventParticipationPage.css"; // Import custom CSS
import { fetchCategories } from "../services/categories-api";
import { deleteParticipant, fetchParticipantsByEventId, updateParticipant } from "../services/participants-api";
import { fetchEventByAvailableEventId } from "../services/event-apis";
import ParticipantRow from "../components/event-participation/ParticipantRow";
import { fetchColleges } from "../services/college-apis";
import * as XLSX from "xlsx";
import { generateQrcode, getPop } from "../services/attendance-apis";

const EventParticipationPage = () => {
  const [confirmParticipation, setConfirmParticipation] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvailableEvent, setAvailableEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pop, setPop] = useState();
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [group, setGroup] = useState("");

  // Fetch participants when eventFilter changes
  useEffect(() => {
    if (eventFilter && selectedCollege && colleges.length > 0) {
      console.log(selectedCollege);
      getParticipants();
    }
  }, [eventFilter, colleges]);

  useEffect(() => {
    if (!selectedCollege) {
      fetchColleges()
        .then((data) => {
          console.log(data);
          setColleges(data);
          setSelectedCollege(data[0]);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  useEffect(() => {
    if (selectedCollege && participants.length > 0) {
      setFilteredParticipants(participants.filter((p) => p.collegeId == selectedCollege.id));
    }
  }, [selectedCollege, participants]);

  // Fetch categories and initialize filters
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          //   const firstCategory = categoriesData.find((c) => c.name == "TEST_CATEGORY");
          const firstCategory = categoriesData[0];
          setCategoryFilter(firstCategory.id);
          setSelectedCategory(firstCategory);

          if (firstCategory.availableEvents?.length > 0) {
            const firstEvent = firstCategory.availableEvents[0];
            setEventFilter(firstEvent.id);
            setAvailableEvent(firstEvent);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  //   useEffect(() => {
  //     if (selectedCollege && eventFilter && selectedAvailableEvent) {
  //       fetchPop();
  //     }
  //   }, [selectedCollege, eventFilter, selectedAvailableEvent]);

  const getParticipants = async () => {
    console.log("eventFilter before going to trycatch:", eventFilter);
    try {
      setLoading(true);
      const event = await fetchEventByAvailableEventId(eventFilter);
      const response = await fetchParticipantsByEventId(event.id);

      setParticipants(response);
      console.log(`response for eventFilter: ${eventFilter}, participants:`, response);
      if (response.length > 0) {
        setSelectedCollege(colleges.find((c) => c.id == response[0].collegeId));
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError("Failed to load participants.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (participant, college) => {
    setSelectedParticipant(participant);
    setSelectedCollege(college);
    setShowEditModal(true);
  };

  const handleRemove = async (id) => {
    const isConfirm = confirm("Are you sure you want to delete this participant.");
    if (!isConfirm) {
      return;
    }
    try {
      console.log("deleting participant:", id);
      const response = await deleteParticipant(id);
      console.log("in delete:", response);
      await getParticipants();
    } catch (error) {
      console.error("Something error", error);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedParticipant(null);
  };

  // const handleSaveChanges = () => {
  //   setFilteredParticipants((prev) => prev.map((participant) => (participant.id == selectedParticipant.id ? selectedParticipant : participant)));
  //   setParticipants((prev) => prev.map((p => )))
  //   handleModalClose();
  // };

  const handleSaveChanges = async () => {
    // Update the participant in both filteredParticipants and participants
    const updatedParticipant = selectedParticipant;
    try {
      const response = await updateParticipant(updatedParticipant);
      // Update filteredParticipants state
      setFilteredParticipants((prev) => prev.map((participant) => (participant.id == updatedParticipant.id ? updatedParticipant : participant)));

      // Update participants state
      setParticipants((prev) => prev.map((participant) => (participant.id == updatedParticipant.id ? updatedParticipant : participant)));
    } catch (error) {
      alert("Oops! Unable to save the participant.");
      return;
    } finally {
      handleModalClose(); // Close the modal after saving changes
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedParticipant((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormatData = () => {
    let formattedData = [];
    participants.forEach((participant, index) => {
      const eventsData = participant.eventIds.map((eventId) => {
        return {
          srno: index + 1,
          name: participant.name,
          email: participant.email,
          whatsappNumber: participant.whatsappNumber,
          hand_preference: participant.handPreference,
          gender: participant.male ? "M" : "F",
          iccode: colleges.find((c) => c.id == participant.collegeId)?.icCode,
          college: colleges.find((c) => c.id === participant.collegeId)?.name,
          category: selectedCategory?.name || "",
          event: selectedAvailableEvent?.title || "",
          team: participant.group,
          type: participant.type,
          entry: participant.entryType,
          present: participant.present ? "Present" : "-",
        };
      });
      formattedData = [...formattedData, ...eventsData];
    });

    return formattedData;
  };

  const handleDownload = () => {
    if (!participants.length) {
      alert("No data available for download.");
      return;
    }

    const formattedParticipants = handleFormatData();

    const worksheet = XLSX.utils.json_to_sheet(formattedParticipants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${selectedAvailableEvent?.slug}-participants.xlsx`);
  };

  const getTotalColleges = () => {
    const tmpCollegeIds = [];
    for (let i = 0, c = 0; i < participants.length; i++) {
      if (tmpCollegeIds.includes(participants[i].collegeId)) {
        continue;
      }
      tmpCollegeIds.push(participants[i].collegeId);
    }

    return tmpCollegeIds;
  };

  //   const fetchPop = async () => {
  //     if (!selectedCollege || !selectedAvailableEvent || !eventFilter) {
  //       return;
  //     }
  //     console.log(selectedCollege);
  //     console.log(selectedAvailableEvent);
  //     console.log(eventFilter);
  //     console.log(selectedAvailableEvent?.rounds[0]);
  //     try {
  //       const response = await getPop(selectedCollege.id, selectedAvailableEvent.id, selectedAvailableEvent?.rounds[0].id);
  //       console.log(response);
  //       setPop(response);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  const handleConfirmParticipants = async (group) => {
    if (!selectedCollege || !selectedAvailableEvent || !eventFilter) {
      return;
    }
    console.log(selectedCollege);
    console.log(selectedAvailableEvent);
    console.log(eventFilter);
    console.log(selectedAvailableEvent?.rounds[0]);
    try {
      setConfirmParticipation(true);
      const response = await generateQrcode(selectedCollege.id, selectedAvailableEvent.id, selectedAvailableEvent?.rounds[0].id, group);
      console.log(response);
      setPop(response);
      setGroup(group);
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmParticipation(false);
    }
  };

  const handlePdfOpen = () => {
    if (!pop) {
      return;
    }
    console.log(pop);
    // Assuming `response` is the byte array (PDF content)
    const pdfBlob = new Blob([pop], { type: "application/pdf" });

    // Create a URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    // Open the PDF in a new tab
    window.open(pdfUrl, "_blank");
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Event Participation List</h1>
      <p>
        Total Colleges: {getTotalColleges()?.length} / {selectedAvailableEvent?.eventRules?.find((r) => r.eventRuleTemplate.name == "REGISTERED_SLOTS_AVAILABLE")?.value}
      </p>
      {/* Dropdowns for filtering participants */}
      <div className="mb-4 filter-dropdowns d-flex gap-2">
        <Form.Select
          className="category-dropdown"
          value={categoryFilter}
          onChange={(e) => {
            const tmpSelectedCategory = categories.find((c) => c.id == e.target.value);
            setCategoryFilter(e.target.value);
            setSelectedCategory(tmpSelectedCategory);
            if (tmpSelectedCategory) {
              const firstEvent = tmpSelectedCategory.availableEvents[0];
              setEventFilter(firstEvent.id);
              setAvailableEvent(firstEvent);
            }
          }}
        >
          {categories.map((category, categoryIndex) => (
            <option key={`category-${categoryIndex}`} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          className="event-dropdown me-2"
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);

            const tmpAvailableEvent = selectedCategory?.availableEvents?.find((ele) => ele.id == e.target.value);
            setAvailableEvent(tmpAvailableEvent);
          }}
        >
          {selectedCategory?.availableEvents?.map((availableEvent, availableEventIndex) => (
            <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
              {availableEvent.title}
            </option>
          ))}
        </Form.Select>

        {selectedCollege && participants.length > 0 && (
          <Form.Select
            className="event-dropdown me-2"
            value={selectedCollege ? selectedCollege?.id : colleges[0].id}
            onChange={(e) => {
              const tmpCollege = colleges.find((c) => c.id == e.target.value);
              console.log("on changing, tmpCollege:", tmpCollege);
              setSelectedCollege(tmpCollege);
              // console.log("participants.filter(p.collegeId == tmpCollege.id):", participants.filter(p => p.collegeId == tmpCollege.id));
              // setFilteredColleges(participants.filter(p => p.collegeId == tmpCollege.id));
              // getParticipants();
            }}
          >
            {colleges?.map((college, collegeIndex) => {
              // console.log("in loop before if:", participants)
              if (participants.filter((p) => p.collegeId == college.id).length > 0) {
                return (
                  <option key={`college-${collegeIndex}`} value={college.id}>
                    {college?.name}
                  </option>
                );
              }
            })}
          </Form.Select>
        )}
      </div>
      {filteredParticipants.length > 0 && (
        <div className="d-flex justify-content-between">
          <Button variant="success" disabled={colleges.length == 0 || participants.length == 0} onClick={handleDownload}>
            Download
          </Button>
          {/* <div>
            {!pop && (
              <Button disabled={filteredParticipants.length == 0 || confirmParticipation} variant="warning" onClick={handleConfirmParticipants}>
                Confirm Participants
              </Button>
            )}
            {pop && (
              <Button variant="danger" onClick={handlePdfOpen} disabled={filteredParticipants.length == 0}>
                Download POP
              </Button>
            )}
          </div> */}
        </div>
      )}

      {filteredParticipants.length > 0 && (
        <div className="mb-5 pb-5">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>ICCODE</th>
                <th>Category</th>
                <th>Event</th>
                <th>Team</th>
                <th>Participant Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Hand Preference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant, index) => (
                <ParticipantRow
                  key={participant.id}
                  category={categories.find((cat) => cat.id === selectedAvailableEvent?.eventCategoryId)}
                  index={index}
                  availableEvent={selectedAvailableEvent}
                  participant={participant}
                  handleEdit={handleEdit}
                  handleRemove={handleRemove}
                  pop={pop}
                  group={group}
                />
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant && (
            <div className="w-100">
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={selectedParticipant.name} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group controlId="formCollege">
                <Form.Label>ICCODE</Form.Label>
                <Form.Control type="text" name="icCode" value={selectedCollege?.icCode || ""} style={{ backgroundColor: "aliceblue" }} />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={selectedParticipant.email} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group controlId="formEvent">
                <Form.Label>Whatsapp Number</Form.Label>
                <Form.Control type="text" name="whatsappNumber" value={selectedParticipant.whatsappNumber || ""} onChange={handleInputChange} />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventParticipationPage;
