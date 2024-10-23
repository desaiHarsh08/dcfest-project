import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const ManagementEvents = () => {
    const managementEvents = [
        {
            image: "",
            alt: "Dakiya ayaa",
            title: "DAKIYA AAYA"
        },
        {
            image: "",
            alt: "Garbar ghotala",
            title: "GARBAR GHOTALA (PLAN THE BIGGEST SCAM)"
        },
        {
            image: "",
            alt: "jab paisa nahi tha",
            title: "JAB PAISA NAHI THA (MOCK BARTER)"
        },
        {
            image: "",
            alt: "Jugadu",
            title: "JUGAADU (PROJECTON COMMON MAN)"
        },
        {
            image: "",
            alt: "nam wahi pehchan nayi",
            title: "NAAM WAHI PEHCHAAN NAYI (REBRANDING) "
        },
        {
            image: "",
            alt: "navgraha",
            title: "NAVAGRAHA"
        },
        {
            image: "",
            alt: "rajneeti",
            title: "RAJNEETI (MOST COMMON AMONGST COMMON MAN)"
        },
        {
            image: "",
            alt: "stress interview",
            title:"STRESS INTERVIEW (TENSION LENE KA NAHI DENE KA)"
        },
        {
            image: "",
            alt: "TIJORI (LOCKER ROOM)",
            title: "WESTERN GROUP DANCE (NRITYOGITA)"
        },
        {
            image: "",
            alt: "aarohan",
            title: "AAROHAN (DREAM TO DAWN)"
        },
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Management Events</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {managementEvents.map((event, index) => (
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

export default ManagementEvents;
