/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Badge } from "react-bootstrap";
import styles from "../../styles/EventCard.module.css"; // Import your custom styles
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { deleteParticipation, doParticipate, fetchParticipationEventsByCollegeId, fetchParticipationsByAvailableEventId } from "../../services/college-participation-apis";
import { fetchWaitingListSlotsOccupiedByAvailableEvent, fetchOtsesSlotsOccupiedByAvailableEvent } from "../../services/participants-api";
import { fetchRegistrationDeadlineStatus } from "../../services/academic-year-apis";
import { subscribeToQuotaUpdates, subscribeToParticipantAdded, subscribeToParticipantRemoved, subscribeToWaitingListPromotion, subscribeToRegistrationStatus } from "../../services/websocketService";
import { FaCheckCircle, FaSpinner, FaEye } from "react-icons/fa";

const EventCard = ({ event, college }) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [participation, setParticipation] = useState([]);
  const [flag, setFlag] = useState(false);
  const [slotsOccupied, setSlotsOccupied] = useState(null);
  const [waitingListSlotsOccupied, setWaitingListSlotsOccupied] = useState(null);
  const [otseSlotsOccupied, setOtseSlotsOccupied] = useState(null);
  const [isDeadlineClosed, setIsDeadlineClosed] = useState(false);

  useEffect(() => {
    if (college?.id) {
      getParticipationByCollegeId(college.id);
    }
  }, [college, flag, isLoading]);

  const getParticipationByCollegeId = async (collegeId) => {
    try {
      const response = await fetchParticipationEventsByCollegeId(collegeId);
      setParticipation(response);
    } catch (error) {
      alert("Unable to fetch the participation details!");
      console.log(error);
    }
  };

  // Function to truncate the description to a set word limit
  const truncateDescription = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  const fetchSlotsOccupied = async (availableEventId) => {
    try {
      console.log("here fetching");
      const response = await fetchParticipationsByAvailableEventId(availableEventId);
      console.log("response:", event?.title, response.length);
      setSlotsOccupied(response.length);

      // Debug: Log the event rules
      const maxSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate.name === "REGISTERED_SLOTS_AVAILABLE")?.value;
      console.log(`${event?.title} - Slots: ${response.length}/${maxSlots}, closeRegistration: ${event?.closeRegistration}`);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch the details!");
    }
  };

  const fetchWaitingListSlotsOccupied = async (availableEventId) => {
    try {
      if (!availableEventId) return;
      const response = await fetchWaitingListSlotsOccupiedByAvailableEvent(availableEventId);
      setWaitingListSlotsOccupied(response);
    } catch (error) {
      console.log("Error fetching waiting list slots:", error);
      setWaitingListSlotsOccupied(0);
    }
  };

  const fetchOtsesSlotsOccupied = async (availableEventId) => {
    try {
      if (!availableEventId) return;
      const response = await fetchOtsesSlotsOccupiedByAvailableEvent(availableEventId);
      setOtseSlotsOccupied(response);
    } catch (error) {
      console.log("Error fetching OTSE slots:", error);
      setOtseSlotsOccupied(0);
    }
  };

  const fetchDeadlineStatus = async () => {
    try {
      const response = await fetchRegistrationDeadlineStatus();
      // Registration is closed if it's not open (checks both startDate and endDate)
      setIsDeadlineClosed(!response.isRegistrationOpen || false);
    } catch (error) {
      console.log("Error fetching registration deadline status:", error);
      // If API fails, assume deadline is closed for safety
      setIsDeadlineClosed(true);
    }
  };

  const handleCollegeRegister = async () => {
    // if (new Date() > new Date("2025-12-11T14:00:00")) {
    //     alert('Registration for the event is closed. Please contact us at dean.office@thebges.edu.in for any further information.')
    //   return;
    // }
    setIsLoading(true);
    try {
      await doParticipate({
        collegeId: user?.id,
        availableEventId: event?.id,
      });
      alert("Participation done successfully!");
      // Refresh participation list and slots
      setFlag((prev) => !prev);
      // Small delay to ensure backend has processed the registration
      setTimeout(() => {
        // Refresh waiting list slots if event has waiting list quota
        const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList && event?.id) {
          fetchWaitingListSlotsOccupied(event.id);
        }
        // Refresh OTSE slots if event has OTSE quota
        const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
        if (hasOtses && event?.id) {
          fetchOtsesSlotsOccupied(event.id);
        }
        // Refresh regular slots
        if (event?.id) {
          fetchSlotsOccupied(event.id);
        }
      }, 500);
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (event?.id) {
      fetchSlotsOccupied(event.id);
      // Fetch waiting list slots if event has waiting list quota
      const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
      if (hasWaitingList) {
        fetchWaitingListSlotsOccupied(event.id);
      }
      // Fetch OTSE slots if event has OTSE quota
      const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
      if (hasOtses) {
        fetchOtsesSlotsOccupied(event.id);
      }
    }
    // Fetch deadline status for college users
    if (user?.type === "COLLEGE_REPRESENTATIVE") {
      fetchDeadlineStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, flag, participation, user]);

  // Subscribe to real-time registration status updates for college users
  useEffect(() => {
    if (user?.type !== "COLLEGE_REPRESENTATIVE") return;

    console.log("📡 Setting up registration status WebSocket listener");

    const registrationStatusSubscription = subscribeToRegistrationStatus((data) => {
      console.log("📨 Registration status update received:", data);
      // Update the deadline closed status based on isRegistrationOpen
      setIsDeadlineClosed(!data.isRegistrationOpen);
    });

    return () => {
      if (registrationStatusSubscription?.unsubscribe) {
        registrationStatusSubscription.unsubscribe();
      }
    };
  }, [user?.type]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!event?.id) return;

    console.log("📡 Setting up WebSocket listeners for event:", event.id, event.title);

    // Subscribe to quota updates
    const quotaSubscription = subscribeToQuotaUpdates(event.id, (data) => {
      console.log("📨 Raw quota update data:", data, "Event ID:", event.id, "Type check:", typeof data.availableEventId, typeof event.id);
      // Handle both string and number comparisons
      const eventIdMatch = data.availableEventId == event.id || String(data.availableEventId) === String(event.id) || Number(data.availableEventId) === Number(event.id);

      if (eventIdMatch) {
        console.log("✅ Quota update matches! Updating UI...", {
          slotsOccupied: data.slotsOccupied,
          waitingListSlotsOccupied: data.waitingListSlotsOccupied,
        });
        setSlotsOccupied(data.slotsOccupied);
        setWaitingListSlotsOccupied(data.waitingListSlotsOccupied);
        // Refresh participation list to update "Enrolled" button status
        if (college?.id) {
          getParticipationByCollegeId(college.id);
        }
      } else {
        console.log("⏭️ Quota update for different event, ignoring. Expected:", event.id, "Got:", data.availableEventId);
      }
    });

    // Subscribe to participant added
    const participantAddedSubscription = subscribeToParticipantAdded(event.id, (data) => {
      if (data.availableEventId === event.id) {
        console.log("✅ Participant added:", data);
        // Refresh slots
        fetchSlotsOccupied(event.id);
        const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList) {
          fetchWaitingListSlotsOccupied(event.id);
        }
        const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
        if (hasOtses) {
          fetchOtsesSlotsOccupied(event.id);
        }
        // Refresh participation list
        if (college?.id) {
          getParticipationByCollegeId(college.id);
        }
      }
    });

    // Subscribe to participant removed
    const participantRemovedSubscription = subscribeToParticipantRemoved(event.id, (data) => {
      if (data.availableEventId === event.id) {
        console.log("✅ Participant removed:", data);
        // Refresh slots
        fetchSlotsOccupied(event.id);
        const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList) {
          fetchWaitingListSlotsOccupied(event.id);
        }
        const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
        if (hasOtses) {
          fetchOtsesSlotsOccupied(event.id);
        }
        // Refresh participation list
        if (college?.id) {
          getParticipationByCollegeId(college.id);
        }
      }
    });

    // Subscribe to waiting list promotion
    const waitingListPromotionSubscription = subscribeToWaitingListPromotion(event.id, (data) => {
      if (data.availableEventId === event.id) {
        console.log("✅ Waiting list promotion:", data);
        // Refresh slots
        fetchSlotsOccupied(event.id);
        const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList) {
          fetchWaitingListSlotsOccupied(event.id);
        }
        const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
        if (hasOtses) {
          fetchOtsesSlotsOccupied(event.id);
        }
        // Refresh participation list
        if (college?.id) {
          getParticipationByCollegeId(college.id);
        }
      }
    });

    return () => {
      // Unsubscribe from all subscriptions
      if (quotaSubscription) quotaSubscription.unsubscribe();
      if (participantAddedSubscription) participantAddedSubscription.unsubscribe();
      if (participantRemovedSubscription) participantRemovedSubscription.unsubscribe();
      if (waitingListPromotionSubscription) waitingListPromotionSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  const handleDeleteParticipation = async (participationId) => {
    // if (new Date() > new Date("2025-12-11T14:00:00")) {
    //     alert('Registration for the event is closed. Please contact us at dean.office@thebges.edu.in for any further information.')
    //   return;
    // }

    let isConfirmed = confirm(`Are you sure that you want to remove your college's participation for "${event?.title}"?`);
    if (!isConfirmed) {
      return;
    }
    setIsLoading(true);
    try {
      await deleteParticipation(participationId);
      console.log("Removed the participation successfully");
      // Trigger refresh of participation list and slots
      setFlag((prev) => !prev);
      if (event?.id) {
        fetchSlotsOccupied(event.id);
        // Refresh waiting list slots if event has waiting list quota
        const hasWaitingList = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS");
        if (hasWaitingList) {
          fetchWaitingListSlotsOccupied(event.id);
        }
        // Refresh OTSE slots if event has OTSE quota
        const hasOtses = event?.eventRules?.some((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS");
        if (hasOtses) {
          fetchOtsesSlotsOccupied(event.id);
        }
      }
      alert("Participation removed successfully!");
    } catch (error) {
      console.log("Error deleting participation:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong... Please try again later!";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    event && (
      <Col xs={12} sm={6} md={4} lg={user.type === "ADMIN" ? 4 : 3} className="mb-4">
        <Card className={`h-100 shadow-sm ${styles.eventCard} border-0`}>
          <div className={`${styles.imageContainer} overflow-hidden`}>
            <Card.Img
              variant="top"
              src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}/${event.slug}.jpg`}
              alt={event.title}
              className={`img-fluid rounded-top ${styles.cardImage}`}
              style={{ height: "200px", objectFit: "cover" }}
            />
          </div>
          <Card.Body className="d-flex flex-column p-4">
            <Card.Title className={`fs-5 text-center fw-bold ${styles.cardTitle}`}>{event.title}</Card.Title>
            <div className="mb-3 d-flex justify-content-center align-items-center flex-column" style={{ minHeight: user.type === "ADMIN" ? "auto" : "48px" }}>
              {(() => {
                const maxSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate?.name === "REGISTERED_SLOTS_AVAILABLE")?.value;
                // If waiting list rule is not present, treat it as 0 slots
                const waitingListSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS")?.value || "0";
                const vacantSlots = maxSlots && slotsOccupied !== null ? parseInt(maxSlots) - slotsOccupied : null;
                const isRegistrationFull = vacantSlots !== null && vacantSlots <= 0;
                const vacantWaitingListSlots = waitingListSlots && waitingListSlotsOccupied !== null ? parseInt(waitingListSlots) - waitingListSlotsOccupied : null;
                const hasWaitingListAvailable = isRegistrationFull && vacantWaitingListSlots !== null && vacantWaitingListSlots > 0;

                // For admin: show three-column table with Reg. Quota, Waiting Quota, and OTSE Quota
                if (user.type === "ADMIN") {
                  const otseSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate?.name === "OTSE_SLOTS")?.value;

                  // Reg. Quota
                  const maxRegSlots = maxSlots ? parseInt(maxSlots) : 0;
                  const vacantRegSlots = maxRegSlots > 0 && slotsOccupied !== null ? maxRegSlots - slotsOccupied : 0;

                  // Waiting Quota
                  const maxWaitingListSlots = waitingListSlots ? parseInt(waitingListSlots) : 0;
                  const vacantWaitingListSlots =
                    maxWaitingListSlots > 0 && waitingListSlotsOccupied !== null ? maxWaitingListSlots - waitingListSlotsOccupied : maxWaitingListSlots > 0 ? maxWaitingListSlots : 0;

                  // OTSE Quota
                  const maxOtsesSlots = otseSlots ? parseInt(otseSlots) : 0;
                  const vacantOtsesSlots = maxOtsesSlots > 0 && otseSlotsOccupied !== null ? maxOtsesSlots - otseSlotsOccupied : maxOtsesSlots > 0 ? maxOtsesSlots : 0;

                  // Total quota sum
                  const totalQuotaSum = maxRegSlots + maxWaitingListSlots + maxOtsesSlots;

                  return (
                    <>
                      <div className="w-100" style={{ marginTop: "12px", marginBottom: "12px" }}>
                        <table className="mb-0" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", tableLayout: "fixed" }}>
                          <thead>
                            <tr>
                              <th
                                style={{
                                  padding: "8px 4px",
                                  backgroundColor: "#ffe0e0",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "6px 0 0 0",
                                  whiteSpace: "nowrap",
                                  width: "20%",
                                }}
                              >
                                Slots
                              </th>
                              <th
                                style={{
                                  padding: "8px 4px",
                                  backgroundColor: "#f8f9fa",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  border: "1px solid #dee2e6",
                                  borderLeft: "none",
                                  whiteSpace: "nowrap",
                                  width: "26.67%",
                                }}
                              >
                                Registration
                              </th>
                              <th
                                style={{
                                  padding: "8px 4px",
                                  backgroundColor: "#f8f9fa",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  border: "1px solid #dee2e6",
                                  borderLeft: "none",
                                  whiteSpace: "nowrap",
                                  width: "26.67%",
                                }}
                              >
                                Waiting List
                              </th>
                              <th
                                style={{
                                  padding: "8px 4px",
                                  backgroundColor: "#f8f9fa",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  border: "1px solid #dee2e6",
                                  borderLeft: "none",
                                  borderRadius: "0 6px 0 0",
                                  whiteSpace: "nowrap",
                                  width: "26.67%",
                                }}
                              >
                                OTSE
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "8px 4px",
                                  textAlign: "center",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  color: "#000",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  backgroundColor: "#ffe0e0",
                                  borderRadius: "0 0 0 6px",
                                  width: "20%",
                                }}
                              >
                                {totalQuotaSum}
                              </td>
                              <td
                                style={{
                                  padding: "8px 4px",
                                  textAlign: "center",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  color: "#000",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  borderLeft: "none",
                                  backgroundColor: "#fff",
                                  width: "26.67%",
                                }}
                              >
                                {maxRegSlots > 0 ? `${vacantRegSlots}/${maxRegSlots}` : "0/0"}
                              </td>
                              <td
                                style={{
                                  padding: "8px 4px",
                                  textAlign: "center",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  color: "#000",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  borderLeft: "none",
                                  backgroundColor: "#fff",
                                  width: "26.67%",
                                }}
                              >
                                {maxWaitingListSlots > 0 ? `${vacantWaitingListSlots}/${maxWaitingListSlots}` : "0/0"}
                              </td>
                              <td
                                style={{
                                  padding: "8px 4px",
                                  textAlign: "center",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  color: "#000",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  borderLeft: "none",
                                  backgroundColor: "#fff",
                                  borderRadius: "0 0 6px 0",
                                  width: "26.67%",
                                }}
                              >
                                {maxOtsesSlots > 0 ? `${vacantOtsesSlots}/${maxOtsesSlots}` : "0/0"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="w-100" style={{ marginBottom: "12px" }}>
                        <table className="mb-0" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", tableLayout: "fixed" }}>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "8px 6px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #dee2e6",
                                  borderRight: "none",
                                  borderRadius: "6px 0 0 6px",
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  width: "35%",
                                  verticalAlign: "middle",
                                  height: "60px",
                                }}
                              >
                                Status
                              </td>
                              <td
                                style={{
                                  padding: "8px 6px",
                                  backgroundColor: "#fff",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0 6px 0 0",
                                  fontSize: "0.85rem",
                                  verticalAlign: "middle",
                                  height: "60px",
                                }}
                              >
                                <div className="d-flex flex-column gap-1">
                                  <span
                                    style={{
                                      backgroundColor: event?.active ? "#d4edda" : "#e2e3e5",
                                      color: event?.active ? "#155724" : "#383d41",
                                      padding: "2px 6px",
                                      borderRadius: "3px",
                                      fontSize: "0.75rem",
                                      fontWeight: "500",
                                      width: "fit-content",
                                    }}
                                  >
                                    {event?.active ? "Activated" : "Not Activated"}
                                  </span>
                                  <span
                                    style={{
                                      backgroundColor: event?.closeRegistration ? "#f8d7da" : "#d1ecf1",
                                      color: event?.closeRegistration ? "#721c24" : "#0c5460",
                                      padding: "2px 6px",
                                      borderRadius: "3px",
                                      fontSize: "0.75rem",
                                      fontWeight: "500",
                                      width: "fit-content",
                                    }}
                                  >
                                    {event?.closeRegistration ? "Closed" : "Open"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: "8px 6px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  borderRight: "none",
                                  borderRadius: "0 0 0 6px",
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                  width: "35%",
                                  verticalAlign: "middle",
                                  height: "60px",
                                }}
                              >
                                Event Master
                              </td>
                              <td
                                style={{
                                  padding: "8px 6px",
                                  backgroundColor: "#fff",
                                  border: "1px solid #dee2e6",
                                  borderTop: "none",
                                  borderRadius: "0 0 6px 0",
                                  fontSize: "0.85rem",
                                  verticalAlign: "middle",
                                  height: "60px",
                                }}
                              >
                                <div className="d-flex flex-column">
                                  <span style={{ fontWeight: "500" }}>{event?.eventMaster || ""}</span>
                                  {event?.eventMasterPhone ? (
                                    <span className="text-muted" style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                                      📞 {event.eventMasterPhone}
                                    </span>
                                  ) : (
                                    <span style={{ height: "20px" }}></span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                }

                // For college end: existing logic (only show waiting list when registration is full)
                // First check if college is already enrolled - if so, don't show any slot counts
                const foundParticipation = participation.find((p) => {
                  const pEventId = p?.availableEventId;
                  const eventId = event?.id;
                  return pEventId != null && eventId != null && (pEventId === eventId || String(pEventId) === String(eventId) || Number(pEventId) === Number(eventId));
                });

                if (foundParticipation) {
                  // College is enrolled - don't show slot counts
                  return <div style={{ height: "32px" }}></div>;
                }

                if (isRegistrationFull) {
                  if (hasWaitingListAvailable) {
                    return (
                      <div
                        className="px-3 py-2 rounded text-center"
                        style={{
                          border: "2px solid #ffc107",
                          backgroundColor: "white",
                          color: "#856404",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Waiting List: {vacantWaitingListSlots}/{waitingListSlots}
                      </div>
                    );
                  } else {
                    // Registration full, no waiting list available - show nothing (Full button will be shown)
                    return <div style={{ height: "32px" }}></div>;
                  }
                } else {
                  // Registration slots available - show vacant slots
                  if (vacantSlots !== null && maxSlots) {
                    return (
                      <div
                        className="px-3 py-2 rounded text-center"
                        style={{
                          border: "2px solid #dc3545",
                          backgroundColor: "white",
                          color: "#dc3545",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Slots Vacant: {vacantSlots}/{maxSlots}
                      </div>
                    );
                  } else {
                    return <div style={{ height: "32px" }}></div>;
                  }
                }
              })()}
            </div>
            <Card.Text className={`text-muted text-center mb-2 ${styles.cardOneLiner}`}>
              <i>{event.oneLiner}</i>
            </Card.Text>
            <Card.Text className={`text-center ${styles.cardDescription}`} style={{ minHeight: "60px" }}>
              {truncateDescription(event.description, 10)}
            </Card.Text>
            <Badge bg="info" className="mb-3 align-self-center">
              {event.category}
            </Badge>
            <div className="mt-auto d-flex justify-content-center">
              {user.type === "ADMIN" ? (
                <Link to={event.slug} className="btn btn-primary d-flex align-items-center text-white text-decoration-none">
                  <FaEye className="me-2" />
                  View
                </Link>
              ) : (
                (() => {
                  // Find participation with proper type handling
                  const foundParticipation = participation.find((p) => {
                    const pEventId = p?.availableEventId;
                    const eventId = event?.id;
                    // Handle both string and number comparisons
                    return pEventId != null && eventId != null && (pEventId === eventId || String(pEventId) === String(eventId) || Number(pEventId) === Number(eventId));
                  });

                  return foundParticipation ? (
                    <Button
                      variant="success"
                      disabled={isLoading}
                      className="d-flex align-items-center"
                      onClick={() => {
                        if (foundParticipation?.id) {
                          handleDeleteParticipation(foundParticipation.id);
                        } else {
                          console.error("Participation ID not found for event:", event?.title, foundParticipation);
                          alert("Unable to find participation details. Please refresh the page.");
                        }
                      }}
                    >
                      <FaCheckCircle className="me-2" />
                      {isLoading ? "Please wait..." : "Enrolled"}
                    </Button>
                  ) : (
                    (() => {
                      // Check if registration deadline has passed
                      if (isDeadlineClosed) {
                        return (
                          <Button disabled variant="secondary">
                            Registration Closed
                          </Button>
                        );
                      }

                      const maxSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate?.name === "REGISTERED_SLOTS_AVAILABLE")?.value;
                      // If waiting list rule is not present, treat it as 0 slots
                      const waitingListSlots = event?.eventRules?.find((ele) => ele.eventRuleTemplate?.name === "WAITING_LIST_SLOTS")?.value || "0";
                      const isRegistrationOpen = !event?.closeRegistration && slotsOccupied !== null && maxSlots && slotsOccupied < parseInt(maxSlots);

                      // Check if waiting list is available when registration is full
                      // Registration must not be closed, registration slots must be full, and waiting list must have slots
                      const isWaitingListAvailable =
                        !event?.closeRegistration &&
                        !isRegistrationOpen &&
                        parseInt(waitingListSlots) > 0 &&
                        waitingListSlotsOccupied !== null &&
                        parseInt(waitingListSlots) > waitingListSlotsOccupied;

                      if (isRegistrationOpen) {
                        return (
                          <Button variant="primary" onClick={handleCollegeRegister} disabled={isLoading} className="d-flex align-items-center">
                            {isLoading ? (
                              <>
                                <FaSpinner className="me-2 spinner-border-sm" />
                                Registering...
                              </>
                            ) : (
                              "Register"
                            )}
                          </Button>
                        );
                      } else if (isWaitingListAvailable) {
                        const vacantWaitingListSlots = parseInt(waitingListSlots) - waitingListSlotsOccupied;
                        return (
                          <Button variant="warning" onClick={handleCollegeRegister} disabled={isLoading} className="d-flex align-items-center">
                            {isLoading ? (
                              <>
                                <FaSpinner className="me-2 spinner-border-sm" />
                                Registering...
                              </>
                            ) : (
                              `Join Waiting List (${vacantWaitingListSlots} left)`
                            )}
                          </Button>
                        );
                      } else {
                        return (
                          <Button disabled variant="danger">
                            Full
                          </Button>
                        );
                      }
                    })()
                  );
                })()
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  );
};

export default EventCard;
