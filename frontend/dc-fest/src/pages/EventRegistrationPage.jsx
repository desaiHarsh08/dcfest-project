/* eslint-disable no-unused-vars */
import "../styles/EventRegistrationPage.css"; // Import the CSS file
import ParticipationForm from "../components/participant-form/ParticipationForm";
import { useContext, useEffect } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const EventRegistrationPage = () => {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.type == "ATTENDANCE_DESK" || user?.type == "SCORE_SHEET_DESK" || user?.type == "SCORE_ENTRY_DESK") {
      navigate(-1);
    }
  }, [user, navigate]);

  return <ParticipationForm formType="REGISTRATION" />;
};

export default EventRegistrationPage;
