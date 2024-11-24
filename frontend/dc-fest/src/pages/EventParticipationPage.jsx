// // src/pages/EventParticipationPage.jsx
// import { useEffect, useState } from "react";
// import { Table, Container, Alert, Button, Modal, Form } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "../styles/EventParticipationPage.css"; // Import custom CSS
// import { fetchCategories } from "../services/categories-api";
// import { fetchParticipantsByEventId } from "../services/participants-api";
// import { fetchEventByAvailableEventId } from "../services/event-apis";
// import { fetchAvailableEventsById } from "../services/available-events-apis";
// import ParticipantRow from "../components/event-participation/ParticipantRow";

// const EventParticipationPage = () => {
//   const [participants, setParticipants] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedParticipant, setSelectedParticipant] = useState(null);
//   const [selectedCollege, setSelectedCollege] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState();
//   const [selectedAvailableEvent, setSelecteAvailableEvent] = useState();
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [eventFilter, setEventFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");

//   const [categories, setCategories] = useState([]);

//   const [availableEvent, setAvailableEvent] = useState();

//   // Simulate data fetching
//   useEffect(() => {
//     if (eventFilter && eventFilter != "") {
//       const fetchParticipants = () => {
//         setLoading(true);
//         fetchEventByAvailableEventId(eventFilter)
//           .then((data) => {
//             console.log("event is:", data);
//             fetchParticipantsByEventId(data.id)
//               .then((data) => {
//                 console.log("participants:", data);
//                 setParticipants(data);
//               })
//               .catch((err) => console.log(err));
//           })
//           .catch((err) => console.log("unable to fetch the event", err));
//         setLoading(false);
//       };

//       fetchParticipants();
//     }
//   }, [eventFilter]);

//   //   useEffect(() => {
//   //     if (eventFilter && eventFilter != "") {
//   //       fetchAvailableEventsById(eventFilter)
//   //         .then((data) => setAvailableEvent(data))
//   //         .catch((err) => console.log(err));
//   //     }
//   //   }, [eventFilter]);

//   useEffect(() => {
//     fetchCategories()
//       .then((data) => {
//         console.log(data);
//         setCategories(data);

//         // Check if data is not empty and has a valid structure before setting filters
//         if (data.length > 0) {
//           const firstCategory = data[0];
//           setCategoryFilter(firstCategory.id);
//           setSelectedCategory(firstCategory);
//           // Check if availableEvents exists and has at least one event
//           if (firstCategory.availableEvents && firstCategory.availableEvents.length > 0) {
//             setEventFilter(firstCategory.availableEvents[0].id);
//             setAvailableEvent(firstCategory.availableEvents[0]);
//           }
//         }
//       })
//       .catch((err) => console.log("Unable to fetch the categories", err));
//   }, []);

//   const handleEdit = (participant, college) => {
//     setSelectedParticipant(participant);
//     setSelectedCollege(college);
//     setShowEditModal(true);
//   };

//   const handleRemove = (id) => {
//     setParticipants(participants.filter((participant) => participant.id !== id));
//   };

//   const handleModalClose = () => {
//     setShowEditModal(false);
//     setSelectedParticipant(null);
//   };

//   const handleSaveChanges = () => {
//     setParticipants(participants.map((participant) => (participant.id === selectedParticipant.id ? selectedParticipant : participant)));

//     handleModalClose();
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSelectedParticipant({ ...selectedParticipant, [name]: value });
//   };

//   if (loading) {
//     return (
//       <Container className="mt-4 text-center">
//         <section className="dots-container">
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//           <div className="dot"></div>
//         </section>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="mt-4">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-4">
//       <h1 className="text-center mb-4">Event Participation List</h1>

//       {/* Dropdowns for filtering participants */}
//       <div className="mb-4 filter-dropdowns">
//         <Form.Select
//           className="category-dropdown"
//           value={categoryFilter}
//           onChange={(e) => {
//             const tmpSelectedCategory = categories?.find((c) => c?.name == e.target.value);
//             setCategoryFilter(e.target.value);
//             setSelectedCategory(tmpSelectedCategory);
//             setEventFilter(tmpSelectedCategory.availableEvents[0].id);
//           }}
//         >
//           {categories?.map((category, categoryIndex) => (
//             <option key={`category-${categoryIndex}`} value={category?.id}>
//               {category?.name}
//             </option>
//           ))}
//         </Form.Select>
//         <Form.Select
//           className="event-dropdown me-2"
//           value={eventFilter}
//           onChange={(e) => {
//             console.log("on available event change:", e.target.value);
//             setEventFilter(e.target.value);
//             const tmpAvailableEvent = selectedCategory.availableEvents((ele) => ele.id == e.target.value);
//             setAvailableEvent(tmpAvailableEvent);
//           }}
//         >
//           {categories?.map((category) => {
//             if (category.id == categoryFilter) {
//               return category?.availableEvents?.map((availableEvent, availableEventIndex) => (
//                 <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
//                   {availableEvent?.title}
//                 </option>
//               ));
//             }
//           })}
//         </Form.Select>
//       </div>

//       {loading && <Alert variant="info">Loading...</Alert>}
//       {/* {!loading && participants.length == 0 && <Alert variant="info">No participants!</Alert>} */}
//       {participants && participants.length > 0 && (
//         <div className="mb-5 pb-5">
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Participant Name</th>
//                 <th>ICCODE</th>
//                 <th>Group/Partcipant Id</th>
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
//                   category={categories.find((cat) => cat.id == availableEvent?.eventCategoryId)}
//                   index={index}
//                   availableEvent={availableEvent}
//                   participant={participant}
//                   handleEdit={handleEdit}
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
//                 <Form.Control type="text" name="icCode" value={selectedCollege?.icCode} onChange={handleInputChange} />
//               </Form.Group>
//               <Form.Group controlId="formEmail">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control type="email" name="email" value={selectedParticipant.email} onChange={handleInputChange} />
//               </Form.Group>
//               <Form.Group controlId="formEvent">
//                 <Form.Label>Whatsapp Number</Form.Label>
//                 <Form.Control type="text" name="event" value={selectedParticipant.whatsappNumber} onChange={handleInputChange} />
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
import { fetchParticipantsByEventId } from "../services/participants-api";
import { fetchEventByAvailableEventId } from "../services/event-apis";
import ParticipantRow from "../components/event-participation/ParticipantRow";

const EventParticipationPage = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvailableEvent, setAvailableEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [categories, setCategories] = useState([]);

  // Fetch participants when eventFilter changes
  useEffect(() => {
    if (eventFilter) {
      const fetchParticipants = async () => {
        try {
          setLoading(true);
          const event = await fetchEventByAvailableEventId(eventFilter);
          const participantsData = await fetchParticipantsByEventId(event.id);
          setParticipants(participantsData);
        } catch (err) {
          console.error("Error fetching participants:", err);
          setError("Failed to load participants.");
        } finally {
          setLoading(false);
        }
      };

      fetchParticipants();
    }
  }, [eventFilter]);

  // Fetch categories and initialize filters
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
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

  const handleEdit = (participant, college) => {
    setSelectedParticipant(participant);
    setSelectedCollege(college);
    setShowEditModal(true);
  };

  const handleRemove = (id) => {
    setParticipants(participants.filter((participant) => participant.id !== id));
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedParticipant(null);
  };

  const handleSaveChanges = () => {
    setParticipants((prev) => prev.map((participant) => (participant.id === selectedParticipant.id ? selectedParticipant : participant)));
    handleModalClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedParticipant((prev) => ({ ...prev, [name]: value }));
  };

  //   if (loading) {
  //     return (
  //       <Container className="mt-4 text-center">
  //         <section className="dots-container">
  //           <div className="dot"></div>
  //           <div className="dot"></div>
  //           <div className="dot"></div>
  //           <div className="dot"></div>
  //           <div className="dot"></div>
  //         </section>
  //       </Container>
  //     );
  //   }

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

      {/* Dropdowns for filtering participants */}
      <div className="mb-4 filter-dropdowns">
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
      </div>

      {participants.length > 0 && (
        <div className="mb-5 pb-5">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Participant Name</th>
                <th>ICCODE</th>
                <th>Group/Participant Id</th>
                <th>Email</th>
                <th>Category</th>
                <th>Event</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <ParticipantRow
                  key={participant.id}
                  category={categories.find((cat) => cat.id === selectedAvailableEvent?.eventCategoryId)}
                  index={index}
                  availableEvent={selectedAvailableEvent}
                  participant={participant}
                  handleEdit={handleEdit}
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
            <Form className="w-100">
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
            </Form>
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
