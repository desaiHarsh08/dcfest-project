/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Button, Form } from "react-bootstrap";
import { MdDelete } from "react-icons/md";

const attributes = [
  {
    htmlLabel: "venue",
    name: "Venue",
    type: "text",
  },
  {
    htmlLabel: "startDate",
    name: "Start Date",
    type: "date",
  },
  {
    htmlLabel: "endDate",
    name: "End Date",
    type: "date",
  },
  {
    htmlLabel: "startTime",
    name: "Start Time",
    type: "time",
  },
  {
    htmlLabel: "endTime",
    name: "End Time",
    type: "time",
  },
];

const roundType = ["PRELIMINARY", "QUARTER", "SEMI_FINAL", "FINAL"];

/* eslint-disable react/prop-types */
const EventRounds = ({ eventRounds, onChange, onAddRound, onDeleteRound }) => {
  const formatTime = (dateTimeString, format = "HH:mm") => {
    // Create a Date object from the input string
    const date = new Date(dateTimeString);

    // Get hours, minutes, seconds, and milliseconds
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    console.log(dateTimeString);
    // Format based on the provided format
    switch (format) {
      case "HH:mm:ss":
        return `${hours}:${minutes}:${seconds}`;
      case "HH:mm:ss.SSS":
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
      case "HH:mm":
      default:
        return `${hours}:${minutes}`;
    }
  };

  return (
    <div className="mb-5">
      <div className="border-bottom mb-4 d-flex align-items-center gap-2">
        <h3 className="fs-3 pb-2">Rounds</h3>
        <Button size="sm" type="button" onClick={onAddRound}>
          +
        </Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="card p-3 my-3">
        <div className="d-flex">
          <table className="table table-bordered">
            <thead>
              <th>Round</th>
              {attributes.map((att) => (
                <th key={att.name}>{att.name}</th>
              ))}
              <th>Actions</th>
            </thead>
            <tbody>
              {eventRounds.map((round, roundIndex) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} key={`row-round-${roundIndex}`}>
                  <td>
                    <Form.Select aria-label="Default select example" value={round?.roundType} name="roundType" onChange={(e) => onChange(e, roundIndex)}>
                      {roundType.map((r, index) => (
                        <option key={`round-type-${index}`} value={r}>
                          {r}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <input value={round.venue} onChange={(e) => onChange(e, roundIndex)} name="venue" type="text" className="form-control" />
                  </td>
                  <td>
                    <input value={round.startDate} onChange={(e) => onChange(e, roundIndex)} name="startDate" type="date" className="form-control" />
                  </td>
                  <td>
                    <input value={round.endDate} onChange={(e) => onChange(e, roundIndex)} name="endDate" type="date" className="form-control" />
                  </td>
                  <td>
                    <input
                      value={formatTime(round.startTime)}
                      onChange={(e) => {
                        console.log(e.target.value);
                        onChange(e, roundIndex);
                      }}
                      name="startTime"
                      type="time"
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input value={formatTime(round.endTime)} onChange={(e) => onChange(e, roundIndex)} name="endTime" type="time" className="form-control" />
                  </td>
                  <td>
                    <MdDelete className="fs-3 text-danger" style={{ cursor: "pointer" }} onClick={() => onDeleteRound(roundIndex)} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-3">
          <label htmlFor="note" className="form-label">
            Note (Optional)
          </label>
          {/* <textarea value={eventRound?.note} onChange={(e) => onChange(e, roundIndex)} className="form-control" name="note" rows="3"></textarea> */}
        </div>
      </motion.div>
    </div>
  );
};

export default EventRounds;
