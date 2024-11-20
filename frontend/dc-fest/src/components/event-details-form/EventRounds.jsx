import { motion } from "framer-motion";

const attributes = [
  {
    htmlLabel: "qualifyNumber",
    name: "Qualify No.",
    type: "number",
  },
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

/* eslint-disable react/prop-types */
const EventRounds = ({ eventRounds, onChange }) => {
  return (
    <div className="mb-5">
      <div className="border-bottom mb-4 d-flex align-items-center gap-2">
        <h3 className="fs-3 pb-2">Rounds</h3>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="card p-3 my-3">
        <div className="d-flex">
          <table className="table table-bordered">
            <thead>
              <th>Round</th>
              {attributes.map((att) => (
                <th key={att.name}>{att.name}</th>
              ))}
            </thead>
            <tbody>
              {eventRounds.map((round, roundIndex) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} key={`row-round-${roundIndex}`}>
                  <td>{round?.roundType}</td>
                  <td>
                    <input value={round.qualifyNumber} onChange={(e) => onChange(e, roundIndex)} name="qualifyNumber" type="number" className="form-control" />
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
                    <input value={round.startTime} onChange={(e) => onChange(e, roundIndex)} name="startTime" type="time" className="form-control" />
                  </td>
                  <td>
                    <input value={round.endTime} onChange={(e) => onChange(e, roundIndex)} name="endTime" type="time" className="form-control" />
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
