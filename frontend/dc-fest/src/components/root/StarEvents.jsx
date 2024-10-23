import React from 'react';
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css";

const StarEvents = () => {
    const Starevents = [
        {
            image: "/beat-boxing.jpg",
            alt: "Beat Boxing",
            title: "BEAT BOXING"
        },
        {
            image: "/fashion-show.jpg",
            alt: "Fashion Show",
            title: "FASHION SHOW"
        },
        {
            image: "/kake-thali-eating.jpg",
            alt: "Kake Thali Eating",
            title: "KAKE THALI EATING"
        },
        {
            image: "/mock-a-band.jpg",
            alt: "Mock-a-band",
            title: "MOCK-A-BAND"
        },
        {
            image: "/mr-mrs-umang.jpg",
            alt: "Mr. & Mrs. Umang",
            title: "MR. & MS. UMANG"
        },
        {
            image: "/non-gas-cooking.jpg",
            alt: "Non-Gas Cooking",
            title: "NON-GAS COOKING"
        },
        {
            image: "/photostory.jpg",
            alt: "Photostory",
            title: "PHOTOSTORY"
        },
        {
            image: "/umang-idol.jpg",
            alt: "Umang Idol",
            title: "UMANG IDOL"
        },
        {
            image: "/war-of-wrappers.jpg",
            alt: "War of Wrappers",
            title: "WAR OF RAPPERS"
        },
        {
            image: "/war-of-djs.jpg",
            alt: "War of Djs",
            title: "WAR OF THE DJs"
        }
    ];

    return (
        <>
            <h2 className='p-2 ms-3 mt-3 event-heading'>Star Events</h2>
            <div className="event-list-container-horizontal"> {/* Horizontal scrolling container */}
                {Starevents.map((event, index) => (
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
    );
}

export default StarEvents;
