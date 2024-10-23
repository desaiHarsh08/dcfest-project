import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const IndoorSports = () => {
    const indoorSports = [
        {
            image: "",
            alt: "carrom",
            title: "CARROM"
        },
        {
            image: "",
            alt: "chess",
            title: "CHESS (SHATRANJ)"
        },
        {
            image: "",
            alt: "darts",
            title: "DARTS (SANDH KI ANKH)"
        },
        {
            image: "",
            alt: "kancha",
            title: "KANCHA"
        },
        {
            image: "",
            alt: "pool",
            title: "POOL"
        },
        {
            image: "",
            alt: "snooker",
            title: "SNOOKER"
        },
        {
            image: "",
            alt: "table tennis",
            title: "TABLE TENNIS"
        }
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Indoor Sports</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {indoorSports.map((event, index) => (
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

export default IndoorSports;
