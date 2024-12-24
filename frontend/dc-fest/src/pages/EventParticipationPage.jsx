/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
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
import AddParticipantModal from "../components/event-participation/AddParticipantModal";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaDownload, FaPlus } from "react-icons/fa";
import { closeAvailableEvent, updateAvailableEvent } from "../services/available-events-apis";

import DisableTeamModal from "../components/event-participation/DisableTeamModal";
import { AuthContext } from "../providers/AuthProvider";


const EventParticipationPage = () => {
  const navigate = useNavigate();
  //   const [confirmParticipation, setConfirmParticipation] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refetchPop, setRefetchPop] = useState(false);
  const [collegeParticipation, setCollegeParticipation] = useState();
  const [selectedParticipant, setSelectedParticipant] = useState({
    name: "",
    email: "",
    whatsappNumber: "",
    present: false,
  });
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvailableEvent, setAvailableEvent] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableTeamModal, setShowDisableTeamModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pop, setPop] = useState();
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [group, setGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [newParticipant, setNewParticipant] = useState();
  const [showAddModal, setShowAddModal] = useState();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.type == "ADMIN" || !user?.type == "REGISTRATION_DESK") {
      navigate(-1);
    }
  }, [user, navigate]);

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
    if (filteredParticipants.length > 0) {
      getGroups(filteredParticipants);
    }
  }, [filteredParticipants]);

