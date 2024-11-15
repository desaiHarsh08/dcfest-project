/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { fetchParticipationEvents, fetchParticipationEventsByCollegeId } from "../../services/college-participation-apis";
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
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

  useEffect(() => {
    getCollege();
    console.log("showResetPasswordForm:", showResetPasswordForm);
  }, [iccode, showResetPasswordForm]);

  const [participation, setParticipation] = useState([]);
  const [flag, setFlag] = useState(false);

  console.log(college);

  useEffect(() => {
    if (college?.id) {
      fetchParticipationEventsByCollegeId(college.id)
        .then((data) => {
          console.log(data);
          setEvents(data);
          setParticipation(data);
        })
        .catch((err) => console.log(err));
    }
  }, [college, flag]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      setCollege(response);
    } catch (error) {
      console.log(error);
      // alert('Unable to get the college data... please try again later.');
    }
  };

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
      {college && !college?.detailsUploaded ? (
        <BasicDetailsForm college={college} setCollege={setCollege} setShowResetPasswordForm={setShowResetPasswordForm} getCollege={getCollege} />
      ) : (
        <>
          <Navbar />
          {console.log(iccode)}
          {iccode && !(pathname.endsWith(`/${iccode}`) || pathname.endsWith(`/${iccode}/`)) && (
            <div className="container">
              <Link to={`/${iccode}`}>Home</Link>
            </div>
          )}

          <div className="container border-bottom">
            <h1>{college?.name}</h1>
            <h5>Representatives: -</h5>
            <ul className="p-0">
              {college?.representatives.map((rep) => (
                <li key={`rep-${rep.id}`} style={{ listStyle: "none" }}>
                  <p className="m-0">{rep.name}</p>
                  <p>{rep.email}</p>
                </li>
              ))}
            </ul>
          </div>
          {college && <CollegeParticipation participations={participation} />}

          <div className="events-table-container mt-4">
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
              <h3 className="text-center mb-4">Events List</h3>
              <Link to={"categories"}>Add Participation</Link>
            </div>
            <EventsTable events={events} onView={handleView} onRemove={handleRemove} />
          </div>
        </>
      )}
    </>
  );
};

export default DeskLayout;
