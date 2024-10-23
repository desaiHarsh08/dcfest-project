import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaUserGraduate, FaRegClipboard, FaUsers, FaTrophy, FaFlagCheckered, FaLifeRing, FaClipboardCheck } from 'react-icons/fa';
import '../../styles/CardGrid.css'; // Ensure updated styles
import totalEvents from "../../assets/img/Total_Events.jpeg";
import collegeRepresentative from "../../assets/img/college_representative.png";
import eventRegistration from "../../assets/img/Event_registration.png";
import teamsPartcipated from "../../assets/img/Teams_participated.png";
import collegeRanking from "../../assets/img/college_ranking.jpg";
import teamsRanking from "../../assets/img/Teams_ranking.jpeg";
import helpDeskImage from "../../assets/img/help_desk.webp";
import scoringDepartmentImage from "../../assets/img/scoring_department.jpg";
import ParticipationStats from './ParticipationStats';

const HomeDesk = () => {
    const cardsData = [
        {
            title: "Categories",
            icon: <FaClipboardList />,
            bgColor: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
            imgSrc: totalEvents,
            description: "Overview of all events.",
            link: "categories"
        },
        {
            title: "Event Desk",
            icon: <FaRegClipboard />,
            bgColor: 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
            imgSrc: eventRegistration,
            description: "Details regarding event registration.",
            link: "event-desk"
        },
        {
            title: "Upload College Lists",
            icon: <FaUsers />,
            bgColor: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
            imgSrc: teamsPartcipated,
            description: "List of teams from various colleges.",
            link: "college-teams-participated"
        },
        {
            title: "College Ranking",
            icon: <FaTrophy />,
            bgColor: 'linear-gradient(135deg, #DCE35B 0%, #45B649 100%)',
            imgSrc: collegeRanking,
            description: "Current rankings of participating colleges.",
            link: "college-rankings"
        },
        {
            title: "Teams Rankings",
            icon: <FaFlagCheckered />,
            bgColor: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)',
            imgSrc: teamsRanking,
            description: "Ranking of teams based on performance.",
            link: "teams-ranking"
        },
        {
            title: "Help Desk",
            icon: <FaLifeRing />,
            bgColor: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
            imgSrc: helpDeskImage,
            description: "Support for any inquiries.",
            link: "help-desk"
        },
        {
            title: "Scoring Department",
            icon: <FaClipboardCheck />,
            bgColor: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
            imgSrc: scoringDepartmentImage,
            description: "Information on scoring and results.",
            link: "scoring-department"
        },
    ];

    return (
        <div className="container h-100">
            <ParticipationStats />
            <Row className="d-flex justify-content-center align-items-stretch h-75">
                {cardsData.map((card, index) => (
                    <Col key={index} xs={12} sm={6} md={4} lg={3} className='mt-4'>
                        <Link to={card.link} className="text-decoration-none h-100">
                            <Card className="text-center h-100 shadow-lg border-0 custom-card" style={{ background: card.bgColor }}>
                                <div className="card-overlay">
                                    <Card.Img variant="top" src={card.imgSrc} alt={card.title} className="card-image" />
                                </div>
                                <Card.Body className='p-4'>
                                    <div className="icon-container mb-3">
                                        {card.icon}
                                    </div>
                                    <Card.Title className="card-title">{card.title}</Card.Title>
                                    <Card.Text className="card-text text-white">{card.description}</Card.Text>
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
