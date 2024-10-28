import { useContext, useEffect, useState } from "react";
import { fetchParticipationEvents } from "../../services/college-participation-apis";
import BasicDetailsForm from "./BasicDetailsForm";
import CollegeParticipation from "./CollegeParticipation";
import { Link, useLocation, useParams } from "react-router-dom";
import EventsTable from "./EventsTable";
import { AuthContext } from "../../providers/AuthProvider";
import { fetchCollegeByIcCode } from "../../services/college-apis";
import ResetPasswordPage from "../../pages/ResetPasswordPage";
import Navbar from "../Navbar/Navbar";
// import "../../styles/CollegeDesk.css";

const DeskLayout = () => {
  const { iccode } = useParams();
  const { pathname } = useLocation();
  console.log(iccode);

  const { user } = useContext(AuthContext);

  console.log("user:", user);
  // Define state to hold form data
  const [college, setCollege] = useState();

  // Sample events data
  const [events, setEvents] = useState([]);

  // Modal state
  const [modalShow, setModalShow] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false)

  useEffect(() => {
    getCollege();
    console.log("showResetPasswordForm:", showResetPasswordForm);
  }, [iccode, showResetPasswordForm]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      setCollege(response);
      setEvents(response.participations);
    } catch (error) {
      console.log(error);
      // alert('Unable to get the college data... please try again later.');
    }
  }

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
          <BasicDetailsForm
            college={college}
            setCollege={setCollege}
            setShowResetPasswordForm={setShowResetPasswordForm}
            getCollege={getCollege}
          />
        ) : (
          showResetPasswordForm ? <ResetPasswordPage college={college} /> :
            <div className="p-2 vh-100 d-flex justify-content-center flex-column align-items-center">
              <p>College Details are already saved!</p>
              <Link to={'/login'}>Back</Link>
            </div>
        )
      ) : (
        <>
          <Navbar />
          {console.log(iccode)}
          {(iccode && !(pathname.endsWith(`/${iccode}`) || pathname.endsWith(`/${iccode}/`))) && <div className="container">
            <Link to={`/${iccode}`}>Home</Link>
          </div>}
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
