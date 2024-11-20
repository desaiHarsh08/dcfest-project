import { motion } from "framer-motion";
import { MdDelete } from "react-icons/md";
/* eslint-disable react/prop-types */
const EventRules = ({ ruleTemplates = [], event, onAddRule, onDeleteRule, onChangeRule }) => {
  return (
    <>
      <div className="border-bottom mb-4 d-flex align-items-center gap-2">
        <h3 className="fs-3 pb-2">Rules</h3>
        <button type="button" className="btn btn-primary py-1" onClick={onAddRule}>
          +
        </button>
      </div>
      <div className="overflow-auto" style={{ height: "50vh" }}>
        {event?.eventRules &&
          event.eventRules.map((eventRule, ruleIndex) => (
            <motion.div key={`rule-${ruleIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="card p-3 my-2">
              <div>
                <p>Rule #{ruleIndex + 1}</p>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "45%" }}>
                    <select className="form-select" aria-label="Default select example" value={eventRule?.eventRuleTemplate?.id} onChange={(e) => onChangeRule(e, ruleIndex)} name="eventRuleTemplate">
                      {ruleTemplates?.length > 0 &&
                        ruleTemplates.map((ruleTemplate) => (
                          <option key={ruleTemplate.id} value={ruleTemplate.id}>
                            {ruleTemplate.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div style={{ width: "45%" }}>
                    {eventRule?.eventRuleTemplate?.valueType === "STRING" && (
                      <textarea className="form-control" onChange={(e) => onChangeRule(e, ruleIndex)} value={eventRule?.value} name="value" rows="3"></textarea>
                    )}
                    {eventRule?.eventRuleTemplate?.valueType === "NUMBER" && (
                      <input type="number" className="form-control" onChange={(e) => onChangeRule(e, ruleIndex)} value={eventRule?.value} name="value" />
                    )}
                    {eventRule?.eventRuleTemplate?.valueType === "BOOLEAN" && (
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" onChange={(e) => onChangeRule(e, ruleIndex)} checked={eventRule?.value} name="value" />
                        <p>{eventRule?.value}</p>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => onDeleteRule(ruleIndex)} className="btn text-danger">
                    <MdDelete style={{ fontSize: "32px" }} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </>
  );
};

export default EventRules;
