import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const GamingConsole = () => {
    const gamingConsole = [
        {
            image: "",
            alt: "counter strike",
            title: "COUNTER-STRIKE (PC)"
        },
        {
            image: "",
            alt: "fifa",
            title: "FIFA’22"
        },
        {
            image: "",
            alt: "rocket league",
            title: "ROCKET LEAGUE"
        },
        {
            image: "",
            alt: "tekken",
            title: "TEKKEN"
        },
        {
            image: "",
            alt: "valorant",
            title: "VALORANT "
        }
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Gaming Console</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {gamingConsole.map((event, index) => (
                    <Card className="event-card" key={index}> {/* Custom card */}
                        <Card.Img
                            variant="top"
                            src={event.image}
                            alt={event.alt}
                            className='img-fluid event-img'
                        />
                        <Card.Body>
                            <Card.Title className='text-center event-title'>
                                {event.title}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}

export default GamingConsole;
