/* eslint-disable react/prop-types */
const EventRules = ({
  ruleTemplates = [],
  event,
  onAddRule,
  onDeleteRule,
  onChangeRule,
}) => {
  return (
    <>
      <div className="border-bottom mb-4 d-flex align-items-center gap-2">
        <h3 className="fs-3 pb-2">Rules</h3>
        <button
          type="button"
          className="btn btn-primary py-1"
          onClick={onAddRule}
        >
          +
        </button>
      </div>
      {event?.eventRules &&
        event.eventRules.map((eventRule, ruleIndex) => (
          <>
            <div className="card p-3 my-2">
              <button
                type="button"
                onClick={() => onDeleteRule(ruleIndex)}
                className="btn text-danger"
              >
                Delete
              </button>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Type
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={eventRule?.eventRuleTemplate?.id}
                  onChange={(e) => onChangeRule(e, ruleIndex)}
                  name="eventRuleTemplate"
                >
                  {ruleTemplates?.length > 0 &&
                    ruleTemplates.map((ruleTemplate) => (
                      <option key={ruleTemplate.id} value={ruleTemplate.id}>
                        {ruleTemplate.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-3">
                {eventRule?.eventRuleTemplate?.valueType === "STRING" && (
                  <textarea
                    className="form-control"
                    onChange={(e) => onChangeRule(e, ruleIndex)}
                    value={eventRule?.value}
                    name="value"
                    rows="3"
                  ></textarea>
                )}
                {eventRule?.eventRuleTemplate?.valueType === "NUMBER" && (
                  <input
                    type="number"
                    className="form-control"
                    onChange={(e) => onChangeRule(e, ruleIndex)}
                    value={eventRule?.value}
                    name="value"
                  />
                )}
                {eventRule?.eventRuleTemplate?.valueType === "BOOLEAN" && (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      onChange={(e) => onChangeRule(e, ruleIndex)}
                      checked={eventRule?.value}
                      name="value"
                    />
                    <p>{eventRule?.value}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ))}
    </>
  );
};

export default EventRules;
