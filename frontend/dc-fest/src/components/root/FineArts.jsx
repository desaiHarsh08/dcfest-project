import React from 'react'
import { Card } from 'react-bootstrap';
import "../../styles/EventLists.css"; //
const FineArts = () => {
    const fineArts = [
        {
            image: "",
            alt: "best out of waste",
            title: "BEST OUT OF WASTE (BEKAR SE UTTAM TAK)"
        },
        {
            image: "",
            alt: "charcoal painting",
            title: "CHARCOAL PAINTING (KOILE KI KALA)"
        },
        {
            image: "",
            alt: "clay art",
            title: "CLAY ART (SHILPKAR)"
        },
        {
            image: "",
            alt: "face painting",
            title: "FACE PAINTING (CHEHRE PE CHITRAKARI)"
        },
        {
            image: "",
            alt: "madhubani",
            title: "MADHUBANI ART (MADHUBANI CHITRAKARI)"
        },
        {
            image: "",
            alt: "mandala",
            title: "MANDALA "
        },
        {
            image: "",
            alt: "mehendi",
            title: "MEHENDI DESIGNING (MEHENDI ABHIKALP)"
        },
        {
            image: "",
            alt: "rangoli",
            title: "RANGOLI MAKING "
        },
        {
            image: "",
            alt: "t-shirt painting",
            title: "T-SHIRT PAINTING (KAMIZ PER KALAKRITI)"
        },
        {
            image: "",
            alt: "urban sketching",
            title: "URBAN SKETCHING (SHAHRI CHITRAKALA)"
        },
    ];
    return (
        <>
            <h2 className='p-2 ms-3 event-heading'>Fine Arts</h2>
            <div className="event-list-container-horizontal"> {/* Use custom container */}
                {/** Cards */}
                {fineArts.map((event, index) => (
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

export default FineArts;
