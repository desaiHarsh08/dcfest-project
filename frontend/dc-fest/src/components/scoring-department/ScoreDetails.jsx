/* eslint-disable react/prop-types */
import { BsBuilding, BsCalendar, BsGeoAlt, BsPerson } from "react-icons/bs";

const ScoreDetails = ({ selectedCategory, selectedAvailableEvent, selectedRound }) => {
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      //   weekday: "long", // Day of the week (e.g., Monday)
      year: "numeric", // Year (e.g., 2024)
      month: "long", // Month (e.g., November)
      day: "numeric", // Day (e.g., 14)
      hour: "2-digit", // Hour (e.g., 09)
      minute: "2-digit", // Minute (e.g., 30)
      //   second: "2-digit", // Second (e.g., 05)
      hour12: true, // Use AM/PM format
    });
  };

  return (
    <div className="header mt-5">
      <div className="row">
        <div className="col">
          <strong>
            <BsBuilding /> DEPARTMENT :
          </strong>
          <span>{selectedAvailableEvent?.title}</span>
        </div>
        <div className="col">
          <strong>
            <BsPerson /> JUDGE NAME :
          </strong>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <strong>
            <BsCalendar /> EVENT NAME :
          </strong>
          <span>{selectedCategory?.name}</span>
        </div>
        <div className="col">
          <strong>
            <BsCalendar /> EVENT DATE :
          </strong>
          <span>{formatDateTime(selectedRound?.startTime)}</span>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <strong>
            <BsGeoAlt /> EVENT VENUE :
          </strong>
          <span>{selectedRound?.venue}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDetails;
