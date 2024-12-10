/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { Button } from "react-bootstrap";
import { MdDelete } from "react-icons/md";

const EventInfo = ({ categories, event, onChange, onJudgeChange, onAddJudge, onDeleteJudge }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="border-bottom mb-4">
        <h3 className="fs-3 pb-2">Event Details</h3>
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="eventCategoryId" className="form-label w-25">
          Category
        </label>
        <select name="eventCategoryId" value={event?.eventCategoryId} onChange={onChange} className="w-75 form-select" aria-label="Default select example">
          {categories?.length > 0 &&
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="title" className="form-label w-25 ">
          Event
        </label>
        <input onChange={onChange} type="text" className="form-control py-2 w-75 " aria-describedby="emailHelp" name="title" value={event?.title} />
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="oneLiner" className="form-label w-25">
          One Liner
        </label>
        <input type="text" className="form-control py-2 w-75 " aria-describedby="emailHelp" name="oneLiner" onChange={onChange} value={event?.oneLiner} />
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="description" className="form-label w-25 ">
          Description
        </label>
        <textarea name="description" value={event?.description} onChange={onChange} className="form-control w-75 " id="description" rows="3"></textarea>
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="type" className="form-label w-25">
          Type
        </label>
        <select name="type" value={event?.type} onChange={onChange} className="form-select w-75">
          <option value="INDIVIDUAL">INDIVIDUAL</option>
          <option value="TEAM">TEAM</option>
        </select>
      </div>
      {/* <div className="mb-3 d-flex ">
        <label htmlFor="disableNotifications" className="form-label w-25 ">
          Disable Notifications
        </label>
        <div className="form-check w-75">
          <input name="disableNotifications" value={event?.description} type="checkbox" onChange={onChange} className="form-check"></input>
        </div>
      </div> */}
      <div className="mb-3 d-flex ">
        <label htmlFor="closeRegistration" className="form-label w-25 ">
          Close Registration
        </label>
        <div className="form-check w-75">
          <input name="closeRegistration" value={event?.closeRegistration} type="checkbox" onChange={onChange} className="form-check"></input>
        </div>
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="code" className="form-label w-25">
          Code
        </label>
        <input type="text" className="form-control py-2 w-75 " name="code" onChange={onChange} value={event?.code} />
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="eventMaster" className="form-label w-25">
          Event Master
        </label>
        <input type="text" className="form-control py-2 w-75 " name="eventMaster" onChange={onChange} value={event?.eventMaster} />
      </div>
      <div className="mb-3 d-flex">
        <label htmlFor="eventMasterPhone" className="form-label w-25">
          Event Master Phone
        </label>
        <input type="text" className="form-control py-2 w-75 " name="eventMasterPhone" onChange={onChange} value={event?.eventMasterPhone} />
      </div>
      <div className="my-4">
        <div className="d-flex align-items-center">
          <h3 className="m-0 p-0">Judges</h3>
          <Button variant="primary" size="sm" type="button" onClick={onAddJudge}>
            +
          </Button>
        </div>
        <div className="card p-3">
          {event?.judges.map((judge, index) => (
            <div key={`judge-${index}`} className=" d-flex gap-2 align-items-center p-2">
              <div className="mb-3" style={{width: "33%"}}>
                <input type="text" placeholder="Judge Name" className="form-control py-2 w-100 " name="judgeName" onChange={(e) => onJudgeChange(e, index)} value={judge?.name} />
              </div>
              <div className="mb-3" style={{width: "33%"}}>
                <input type="text" placeholder="Judge Phone" className="form-control py-2 w-100 " name="judgePhone" onChange={(e) => onJudgeChange(e, index)} value={judge?.phone} />
              </div>
              <div className="mb-3" style={{width: "33%"}}>
                <MdDelete onClick={() => onDeleteJudge(index)} className="text-danger fs-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EventInfo;
