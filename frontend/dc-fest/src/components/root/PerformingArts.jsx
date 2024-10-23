import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const PerformingArts = () => {
    const performingArts = [
        {
            image: "",
            alt: "Antakshari",
            title: "ANTAKSHARI (DEEWANE,PARWANE, MASTANE)"
        },
        {
            image: "",
            alt: "Fashion Show",
            title: "BOLLYWOOD GROUP DANCE (JHOOM BARABAR JHOOM)"
        },
        {
            image: "",
            alt: "Indipop",
            title: "INDIPOP (SUR TAAL)"
        },
        {
            image: "",
            alt: "classical dance",
            title: "GROUP CLASSICAL DANCE (TAAL KA DHAMAAL)"
        },
        {
            image: "",
            alt: "solo classical dance",
            title: "SOLO CLASSICAL DANCE (AAJA NACH LE)"
        },
        {
            image: "",
            alt: "solo instrumental",
            title: "SOLO INSTRUMENTAL"
        },
        {
            image: "",
            alt: "street battle",
            title: "STREET BATTLE (NRITYA YUDH)"
        },
        {
            image: "",
            alt: "western band",
            title: "WESTERN BAND (ANGREZI BEAT)"
        },
        {
            image: "",
            alt: "western group dance",
            title: "WESTERN GROUP DANCE (NRITYOGITA)"
        },
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Performing Arts</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {performingArts.map((event, index) => (
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

export default PerformingArts;
