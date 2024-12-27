/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { fetchAvailableEvents } from "../services/available-events-apis";
import { fetchEvents } from "../services/event-apis";
import { fetchCategories } from "../services/categories-api";
import { fetchAllParticipations } from "../services/college-participation-apis";
import { fetchParticipantsByEventIdAndCollegeId } from "../services/participants-api";
import { fetchColleges } from "../services/college-apis";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getAllScoreCards, getScoreCardTeamByTeamNumberAndRoundId } from "../services/scorecard-apis";
import { fetchRoundById } from "../services/rounds-apis";

const GetReports = () => {
  //   const [loadingId, setLoadingId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  //   const [showModal, setShowModal] = useState(false);
  //   const [selectedCollege, setSelectedCollege] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [events, setEvents] = useState([]);
  // const [pages, setPages] = useState(1);
  const [currentCollege, setCurrentCollege] = useState(1);
  //   const [loadingDownLoad, setLoadingDownLoad] = useState(false);
  const [categories, setCategories] = useState();
  const [colleges, setColleges] = useState([]);

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.type == "ADMIN" || !user?.type == "REPORT_DESK") {
      navigate(-1);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAvailableEvents()
      .then((data) => {
        // console.log("availableEvents:", data);
        setAvailableEvents(data);
      })
      .catch((err) => console.log("Error while fetching available events", err));
  }, []);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        // console.log("events:", data);
        setEvents(data);
      })
      .catch((err) => console.log("Error while fetching events", err));
  }, []);

  useEffect(() => {
    fetchColleges()
      .then((data) => {
        setColleges(data);
        // console.log("College data is coming...", data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        // console.log("categories:", data);
        setCategories(data);
      })
      .catch((err) => console.log("Error while fetching events", err));
  }, []);

  //   const handleFormatData = async (participants, length) => {
  //     let formattedData = [];
  //     participants.forEach((participant, index) => {
  //       const eventsData = participant.eventIds.map((eventId) => {
  //         const event = events.find((e) => e.id === eventId);
  //         const availableEvent = availableEvents.find((a) => a.id === event?.availableEventId);
  //         const category = categories.find((c) => c.id === availableEvent?.eventCategoryId);

  //         let roundId, teamNumber, promotedRoundId, rank, slot, points;

  //         if (participant.teamNumber) {
  //           teamNumber = participant.teamNumber;
  //           console.log(teamNumber)
  //           try {
  //             const response = await getScoreCardTeamByTeamNumber(participant.teamNumber);
  //             console.log(data);
  //             roundId = data.roundId;
  //             promotedRoundId = data.promotedRoundId;
  //             rank = data.rank;
  //             slot = data.slot;
  //             points = data.points;
  //           } catch (error) {
  //                 console.log(error)
  //           }

  //         }
  //         return {
  //           srno: length + index + 1,
  //           iccode: colleges.find((c) => c.id == participant.collegeId)?.icCode,
  //           college: colleges.find((c) => c.id === participant.collegeId)?.name,
  //           college_email: colleges.find((c) => c.id === participant.collegeId)?.email,
  //           college_phone: colleges.find((c) => c.id === participant.collegeId)?.phone,
  //           name: participant.name,
  //           hand_preference: participant.handPreference,
  //           gender: participant.male ? "M" : "F",
  //           email: participant.email,
  //           whatsappNumber: participant.whatsappNumber,
  //           category: category?.name || "",
  //           event: availableEvent?.title || "",
  //           type: participant.type,
  //           entry: participant.entryType,
  //           present: participant.present ? "Present" : "",
  //           participants: participants.length,
  //           team: teamNumber,
  //           round: availableEvent.rounds.find((r) => r.id == roundId).roundType || undefined,
  //           rank,
  //           slot,
  //           points,
  //           qualified_for: availableEvent.rounds.find((r) => r.id == promotedRoundId).roundType || undefined,
  //         };
  //       });
  //       formattedData = [...formattedData, ...eventsData];
  //     });

  //     return formattedData;
  //   };

  //   const hanldeInterestedColleges = async (collegeId) => {
  //     console.log("college:", collegeId);

  //     try {
  //       const response = await interestedColleges();
  //       console.log(response);

  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  const handleScoreCardsDownload = async () => {
    const arr = [];
    try {
      console.log("fetching score-cards");
      const response = await getAllScoreCards();
      console.log(response);

      for (let i = 0; i < response.length; i++) {
        console.log(response[i]);
        const round = await fetchRoundById(response[i].roundId);

        let promotedRound;
        if (response[i].promotedRoundId) {
          promotedRound = await fetchRoundById(response[i].promotedRoundId);
        }

        let ae = availableEvents.find((ele) => {
          if (ele.rounds.some((ele) => ele.id == round?.id)) {
            return ele;
          }
        });

        let ct = categories.find((c) => c.id == ae.eventCategoryId);

        // let pae;
        // if (promotedRound) {
        //     pae = availableEvents.find(ele => {
        //         if (ele.rounds.some(ele => ele.id == promotedRound?.id)) {
        //             return ele;
        //         }
        //     })
        // }

        let obj = {
          category: ct?.name,
          event: ae?.title,
          team_number: response[i].teamNumber,
          slot: response[i].slot,
          rank: response[i].rank,
          points: response[i].points,
          round: round ? round.roundType : undefined,
          qualified_for: promotedRound ? promotedRound.roundType : undefined,
        };
        arr.push(obj);
      }

      const worksheet = XLSX.utils.json_to_sheet(arr);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Scorecards");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `scorecards.xlsx`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormatData = async (participants, length) => {
    let formattedData = [];

    // Using Promise.all to handle asynchronous operations correctly
    const eventsData = await Promise.all(
      participants.map(async (participant, index) => {
        const eventsData = await Promise.all(
          participant.eventIds.map(async (eventId) => {
            const event = events.find((e) => e.id === eventId);
            const availableEvent = availableEvents.find((a) => a.id === event?.availableEventId);
            const category = categories.find((c) => c.id === availableEvent?.eventCategoryId);

            // let roundId, teamNumber, promotedRoundId, rank, slot, points;
            // for (let i = 0; i < availableEvent.rounds.length; i++) {
            //   if (participant.group) {
            //     teamNumber = participant.group;
            //     console.log(teamNumber);
            //     try {
            //       const response = await getScoreCardTeamByTeamNumberAndRoundId(teamNumber, availableEvent.rounds[i].id);
            //       if (response != null) {
            //         console.log(response);
            //         roundId = response.roundId;
            //         promotedRoundId = response.promotedRoundId;
            //         rank = response.rank;
            //         slot = response.slot;
            //         points = response.points;
            //       }
            //     } catch (error) {
            //       console.log(error);
            //     }
            //   }
            // }

            return {
              srno: length + index + 1,
              iccode: colleges.find((c) => c.id == participant.collegeId)?.icCode,
              college: colleges.find((c) => c.id === participant.collegeId)?.name,
              college_email: colleges.find((c) => c.id === participant.collegeId)?.email,
              college_phone: colleges.find((c) => c.id === participant.collegeId)?.phone,
              name: participant.name,
              hand_preference: participant.handPreference,
              gender: participant.male ? "M" : "F",
              email: participant.email,
              whatsappNumber: participant.whatsappNumber,
              category: category?.name || "",
              event: availableEvent?.title || "",
              type: participant.type,
              entry: participant.entryType,
              present: participant.present ? "Present" : "",
              participants: participants.length,
              //   team: teamNumber,
              //   round: availableEvent.rounds.find((r) => r.id == roundId)?.roundType || undefined,
              //   rank,
              //   slot,
              //   points,
              //   qualified_for: promotedRoundId || undefined,
            };
          })
        );

        return eventsData;
      })
    );

    // Flattening the nested arrays from Promise.all
    formattedData = eventsData.flat();

    return formattedData;
  };

  const getRoundById = async (roundId) => {
    try {
      const response = await fetchRoundById(roundId);

      return response;
    } catch (error) {
      return null;
    }
  };

  const getParticipants = async (collegeParticipation) => {
    const event = events.find((ele) => ele.availableEventId == collegeParticipation.availableEventId);
    if (!event) return null;
    try {
      const response = await fetchParticipantsByEventIdAndCollegeId(event.id, collegeParticipation.collegeId);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const hanldeCollegeParticipations = async () => {
    setIsDownloading(true);
    setCurrentCollege(0);
    try {
      //   console.log("here");
      const response = await fetchAllParticipations();
      //   console.log(response);
      const doneColleges = [];
      let formattedArr = [];
      for (let i = 0, c = 0; i < response.length; i++) {
        if (doneColleges.includes(response[i].collegeId)) {
          continue;
        }
        // console.log("done:", response[i].collegeId);
        const tmpCollegeParticipations = response.filter((ele) => ele.collegeId == response[i].collegeId);
        for (let j = 0; j < tmpCollegeParticipations.length; j++) {
          const participants = await getParticipants(tmpCollegeParticipations[j]);
          if (!participants) continue;
          const college = colleges.find((c) => c.id == tmpCollegeParticipations[j].collegeId);
          const availableEvent = availableEvents.find((a) => a.id == tmpCollegeParticipations[j].availableEventId);
          const category = categories.find((cat) => cat.id == availableEvent?.eventCategoryId);

          if (participants.length == 0) {
            const obj = {
              srno: formattedArr.length + 1,
              iccode: college?.icCode,
              college: college?.name,
              college_email: college?.email,
              college_phone: college?.phone,
              name: "",
              hand_preference: "",
              gender: "",
              email: "",
              whatsappNumber: "",
              category: category?.name || "",
              event: availableEvent?.title || "",
              type: "",
              entry: "",
              present: "",
              participants: participants.length,
            };
            formattedArr.push(obj);
            // console.log(obj);
          } else {
            const tmpArr = await handleFormatData(participants, formattedArr.length);
            // console.log(tmpArr);
            formattedArr = [...formattedArr, ...tmpArr];
          }
        }

        // console.log("done:", response[i].collegeId);
        doneColleges.push(response[i].collegeId);
        setCurrentCollege(doneColleges.length);
      }

      const worksheet = XLSX.utils.json_to_sheet(formattedArr);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Colleges Participated");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `colleges-participated.xlsx`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">Get Reports</h2>
          <p className="text-center text-muted">Download the reports you need to analyze your data. Choose from the options below.</p>
        </Col>
      </Row>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>All Participated Colleges</Card.Title>
              <Card.Text>Get the list of colleges with their participants.</Card.Text>
              <Button
                variant="success"
                onClick={hanldeCollegeParticipations}
                disabled={availableEvents.length == 0 || !categories || categories.length == 0 || colleges.length == 0 || events.length == 0}
              >
                Download
              </Button>
              {isDownloading && (
                <p>
                  Colleges: {currentCollege}/{colleges.filter((c) => c.detailsUploaded == true).length}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Scorecard Data</Card.Title>
              <Card.Text>Get the list of scores. This may take few seconds.</Card.Text>
              <Button
                variant="success"
                onClick={handleScoreCardsDownload}
                disabled={availableEvents.length == 0 || !categories || categories.length == 0 || colleges.length == 0 || events.length == 0}
              >
                Download
              </Button>
              {isDownloading && <p></p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GetReports;
