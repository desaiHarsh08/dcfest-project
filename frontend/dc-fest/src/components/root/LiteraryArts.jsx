import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const LiteraryArts = () => {
    const literaryArts = [
        {
            image: "",
            alt: "Bengali creative writing",
            title: "BENGALI CREATIVE WRITING (SHOBDOR KHELA)"
        },
        {
            image: "",
            alt: "bharat quiz",
            title: "BHARAT QUIZ (HINDUSTAN KA GYAAN)"
        },
        {
            image: "",
            alt: "english creative writing",
            title: "ENGLISH CREATIVE WRITING (KALAM KA ZOR)"
        },
        {
            image: "",
            alt: "hindi creative writing",
            title: "HINDI CREATIVE WRITING (RACHANAATMAK LEKHAN)"
        },
        {
            image: "",
            alt: "poetry",
            title: "POETRY (MUSHAIRA)"
        },
        {
            image: "",
            alt: "open quiz",
            title: "OPEN QUIZ(CHATUR DIMAG) "
        },
        {
            image: "",
            alt: "riddles",
            title: "RIDDLES (BUJHO TOH JAANO)"
        },
        {
            image: "",
            alt: "spellzell",
            title: "SPELLZELL (SHABDO KA KHEL)"
        },
        {
            image: "",
            alt: "vyakaran",
            title: "VYAKARAN"
        },
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Literary Arts</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {literaryArts.map((event, index) => (
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

export default LiteraryArts;
