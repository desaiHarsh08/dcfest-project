import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaRegClipboard,
  FaUsers,
  FaTrophy,
  FaFlagCheckered,
  FaLifeRing,
  FaClipboardCheck,
  FaUserPlus,
} from "react-icons/fa";
import "../../styles/CardGrid.css"; // Ensure updated styles
import totalEvents from "../../assets/img/events2.jpg";
import eventRegistration from "../../assets/img/event-registeration2.jpg";
import upload from "../../assets/img/uploadLists.jpg";
import collegeRanking from "../../assets/img/college-ranking2.jpg";
import addEvents from "../../assets/img/addEvents.jpg";
import teamsRanking from "../../assets/img/team-ranking2.jpg";
import helpDeskImage from "../../assets/img/help-desk2.jpg";
import scoringDepartmentImage from "../../assets/img/scoring-department2.jpg";
import ParticipationStats from "./ParticipationStats";
import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { IoAdd } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

const HomeDesk = () => {
  const { user } = useContext(AuthContext);
  console.log("welcome Dear User!", user)
  const cardsData = [
    {
      title: "Categories",
      icon: <FaClipboardList size={40} color="#ffffff" />,
      bgColor: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
      imgSrc: totalEvents,
      description: "Explore categories for all events in detail.",
      link: "categories",
    },
    {
      title: "Event Desk",
      icon: <FaRegClipboard size={40} color="#ffffff" />,
      bgColor: "linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)",
      imgSrc: eventRegistration,
      description: "Manage registrations and event details.",
      link: "event-desk",
    },
    {
        title: "Scoring Department",
        icon: <FaClipboardCheck size={40} color="#ffffff" />,
        bgColor: "linear-gradient(135deg, #FF512F 0%, #F09819 100%)",
        imgSrc: scoringDepartmentImage,
        description: "Access scoring details and results.",
        link: "scoring-department",
      },
      {
        title: "Teams Ranking",
        icon: <FaFlagCheckered size={40} color="#ffffff" />,
        bgColor: "linear-gradient(135deg, #FF512F 0%, #DD2476 100%)",
        imgSrc: teamsRanking,
        description: "View team rankings based on performance.",
        link: "teams-ranking",
      },
      {
        title: "College Rankings",
        icon: <FaTrophy size={40} color="#ffffff" />,
        bgColor: "linear-gradient(135deg, #DCE35B 0%, #45B649 100%)",
        imgSrc: collegeRanking,
        description: "Check the current rankings of colleges.",
        link: "college-rankings",
      },
    {
      title: "Upload College Lists",
      icon: <FaUsers size={40} color="#ffffff" />,
      bgColor: "linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)",
      imgSrc: upload,
      description: "Upload lists of participating college teams.",
      link: "college-teams-participated",
    },
    {
      title: "Add Event",
      icon: <IoAdd size={40} color="#ffffff" />,
      bgColor: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)",
      imgSrc: addEvents,
      description: "Create and manage new events.",
      link: "add-event",
    },
    {
      title: "Get Reports",
      icon: <FaLifeRing size={40} color="#ffffff" />,
      bgColor: "linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)",
      imgSrc: helpDeskImage,
      description: "Get the reports of the events participated.",
      link: "help-desk",
    },
    
  ];

  return (
    <div className="container h-100">
      <div className="user-greeting text-center my-4">
        <h2 className="mb-2">
          <span className="icon-bg">
            <FaUserPlus />
          </span>
          Welcome Back, {user?.name}!
        </h2>
        <p className="text-muted">
          <span className="icon-bg">
            <MdEmail />
          </span>
          Email: {user?.email}
        </p>
      </div>
      <ParticipationStats />
      <Row className="d-flex justify-content-center align-items-stretch h-75">
        {cardsData.map((card, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3} className="mt-4 pb-5">
            <Link to={card.link} className="text-decoration-none h-100">
              <Card
                className="text-center h-100 shadow-lg border-0 custom-card"
                style={{ background: card.bgColor }}
              >
                <div className="card-overlay">
                  <Card.Img
                    variant="top"
                    src={card.imgSrc}
                    alt={card.title}
                    className="card-image"
                  />
                </div>
                <Card.Body className="p-4">
                  <div className="icon-container mb-3">{card.icon}</div>
                  <Card.Title className="card-title text-white fw-bold">{card.title}</Card.Title>
                  <Card.Text className="card-text text-white fw-bold fs-5">
                    {card.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomeDesk;
