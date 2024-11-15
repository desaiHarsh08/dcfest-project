const roundType = ["PRELIMINARY", "ELIMINATOR", "SEMI_FINAL", "FINAL"];
/* eslint-disable react/prop-types */
const EventRounds = ({
  event,
  onAddRound,
  onDeleteRound,
  onChange,
  onAddVenue,
  onDeleteVenue,
  onChangeVenue,
}) => {
  console.log("event in round:", event);
  return (
    <>
      <div className="border-bottom mb-4 d-flex align-items-center gap-2">
        <h3 className="fs-3 pb-2">Rounds</h3>
        <button
          type="button"
          onClick={onAddRound}
          className="btn btn-primary py-1"
        >
          +
        </button>
      </div>
      {event &&
        event?.rounds.map((eventRound, roundIndex) => (
          <div className="card p-3 my-3" key={`round-${roundIndex}`}>
            <button
              className="btn text-danger"
              type="button"
              onClick={() => onDeleteRound(roundIndex)}
            >
              Delete
            </button>
            <div className="mb-3">
              <label htmlFor="roundType" className="form-label">
                Type
              </label>
              <select
                name="roundType"
                onChange={(e) => onChange(e, roundIndex)}
                value={eventRound?.roundType}
                className="form-select"
                aria-label="Default select example"
              >
                {roundType?.map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <input
                value={eventRound?.qualifyNumber}
                onChange={(e) => onChange(e, roundIndex)}
                name="qualifyNumber"
                type="number"
                className="form-control"
                placeholder="Qualify number"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="form-label">
                Note (Optional)
              </label>
              <textarea
                value={eventRound?.note}
                onChange={(e) => onChange(e, roundIndex)}
                className="form-control"
                name="note"
                rows="3"
              ></textarea>
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <h5>Venue</h5>
                <button
                  type="button"
                  onClick={() => onAddVenue(roundIndex)}
                  className="btn btn-primary py-1"
                >
                  +
                </button>
              </div>
              <table className="table">
                <thead>
                  <th>Sr. No.</th>
                  <th>Venue</th>
                  <th>Start</th>
                  <th>End</th>
                </thead>
                <tbody>
                  {eventRound?.venues?.map((venue, venueIndex) => (
                    <>
                      <tr key={`venue-${venueIndex}`}>
                        <td>{venueIndex + 1}</td>
                        <td>
                          <input
                            value={venue?.name}
                            onChange={(e) =>
                              onChangeVenue(e, roundIndex, venueIndex)
                            }
                            name="name"
                            type="text"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            value={venue?.start}
                            onChange={(e) =>
                              onChangeVenue(e, roundIndex, venueIndex)
                            }
                            name="start"
                            type="datetime-local"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            value={venue?.end}
                            onChange={(e) =>
                              onChangeVenue(e, roundIndex, venueIndex)
                            }
                            name="end"
                            type="datetime-local"
                            className="form-control"
                          />
                        </td>
                      </tr>
                      <button
                        type="button"
                        onClick={() => onDeleteVenue(roundIndex, venueIndex)}
                      >
                        Delete
                      </button>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </>
  );
};

export default EventRounds;
