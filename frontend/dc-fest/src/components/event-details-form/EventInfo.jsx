/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
const EventInfo = ({ categories, event, onChange }) => {
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
    </motion.div>
  );
};

export default EventInfo;
