/* eslint-disable react/prop-types */
const EventInfo = ({ categories, event, onChange }) => {
  return (
    <>
      <div className="border-bottom mb-4">
        <h3 className="fs-3 pb-2">Event Details</h3>
      </div>
      <div className="mb-3">
        <label htmlFor="eventCategoryId" className="form-label">
          Category
        </label>
        <select
          name="eventCategoryId"
          value={event?.eventCategoryId}
          onChange={onChange}
          className="form-select"
          aria-label="Default select example"
        >
          {categories?.length > 0 &&
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Event
        </label>
        <input
          onChange={onChange}
          type="text"
          className="form-control py-2"
          aria-describedby="emailHelp"
          name="title"
          value={event?.title}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="oneLiner" className="form-label">
          One Liner
        </label>
        <input
          type="text"
          className="form-control py-2"
          aria-describedby="emailHelp"
          name="oneLiner"
          onChange={onChange}
          value={event?.oneLiner}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          name="description"
          value={event?.description}
          onChange={onChange}
          className="form-control"
          id="description"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="type" className="form-label">
          Type
        </label>
        <select
          name="type"
          value={event?.type}
          onChange={onChange}
          className="form-select"
        >
          <option value="INDIVIDUAL">INDIVIDUAL</option>
          <option value="TEAM">TEAM</option>
        </select>
      </div>
    </>
  );
};

export default EventInfo;