//   useEffect(() => {
//     if (selectedAvailableEvent && selectedCollege) {
//       fetchParticipationByCollegeIdAndAvailableEventId(selectedCollege.id, selectedAvailableEvent.id)
//         .then((data) => {
//           console.log("college_participation:", data);
//           setCollegeParticipation(data);
//         })
//         .catch((err) => console.log(err));
//     }
//   }, [selectedAvailableEvent, selectedCollege]);

  useEffect(() => {
    if (selectedCollege && participants.length > 0) {
      let roundIndex = 0;
      for (let i = 0; i < selectedAvailableEvent?.rounds.length; i++) {
        if (selectedAvailableEvent?.rounds[i].id == selectedRound?.id) {
          roundIndex = i;
          console.log("selectedRound:", selectedRound);
          break;
        }
        roundIndex += 1;
      }

      if (roundIndex == 0) {
        setFilteredParticipants(participants.filter((p) => p.collegeId == selectedCollege.id));
      } else {
        console.log("before", participants);
        setFilteredParticipants(participants.filter((p) => p.collegeId == selectedCollege.id && p.promotedRoundDtos.some((ele) => ele.roundId == selectedRound.id)));
      }
      setRefetchPop((prev) => !prev); // Set refetchPop to true to refetch the POP
    }
  }, [selectedCollege, participants, selectedRound]);

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
            setSelectedRound(firstEvent.rounds[0]);
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

  const getParticipants = async () => {
    console.log("eventFilter before going to trycatch:", eventFilter);
    try {
      setLoading(true);
      const event = await fetchEventByAvailableEventId(eventFilter);
      const response = await fetchParticipantsByEventId(event.id);
      console.log("participants:", response);
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

    const minParticipants = selectedAvailableEvent.eventRules.find((rule) => rule.eventRuleTemplate.name == "MIN_PARTICIPANTS").value;
    const toDeleteParticipant = filteredParticipants.find((p) => p.id == id);
    console.log("deleteParticipant:", toDeleteParticipant);
    console.log("minParticipants:", minParticipants);
    console.log("filteredParticipants:", filteredParticipants.filter((ele) => ele.type == "PERFORMER" && ele.group == toDeleteParticipant.group).length);
    if (toDeleteParticipant.type == "PERFORMER" && filteredParticipants.filter((ele) => ele.type == "PERFORMER" && ele.group == toDeleteParticipant.group).length <= minParticipants) {
      alert("Minimum participants required for this event is " + minParticipants);
      return;
    }

    try {
      console.log("deleting participant:", id);
      const response = await deleteParticipant(id);
      console.log("in delete:", response);
      //   await getParticipants();
      const newParticipants = participants.filter((p) => p.id != id);
      setParticipants(newParticipants);

      const newFilteredParticipants = filteredParticipants.filter((p) => p.id != id);
      setFilteredParticipants(newFilteredParticipants);
    } catch (error) {
      console.error("Something error", error);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedParticipant(null);
  };

  const handleSaveChanges = async () => {
    const updatedParticipant = selectedParticipant;
    try {
      const response = await updateParticipant(updatedParticipant);
      setFilteredParticipants((prev) => prev.map((participant) => (participant.id == updatedParticipant.id ? updatedParticipant : participant)));

      setParticipants((prev) => prev.map((participant) => (participant.id == updatedParticipant.id ? updatedParticipant : participant)));
    } catch (error) {
      alert("Oops! Unable to save the participant.");
      return;
    } finally {
      handleModalClose(); // Close the modal after saving changes
      setRefetchPop((prev) => !prev); // Set refetchPop to true to refetch the POP
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSelectedParticipant((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }
      return { ...prev, [name]: value };
    });
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

  const getTeams = () => {
    const tmpTeams = [];
    for (let i = 0, c = 0; i < participants.length; i++) {
      if (tmpTeams.includes(participants[i].group)) {
        continue;
      }
      tmpTeams.push(participants[i].collegeId);
    }

    return tmpTeams;
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const getGroups = (participants) => {
    console.log(participants);
    const groupsArr = [];
    for (let i = 0; i < participants.length; i++) {
      if (groupsArr.includes(participants[i].group)) {
        continue;
      }
      groupsArr.push(participants[i].group);
    }

    console.log("groupsArr:", groupsArr);

    setGroups(groupsArr);
    setGroup(groupsArr[0]);

    return groupsArr;
  };

  const handleAttendance = async (e, participant) => {
    const updatedParticipant = { ...participant, present: e.target.checked };
    try {
      const response = await updateParticipant(updatedParticipant);
      setFilteredParticipants((prev) => prev.map((p) => (p.id == updatedParticipant.id ? updatedParticipant : p)));
      setParticipants((prev) => prev.map((p) => (p.id == updatedParticipant.id ? updatedParticipant : p)));
      setRefetchPop((prev) => !prev);
    } catch (error) {
      alert("Oops! Unable to save the participant.");
    }
  };

  const handleNewParticipantChange = (e) => {
    const { name, value } = e.target;
    console.log(`in change, ${name}: ${value}`);
    setNewParticipant((prev) => {
      if (name == "male") {
        console.log({ ...prev, male: Boolean(value) });
        return { ...prev, male: Boolean(value) };
      }
      console.log({ ...prev, [name]: value });
      return { ...prev, [name]: value };
    });
  };

  const handleCloseRegistration = async (selectedAvailableEvent) => {
    const newAvailableEvent = { ...selectedAvailableEvent, closeRegistration: true };
    try {
      const response = await closeAvailableEvent(newAvailableEvent.id);
      console.log("closed reg, response:", response);
      setAvailableEvent(newAvailableEvent);
      alert("Registration closed successfully.");
    } catch (error) {
      alert("Oops! Unable to close the registration.");
    }
  };

  const handleDisableParticipation = async (collegeParticipationId, status) => {
    try {
      const response = await disableParticipation(collegeParticipationId, status);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container fluid className="mt-4">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }} className="btn btn-secondary">
        Go Back
      </button>
      <h1 className="text-center mb-4">Event Participation List</h1>
      {/* <p>
        Total Teams: {getTeams()?.length} /{" "}
        {Number(selectedAvailableEvent?.eventRules?.find((r) => r.eventRuleTemplate.name == "REGISTERED_SLOTS_AVAILABLE")?.value) +
          Number(selectedAvailableEvent?.eventRules?.find((r) => r.eventRuleTemplate.name == "OTSE_SLOTS")?.value)}
      </p> */}
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
              setSelectedRound(firstEvent.rounds[0]);
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
            setSelectedRound(tmpAvailableEvent.rounds[0]);
          }}
        >
          {selectedCategory?.availableEvents?.map((availableEvent, availableEventIndex) => (
            <option key={`availableEvent-${availableEventIndex}`} value={availableEvent.id}>
              {availableEvent.title}
            </option>
          ))}
        </Form.Select>

        {selectedAvailableEvent && selectedRound && (
          <Form.Select
            className="event-dropdown me-2"
            value={selectedRound?.id}
            onChange={(e) => {
              const round = selectedAvailableEvent.rounds.find((r) => r.id == e.target.value);
              console.log("round in change:", round);
              setSelectedRound(round);
            }}
          >
            {selectedAvailableEvent?.rounds?.map((round, roundIndex) => (
              <option key={`round-${roundIndex}`} value={round.id}>
                {round?.roundType}
              </option>
            ))}
          </Form.Select>
        )}

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
            <FaDownload /> Download
          </Button>
          <div>
            <Button
              variant="warning"
              onClick={() => {
                setShowAddModal(true);
              }}
            >
              <FaPlus /> Add More Participants
            </Button>
            <Button variant="info" onClick={() => setShowDisableTeamModal(true)}>
              Remove Team
            </Button>
            <Button variant="secondary" onClick={() => handleCloseRegistration(selectedAvailableEvent)} disabled={selectedAvailableEvent?.closeRegistration}>
              {selectedAvailableEvent?.closeRegistration ? "Closed" : "Close Registration?"}
            </Button>
          </div>
        </div>
      )}

      {filteredParticipants.length > 0 && (
        <div className="mb-5 pb-5">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Status</th>
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
              {/* without Aplhabetical sorted the participant names */}

              {/* {groups.map((grp) => {
                let tmpParticipants = filteredParticipants.filter((p) => p.group == grp);
                return tmpParticipants.map((participant, index) => (
                  <ParticipantRow
                    key={`${participant.id}`}
                    category={categories.find((cat) => cat.id === selectedAvailableEvent?.eventCategoryId)}
                    index={index}
                    availableEvent={selectedAvailableEvent}
                    participant={participant}
                    handleEdit={handleEdit}
                    handleRemove={handleRemove}
                    pop={pop}
                    group={group}
                  />
                ));
              })} */}

              {/* Alphabtical order of participant names */}
              {selectedRound &&
                groups.map((grp) => {
                  let tmpParticipants = filteredParticipants.filter((p) => p.group === grp).sort((a, b) => a.name.localeCompare(b.name)); // Sort by name in alphabetical order

                  return tmpParticipants.map((participant, index) => (
                    <ParticipantRow
                      key={`${participant.id}`}
                      collegeParticipation={collegeParticipation}
                      selectedRound={selectedRound}
                      category={categories.find((cat) => cat.id === selectedAvailableEvent?.eventCategoryId)}
                      index={index}
                      availableEvent={selectedAvailableEvent}
                      participant={participant}
                      handleEdit={handleEdit}
                      handleRemove={handleRemove}
                      filteredParticipants={filteredParticipants}
                      refetchPop={refetchPop}
                      handleAttendance={handleAttendance}
                      pop={pop}
                      group={grp} // Changed to use `grp` instead of `group` to match the map variable
                    />
                  ));
                })}
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
              <Form.Group controlId="formGender">
                <Form.Label>Gender</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="radio"
                    label="Male"
                    name="gender"
                    value="male"
                    checked={selectedParticipant.male === true}
                    onChange={() => setSelectedParticipant((prev) => ({ ...prev, male: true }))}
                  />
                  <Form.Check
                    type="radio"
                    label="Female"
                    name="gender"
                    value="female"
                    checked={selectedParticipant.male === false}
                    onChange={() => setSelectedParticipant((prev) => ({ ...prev, male: false }))}
                  />
                </div>
              </Form.Group>
              <Form.Group controlId="formEvent" className="d-flex align-items-center gap-2">
                <Form.Label>Attendance</Form.Label>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Form.Check type="checkbox" name="present" checked={selectedParticipant.present} onChange={handleInputChange} />
                  <p>{selectedParticipant.present ? "Present" : "Absent"}</p>
                  {console.log("selectedParticipant.present:", selectedParticipant.present)}
                </div>
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
      {selectedCollege && selectedAvailableEvent && groups && filteredParticipants && (
        <AddParticipantModal
          availableEvent={selectedAvailableEvent}
          handleInputChange={handleNewParticipantChange}
          handleModalClose={() => setShowAddModal(false)}
          newParticipant={newParticipant}
          setNewParticipant={setNewParticipant}
          setParticipants={setParticipants}
          filteredParticipants={filteredParticipants}
          setFilteredParticipants={setFilteredParticipants}
          participants={filteredParticipants.filter((p) => p.group == group)}
          setGroup={setGroup}
          group={group}
          selectedCollege={selectedCollege}
          show={showAddModal}
          groups={groups}
        />
      )}

      <DisableTeamModal showDisableTeamModal={showDisableTeamModal} handleModalClose={() => setShowDisableTeamModal(false)} participants={participants} setParticipants={setParticipants} filteredParticipants={filteredParticipants} setFilteredParticipants={setFilteredParticipants} />
    </Container>
  );
};

export default EventParticipationPage;
