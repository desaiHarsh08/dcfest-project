/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { Table, Container, Alert, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "../styles/EventParticipationPage.css"; // Import custom CSS
import { fetchCategories } from "../services/categories-api";
import {
  deleteParticipant,
  disableParticipation,
  fetchParticipantsByEventId,
  fetchParticipantsByEventIdAndCollegeId,
  updateParticipant,
} from "../services/participants-api";
import { fetchEventByAvailableEventId } from "../services/event-apis";
import ParticipantRow from "../components/event-participation/ParticipantRow";
import {
  fetchColleges,
  fetchCollegesByAvailableEventIdAndRoundId,
  fetchCollegesByAvailableEventIdEnabledParticipants,
} from "../services/college-apis";
import * as XLSX from "xlsx";
import { generateQrcode, getPop } from "../services/attendance-apis";
import AddParticipantModal from "../components/event-participation/AddParticipantModal";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaDownload, FaPlus } from "react-icons/fa";
import {
  closeAvailableEvent,
  toggleAvailableEventRegistration,
  updateAvailableEvent,
} from "../services/available-events-apis";

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
//   const [pop, setPop] = useState();
const [pop, setPop] = useState({}); // Changed: object keyed by group
const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [group, setGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [newParticipant, setNewParticipant] = useState();
  const [showAddModal, setShowAddModal] = useState();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (
      user?.type == "ATTENDANCE_DESK" ||
      user?.type == "SCORE_SHEET_DESK" ||
      user?.type == "SCORE_ENTRY_DESK"
    ) {
      navigate(-1);
    }
  }, [user, navigate]);

  // Fetch participants when eventFilter or selectedCollege changes
  useEffect(() => {
    if (eventFilter && selectedCollege) {
      console.log(
        "Fetching participants for selectedCollege:",
        selectedCollege
      );
      console.log(
        "Event filter:",
        eventFilter,
        "College ID:",
        selectedCollege.id
      );
      // Clear previous participants before fetching new ones to avoid stale data
      setParticipants([]);
      setFilteredParticipants([]);
      getParticipants();
    } else {
      // Clear participants if no event or college is selected
      console.log(
        "Clearing participants - eventFilter or selectedCollege missing"
      );
      setParticipants([]);
      setFilteredParticipants([]);
    }
  }, [eventFilter, selectedCollege]);

  useEffect(() => {
    if (!selectedCollege) {
      fetchColleges()
        .then((data) => {
          console.log("Fetched colleges:", data);
          setColleges(data);
          // Use the first college instead of hardcoded id 27
          if (data.length > 0) {
            console.log("Setting first college as selected:", data[0]);
            setSelectedCollege(data[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  //   useEffect(() => {}, [pop]);

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
    console.log("=== Filtering participants ===");
    console.log("selectedCollege:", selectedCollege);
    console.log("selectedCollege ID:", selectedCollege?.id);
    console.log("participants.length:", participants.length);
    console.log("selectedRound:", selectedRound);

    if (participants.length > 0) {
      console.log(
        "All participant college IDs:",
        participants.map((p) => ({
          id: p.id,
          name: p.participantName || p.name,
          collegeId: p.collegeId,
          collegeIdType: typeof p.collegeId,
          entryType: p.entryType,
          quotaType: p.quotaType,
        }))
      );
    } else {
      console.log("No participants found in participants array");
    }

    // Since we're now using college-specific endpoint, all participants should already belong to selectedCollege
    // We only need to filter by round, not by college
    if (selectedCollege && participants.length >= 0) {
      console.log("=== Starting filter process ===");
      console.log(
        "Selected college:",
        selectedCollege.name,
        "ID:",
        selectedCollege.id,
        "Type:",
        typeof selectedCollege.id
      );
      console.log("Total participants before filter:", participants.length);

      let roundIndex = 0;
      for (let i = 0; i < selectedAvailableEvent?.rounds.length; i++) {
        if (selectedAvailableEvent?.rounds[i].id == selectedRound?.id) {
          roundIndex = i;
          console.log("Found round at index:", roundIndex);
          break;
        }
        roundIndex += 1;
      }

      if (roundIndex == 0) {
        // For round 0, all participants from the college-specific endpoint should be shown
        // No need to filter by college since backend already did that
        console.log(
          "Round 0 - showing all participants (already filtered by college in backend)"
        );
        const waitingListInFiltered = participants.filter(
          (p) =>
            p.entryType === "WAITING_LIST" ||
            p.quotaType === "WAITING_LIST_QUOTA"
        );
        console.log("Waiting list participants:", waitingListInFiltered.length);
        setFilteredParticipants(participants);
      } else {
        // For non-zero rounds, filter by promotion status
        const filtered = participants.filter((p) => {
          // If promotedRoundDtos is null/undefined/empty, exclude participant (they haven't been promoted to this round)
          if (!p.promotedRoundDtos || p.promotedRoundDtos.length === 0) {
            return false;
          }
          // Check if participant was promoted to this round
          return p.promotedRoundDtos.some(
            (ele) => ele.roundId == selectedRound.id
          );
        });
        console.log(
          "Filtered participants (round " + roundIndex + "):",
          filtered.length
        );
        // Log waiting list participants in filtered results
        const waitingListInFiltered = filtered.filter(
          (p) =>
            p.entryType === "WAITING_LIST" ||
            p.quotaType === "WAITING_LIST_QUOTA"
        );
        console.log(
          "Waiting list participants in filtered (round " + roundIndex + "):",
          waitingListInFiltered.length
        );
        setFilteredParticipants(filtered);
      }
      setRefetchPop((prev) => !prev); // Set refetchPop to true to refetch the POP
    } else if (selectedCollege && participants.length === 0) {
      // No participants found - set empty array
      console.log("No participants found for selected college");
      setFilteredParticipants([]);
    }
  }, [selectedCollege, participants, selectedRound, selectedAvailableEvent]);

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
            // Don't set selectedCollege here - it will be set after colleges load
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

  useEffect(() => {
    if (
      selectedAvailableEvent &&
      selectedAvailableEvent.rounds.length > 1 &&
      selectedAvailableEvent.rounds.find((r) => r.id == selectedRound.id)
        ?.roundType !== "PRELIMINARY" &&
      selectedRound
    ) {
      fetchCollegesByAvailableEventIdAndRoundId(
        selectedAvailableEvent.id,
        selectedRound.id
      ).then((data) => {
        console.log(
          "fetchCollegesByAvailableEventIdAndRoundId(), selectedAvailableEvent:",
          selectedAvailableEvent
        );
        console.log(
          "fetchCollegesByAvailableEventIdAndRoundId(), ",
          data,
          selectedAvailableEvent,
          selectedRound
        );
        setColleges(data);
        setSelectedCollege(data[0]);
      });
    } else if (selectedAvailableEvent) {
      fetchCollegesByAvailableEventIdEnabledParticipants(
        selectedAvailableEvent.id
      ).then((data) => {
        setColleges(data);
        setSelectedCollege(data[0] || null);
      });
    }
  }, [selectedAvailableEvent, selectedRound]);

  //   useEffect(() => {})

  const getParticipants = async () => {
    console.log("=== getParticipants called ===");
    console.log("eventFilter:", eventFilter);
    console.log("selectedCollege:", selectedCollege);
    try {
      setLoading(true);
      const event = await fetchEventByAvailableEventId(eventFilter);
      console.log("Fetched event:", event);
      console.log("Event ID:", event?.id);
      console.log("Event availableEventId:", event?.availableEventId);
      console.log("Event eventName:", event?.eventName);

      if (!event || !event.id) {
        console.error("Event or event.id is null/undefined!");
        setParticipants([]);
        return;
      }

      // Use college-specific endpoint when college is selected for more accurate results
      let response;
      if (selectedCollege && selectedCollege.id) {
        console.log(
          `Fetching participants for event ${event.id} and college ${selectedCollege.id}`
        );
        response = await fetchParticipantsByEventIdAndCollegeId(
          event.id,
          selectedCollege.id
        );
        console.log(
          `Fetched ${response.length} participants for college ${selectedCollege.id}`
        );
      } else {
        // Fallback to fetching all participants if no college is selected
        console.log(`Fetching all participants for event ${event.id}`);
        response = await fetchParticipantsByEventId(event.id);
        console.log(`Fetched ${response.length} total participants for event`);
      }

      console.log("Participants:", response);

      // Log individual participant details if any exist
      if (response.length > 0) {
        console.log("First participant:", response[0]);
        console.log(
          "Participant college IDs:",
          response.map((p) => p.collegeId)
        );
        // Log entry types and quota types to debug waiting list participants
        console.log(
          "Participant entry types:",
          response.map((p) => ({
            id: p.id,
            name: p.participantName || p.name,
            entryType: p.entryType,
            quotaType: p.quotaType,
          }))
        );
        // Check for waiting list participants
        const waitingListParticipants = response.filter(
          (p) =>
            p.entryType === "WAITING_LIST" ||
            p.quotaType === "WAITING_LIST_QUOTA"
        );
        console.log(
          "Waiting list participants found:",
          waitingListParticipants.length
        );
        if (waitingListParticipants.length > 0) {
          console.log("Waiting list participants:", waitingListParticipants);
        }
      } else {
        console.log(
          "No participants found for this event and college combination"
        );
      }

      setParticipants(response);
      // Don't override selectedCollege here - it's already set
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError("Failed to load participants.");
      setParticipants([]);
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
    const isConfirm = confirm(
      "Are you sure you want to delete this participant."
    );
    if (!isConfirm) {
      return;
    }

    const minParticipants = selectedAvailableEvent.eventRules.find(
      (rule) => rule.eventRuleTemplate.name == "MIN_PARTICIPANTS"
    ).value;
    const toDeleteParticipant = filteredParticipants.find((p) => p.id == id);
    console.log("deleteParticipant:", toDeleteParticipant);
    console.log("minParticipants:", minParticipants);
    console.log(
      "filteredParticipants:",
      filteredParticipants.filter(
        (ele) =>
          ele.type == "PERFORMER" && ele.group == toDeleteParticipant.group
      ).length
    );
    if (
      toDeleteParticipant.type == "PERFORMER" &&
      filteredParticipants.filter(
        (ele) =>
          ele.type == "PERFORMER" && ele.group == toDeleteParticipant.group
      ).length <= minParticipants
    ) {
      alert(
        "Minimum participants required for this event is " + minParticipants
      );
      return;
    }

    try {
      console.log("deleting participant:", id);
      const response = await deleteParticipant(id);
      console.log("in delete:", response);
      //   await getParticipants();
      const newParticipants = participants.filter((p) => p.id != id);
      setParticipants(newParticipants);

      const newFilteredParticipants = filteredParticipants.filter(
        (p) => p.id != id
      );
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
      setFilteredParticipants((prev) =>
        prev.map((participant) =>
          participant.id == updatedParticipant.id
            ? updatedParticipant
            : participant
        )
      );

      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id == updatedParticipant.id
            ? updatedParticipant
            : participant
        )
      );
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
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `${selectedAvailableEvent?.slug}-participants.xlsx`
    );
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
      setFilteredParticipants((prev) =>
        prev.map((p) =>
          p.id == updatedParticipant.id ? updatedParticipant : p
        )
      );
      setParticipants((prev) =>
        prev.map((p) =>
          p.id == updatedParticipant.id ? updatedParticipant : p
        )
      );
      setRefetchPop((prev) => !prev);
    } catch (error) {
      alert("Oops! Unable to save the participant.");
    }
  };

//   useEffect(() => {
//     setPop(null);
//     setRefetchPop((prev) => !prev);
//   }, [selectedCollege, selectedCategory, selectedAvailableEvent, selectedRound]);

useEffect(() => {
    setPop({}); // Clear all group PDFs
    setRefetchPop((prev) => !prev);
  }, [selectedCollege, selectedCategory, selectedAvailableEvent, selectedRound]);

  // In EventParticipationPage (new useEffect)
useEffect(() => {
    if (!selectedCollege || !selectedAvailableEvent || !selectedRound || groups.length === 0) return;
  
    const fetchAllGroupPops = async () => {
      for (const grp of groups) {
        // Find a participant in this group to pass (any will do)
        const sampleParticipant = filteredParticipants.find(p => p.group === grp);
        if (!sampleParticipant?.collegeId) continue;
  
        // Reuse fetchPop logic (you could extract it to a util)
        try {
          const college = colleges.find(c => c.id === sampleParticipant.collegeId);
          const response = await getPop(college.id, selectedAvailableEvent.id, selectedRound.id, grp);
          setPop(prev => ({ ...prev, [grp]: response }));
        } catch (error) {
          console.log(`Failed to fetch POP for group ${grp}:`, error);
          setPop(prev => ({ ...prev, [grp]: null }));
        }
      }
    };
  
    fetchAllGroupPops();
  }, [groups, selectedCollege, selectedAvailableEvent, selectedRound, refetchPop]); // Trigger on groups change

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
    const newAvailableEvent = {
      ...selectedAvailableEvent,
      closeRegistration: !selectedAvailableEvent.closeRegistration,
    };

    try {
      // const eventResponse = await fetchEventByAvailableEventId(
      //     selectedAvailableEvent.id
      //   );

      const response = await toggleAvailableEventRegistration(
        selectedAvailableEvent.id
      );
      console.log("closed reg, response:", response);
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      setSelectedCategory(
        categoriesData.find((c) => c.id == selectedCategory.id)
      );
      setAvailableEvent(newAvailableEvent);
      alert("Registration closed successfully.");
    } catch (error) {
      alert("Oops! Unable to close the registration.");
    }
  };

  const handleDisableParticipation = async (
    collegeParticipationId,
    status,
    tmpParticipants
  ) => {
    try {
      const eventResponse = await fetchEventByAvailableEventId(
        selectedAvailableEvent.id
      );

      const response = await disableParticipation(
        collegeParticipationId,
        eventResponse?.id,
        status
      );

      if (response) {
        const participantIds = new Set(tmpParticipants.map((p) => p.id));

        setFilteredParticipants((prev) =>
          prev.map((p) =>
            participantIds.has(p.id)
              ? { ...p, disableParticipation: status }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Disable participation failed:", error);
    }
  };

  const isGroupConfirmed = !!pop[group];


  return (
    <Container fluid className="mt-4">
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: "1rem" }}
        className="btn btn-secondary"
      >
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
            const tmpSelectedCategory = categories.find(
              (c) => c.id == e.target.value
            );
            setCategoryFilter(e.target.value);
            setSelectedCategory(tmpSelectedCategory);
            if (tmpSelectedCategory) {
              const firstEvent = tmpSelectedCategory.availableEvents[0];
              setEventFilter(firstEvent.id);
              setAvailableEvent(firstEvent);
              // Keep the current selected college or use the first one
              if (!selectedCollege && colleges.length > 0) {
                setSelectedCollege(colleges[0]);
              }
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

            const tmpAvailableEvent = selectedCategory?.availableEvents?.find(
              (ele) => ele.id == e.target.value
            );
            setAvailableEvent(tmpAvailableEvent);
            // Keep the current selected college or use the first one
            if (!selectedCollege && colleges.length > 0) {
              setSelectedCollege(colleges[0]);
            }
            setSelectedRound(tmpAvailableEvent.rounds[0]);
          }}
        >
          {selectedCategory?.availableEvents?.map(
            (availableEvent, availableEventIndex) => (
              <option
                key={`availableEvent-${availableEventIndex}`}
                value={availableEvent.id}
              >
                {availableEvent.title}
              </option>
            )
          )}
        </Form.Select>

        {selectedAvailableEvent && selectedRound && (
          <Form.Select
            className="event-dropdown me-2"
            value={selectedRound?.id}
            onChange={(e) => {
              const round = selectedAvailableEvent.rounds.find(
                (r) => r.id == e.target.value
              );
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

        {selectedCollege && colleges.length > 0 && (
          <Form.Select
            className="event-dropdown me-2"
            value={selectedCollege.id}
            onChange={(e) => {
              // Handle both string and number IDs
              const selectedValue = e.target.value;
              const tmpCollege = colleges.find(
                (c) =>
                  String(c.id) === String(selectedValue) ||
                  Number(c.id) === Number(selectedValue)
              );
              console.log(
                "College dropdown changed - selected value:",
                selectedValue,
                "found college:",
                tmpCollege
              );
              if (tmpCollege) {
                setSelectedCollege(tmpCollege);
              } else {
                console.error(
                  "College not found for value:",
                  selectedValue,
                  "Available colleges:",
                  colleges.map((c) => ({ id: c.id, name: c.name }))
                );
              }
            }}
          >
            {colleges?.map((college, collegeIndex) => {
              const participantCount = participants.filter(
                (p) => p.collegeId == college.id
              ).length;
              return (
                <option key={`college-${collegeIndex}`} value={college.id}>
                  {college.icCode} - {college?.name}
                </option>
              );
            })}
          </Form.Select>
        )}
      </div>

      {/* Show message when no participants exist */}
      {!loading &&
        participants.length === 0 &&
        eventFilter &&
        selectedCollege && (
          <div className="alert alert-info mt-3">
            <strong>No participants registered</strong> for this event yet. Use
            &quot;Add More Participants&quot; button to add participants.
          </div>
        )}

      {/* Action buttons - show when event and college are selected */}
      {eventFilter && selectedCollege && selectedAvailableEvent && (
        <div className="d-flex justify-content-between mt-3 mb-3">
          <Button
            variant="success"
            disabled={colleges.length == 0 || filteredParticipants.length == 0}
            onClick={handleDownload}
          >
            <FaDownload /> Download
          </Button>
          <div>
            <Button
              variant="warning"
            //   onClick={() => {
            //     console.log("pop:", pop);
            //     if (!pop) {
            //       setShowAddModal(true);
            //     }
            //   }}
            //   disabled={pop}
            onClick={() => setShowAddModal(true)}
  disabled={!groups.some(grp => pop[grp] == null)}
            >
              <FaPlus /> Add More Participants 
              {/* pop_obj: {JSON.stringify(pop)} | groups: {JSON.stringify(groups)} */}
            </Button>
            {filteredParticipants.length > 0 && (
              <>
                <Button
                  variant="info"
                  onClick={() => setShowDisableTeamModal(true)}
                  className="ms-2"
                >
                  Remove Team
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    handleCloseRegistration(selectedAvailableEvent)
                  }
                  disabled={selectedAvailableEvent?.closeRegistration}
                  className="ms-2"
                >
                  {selectedAvailableEvent?.closeRegistration
                    ? "Closed"
                    : "Close Registration?"}
                </Button>
              </>
            )}
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
                  let tmpParticipants = filteredParticipants
                    .filter((p) => p.group === grp)
                    .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name in alphabetical order

                  return tmpParticipants.map((participant, index) => (
                    <ParticipantRow
                      key={`${participant.id}`}
                      collegeParticipation={collegeParticipation}
                      selectedRound={selectedRound}
                      category={categories.find(
                        (cat) =>
                          cat.id === selectedAvailableEvent?.eventCategoryId
                      )}
                      index={index}
                      availableEvent={selectedAvailableEvent}
                      participant={participant}
                      handleEdit={handleEdit}
                      tmpParticipants={tmpParticipants}
                      handleDisableParticipation={handleDisableParticipation}
                      handleRemove={handleRemove}
                      filteredParticipants={filteredParticipants}
                      refetchPop={refetchPop}
                      handleAttendance={handleAttendance}
                      pop={pop}
                      setPop={setPop}
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
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedParticipant.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formCollege">
                <Form.Label>ICCODE</Form.Label>
                <Form.Control
                  type="text"
                  name="icCode"
                  value={selectedCollege?.icCode || ""}
                  style={{ backgroundColor: "aliceblue" }}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedParticipant.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEvent">
                <Form.Label>Whatsapp Number</Form.Label>
                <Form.Control
                  type="text"
                  name="whatsappNumber"
                  value={selectedParticipant.whatsappNumber || ""}
                  onChange={handleInputChange}
                />
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
                    onChange={() =>
                      setSelectedParticipant((prev) => ({
                        ...prev,
                        male: true,
                      }))
                    }
                  />
                  <Form.Check
                    type="radio"
                    label="Female"
                    name="gender"
                    value="female"
                    checked={selectedParticipant.male === false}
                    onChange={() =>
                      setSelectedParticipant((prev) => ({
                        ...prev,
                        male: false,
                      }))
                    }
                  />
                </div>
              </Form.Group>
              <Form.Group
                controlId="formEvent"
                className="d-flex align-items-center gap-2"
              >
                <Form.Label>Attendance</Form.Label>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Form.Check
                    type="checkbox"
                    name="present"
                    checked={selectedParticipant.present}
                    onChange={handleInputChange}
                  />
                  <p>{selectedParticipant.present ? "Present" : "Absent"}</p>
                  {console.log(
                    "selectedParticipant.present:",
                    selectedParticipant.present
                  )}
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
      {selectedCollege &&
        selectedAvailableEvent &&
        selectedRound && pop &&
        filteredParticipants && groups.length > 0 && (
          <AddParticipantModal
          key={`${groups}`}
            availableEvent={selectedAvailableEvent}
            handleInputChange={handleNewParticipantChange}
            handleModalClose={() => setShowAddModal(false)}
            getParticipants={getParticipants}
            newParticipant={newParticipant}
            setNewParticipant={setNewParticipant}
            setParticipants={setParticipants}
            filteredParticipants={filteredParticipants}
            setFilteredParticipants={setFilteredParticipants}
            participants={filteredParticipants.filter((p) => p.group == group)}
            setGroup={setGroup}
            group={groups.find(grp => pop[grp] == null) ? group : groups[0]}
            selectedCollege={selectedCollege}
            show={showAddModal}
            groups={pop ? groups.filter(grp => pop[grp] == null) : groups}
            pop={pop}
          />
        )}

      {selectedAvailableEvent && (
        <DisableTeamModal
          selectedAvailableEvent={selectedAvailableEvent}
          showDisableTeamModal={showDisableTeamModal}
          handleModalClose={() => setShowDisableTeamModal(false)}
          participants={participants}
          setParticipants={setParticipants}
          filteredParticipants={filteredParticipants}
          setFilteredParticipants={setFilteredParticipants}
        />
      )}
    </Container>
  );
};

export default EventParticipationPage;
