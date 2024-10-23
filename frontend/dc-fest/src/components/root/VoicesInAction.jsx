import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const VoicesInAction = () => {
    const voicesInAction = [
        {
            image: "",
            alt: "Debate",
            title: "DEBATE (VITARK)"
        },
        {
            image: "",
            alt: "india-one-act-play",
            title: "INDIA ONE ACT PLAY(RANGMANCH)"
        },
        {
            image: "",
            alt: "jam verteez",
            title: "JAM & VERTEEZ"
        },
        {
            image: "",
            alt: "radio",
            title: "RADIO PLAY (BULAND AWAZ)"
        },
        {
            image: "",
            alt: "standup comedy",
            title: "STAND-UP COMEDY"
        },
        {
            image: "",
            alt: "street play",
            title: "STREET PLAY (NUKKAD NATAK)"
        },
        {
            image: "",
            alt: "suchna sanchar",
            title: "SUCHNA SANCHAR NIGAM LIMITED"
        }
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Voices In Action</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {voicesInAction.map((event, index) => (
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

export default VoicesInAction;
