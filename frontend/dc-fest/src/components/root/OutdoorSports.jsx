import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const OutdoorSports = () => {
    const outdoorSports = [
        {
            image: "",
            alt: "basketball",
            title: "BASKETBALL"
        },
        {
            image: "",
            alt: "cricket",
            title: "CRICKET"
        },
        {
            image: "",
            alt: "fitness mania",
            title: "FITNESS MANIA"
        },
        {
            image: "",
            alt: "football",
            title: "FOOTBALL"
        },
        {
            image: "",
            alt: "kabaddi",
            title: "KABADDI (LE PANGA)"
        },
        {
            image: "",
            alt: "kho kho",
            title: "KHO KHO"
        },
        {
            image: "",
            alt: "tug of war",
            title: "TUG OF WAR (DEKHTE HAI KITNA HAI DUM)"
        },
        {
            image: "",
            alt: "yoga",
            title: "YOGA"
        },
        {
            image: "",
            alt: "volleyball",
            title: "VOLLEYBALL"
        }
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Outdoor Sports</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {outdoorSports.map((event, index) => (
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

export default OutdoorSports;
