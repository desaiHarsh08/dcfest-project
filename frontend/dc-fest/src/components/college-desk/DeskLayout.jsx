import { useContext, useEffect, useState } from "react";
import { fetchParticipationEvents } from "../../services/college-participation-apis";
import BasicDetailsForm from "./BasicDetailsForm";
import { Navbar } from "react-bootstrap";
import CollegeParticipation from "./CollegeParticipation";
import { Link, useParams } from "react-router-dom";
import EventsTable from "./EventsTable";
import { AuthContext } from "../../providers/AuthProvider";
import { fetchCollegeByIcCode } from "../../services/college-apis";
// import "../../styles/CollegeDesk.css";

const DeskLayout = () => {
  const { iccode } = useParams();
  console.log(iccode);

  const { user } = useContext(AuthContext);

  console.log("user:", user);
  // Define state to hold form data
  const [college, setCollege] = useState();

  // Sample events data
  const [events, setEvents] = useState([]);

  // Modal state
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    fetchCollegeByIcCode(iccode)
      .then((data) => {
        console.log("data: ", data);
        setCollege(data);
        setEvents(data.participations);
      })
      .catch((err) => console.log(err));
  }, [iccode]);

  // Handle view event (implement as needed)
  const handleView = (event) => {
    console.log("View Event:", event);
    // Implement the view functionality
  };

  // Handle remove event
  const handleRemove = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
  };
  return (
    <>
      {!user.type ? (
        !college?.detailsUploaded ? (
          <BasicDetailsForm college={college} setCollege={setCollege} />
        ) : (
          <p>College Details are already saved!</p>
        )
      ) : (
        <>
          <Navbar />
          <CollegeParticipation college={college} />

          <div className="events-table-container mt-4">
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
              <h3 className="text-center mb-4">Events List</h3>
              <Link to={"categories"}>Add Participation</Link>
            </div>
            <EventsTable
              events={events}
              onView={handleView}
              onRemove={handleRemove}
            />
          </div>
        </>
      )}
    </>
  );
};

export default DeskLayout;
