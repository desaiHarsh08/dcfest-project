// import { useEffect, useState } from "react";
// import { addAvailableEvent, fetchCategories } from "../services/categories-api";
// import EventInfo from "../components/event-details-form/EventInfo";
// import EventRules from "../components/event-details-form/EventRules";
// import EventRounds from "../components/event-details-form/EventRounds";
// import { fetchEventTemplateRules } from "../services/event-rule-templates-api";

// const AddEventPage = () => {
//   const [categories, setCategories] = useState([]);
//   const [ruleTemplates, setRuleTemplates] = useState([]);
//   const [event, setEvent] = useState({
//     title: "",
//     oneLiner: "",
//     description: "",
//     slug: "",
//     type: "INDIVIDUAL",
//     eventCategoryId: null,
//     eventRules: [],
//     rounds: [
//       {
//         roundType: "PRELIMINARY",
//         qualifyNumber: 2,
//         status: "NOT_STARTED",
//         note: "",
//         disableNotifications: false,
//         venues: [
//           {
//             name: "",
//             roundId: undefined,
//             start: "",
//             end: "",
//           },
//         ],
//       },
//     ],
//   });

//   useEffect(() => {
//     fetchCategories()
//       .then((data) => {
//         console.log(data);
//         setCategories(data);
//         setEvent((prev) => ({ ...prev, eventCategoryId: data[0]?.id }));
//       })
//       .catch((error) => console.log(error));
//   }, []);

//   useEffect(() => {
//     fetchEventTemplateRules().then((data) => {
//       console.log("rule templates:", data);
//       setRuleTemplates(data);
//       setEvent((prev) => ({
//         ...prev,
//         eventRules: [
//           {
//             value: "",
//             eventRuleTemplate: data[0],
//           },
//         ],
//       }));
//     });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEvent((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddRound = () => {
//     const newEvent = { ...event };
//     const newRounds = [
//       {
//         roundType: "PRELIMINARY",
//         qualifyNumber: 2,
//         status: "NOT_STARTED",
//         note: "",
//         disableNotifications: false,
//         venues: [
//           {
//             name: "",
//             roundId: undefined,
//             start: new Date(),
//             end: new Date(),
//           },
//         ],
//       },
//       ...newEvent.rounds,
//     ];
//     newEvent.rounds = newRounds;

//     setEvent(newEvent);
//   };

//   const handleAddRule = () => {
//     const newEvent = { ...event };
//     newEvent.eventRules = [
//       {
//         eventRuleTemplate: ruleTemplates[0],
//         value: "",
//       },
//       ...newEvent.eventRules,
//     ];

//     setEvent(newEvent);
//   };

//   const handleDeleteRule = (ruleIndex) => {
//     const newEvent = { ...event };
//     newEvent.eventRules = newEvent.eventRules.filter((ele, index) => index != ruleIndex);

//     setEvent(newEvent);
//   };

//   const handleChangeRule = (e, ruleIndex) => {
//     const { name, value } = e.target;
//     const newEvent = { ...event };
//     newEvent.eventRules = newEvent.eventRules.map((ele, index) => {
//       if (index === ruleIndex) {
//         console.log("name:", name, value);
//         //   console.log(eventRuleTemplate)
//         if (name == "eventRuleTemplate") {
//           const eventRuleTemplate = ruleTemplates.find((r) => r.id == value);
//           console.log(eventRuleTemplate);
//           return { ...ele, [name]: eventRuleTemplate };
//         }

//         return { ...ele, [name]: value };
//       }

//       return ele;
//     });

//     setEvent(newEvent);
//   };

//   const handleDeleteRound = (roundIndex) => {
//     const newEvent = { ...event };
//     newEvent.rounds = newEvent.rounds.filter((ele, index) => index != roundIndex);

//     setEvent(newEvent);
//   };

//   const handleChangeRound = (e, roundIndex) => {
//     const { name, value } = e.target;
//     const newEvent = { ...event };
//     newEvent.rounds = newEvent.rounds.map((round, index) => {
//       if (roundIndex == index) {
//         return { ...round, [name]: value };
//       }
//       return round;
//     });

//     setEvent(newEvent);
//   };

//   const handleAddVenue = (roundIndex) => {
//     const newEvent = { ...event };
//     newEvent.rounds = newEvent.rounds.map((round, index) => {
//       if (roundIndex == index) {
//         const newRound = { ...round };
//         newRound.venues = [
//           {
//             name: "",
//             roundId: undefined,
//             start: "",
//             end: "",
//           },
//           ...newRound.venues,
//         ];

//         return newRound;
//       }

//       return round;
//     });

//     setEvent(newEvent);
//   };

//   const handleDeleteVenue = (roundIndex, venueIndex) => {
//     const newEvent = { ...event };
//     newEvent.rounds = newEvent.rounds.map((round, index) => {
//       if (roundIndex == index) {
//         const newRound = { ...round };
//         newRound.venues = newRound.venues.filter((_, idx) => idx != venueIndex);

//         return newRound;
//       }

//       return round;
//     });

//     setEvent(newEvent);
//   };

//   const handleVenueChange = (e, roundIndex, venueIndex) => {
//     const { name, value } = e.target;
//     const newEvent = { ...event };
//     newEvent.rounds = newEvent.rounds.map((round, index) => {
//       if (roundIndex == index) {
//         const newRound = { ...round };
//         newRound.venues = newRound.venues.map((venue, idx) => {
//           if (idx == venueIndex) {
//             return { ...venue, [name]: value };
//           }
//         });

//         return newRound;
//       }

//       return round;
//     });

//     setEvent(newEvent);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("new event:", event);
//     try {
//       const response = await addAvailableEvent(event);
//       console.log(response);
//       alert("Event Successfully added!");
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="p-3">
//       <h1 className="border-bottom pb-2">Add Event</h1>
//       <form className="row" onSubmit={handleSubmit}>
//         <div className="d-flex mt-5">
//           <button>Submit</button>
//         </div>
//         <div className="col-3 px-4">
//           <EventInfo categories={categories} event={event} onChange={handleChange} />
//         </div>
//         <div className="col-4 border-start border-end px-4">
//           <EventRules ruleTemplates={ruleTemplates} event={event} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onChangeRule={handleChangeRule} />
//         </div>
//         <div className="col-5 px-4">
//           <EventRounds
//             event={event}
//             onAddRound={handleAddRound}
//             onDeleteRound={handleDeleteRound}
//             onChange={handleChangeRound}
//             onAddVenue={handleAddVenue}
//             onDeleteVenue={handleDeleteVenue}
//             onChangeVenue={handleVenueChange}
//           />
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEventPage;

import { useEffect, useState } from "react";
import { addAvailableEvent, fetchCategories } from "../services/categories-api";
import EventInfo from "../components/event-details-form/EventInfo";
import EventRules from "../components/event-details-form/EventRules";
import EventRounds from "../components/event-details-form/EventRounds";
import { fetchEventTemplateRules } from "../services/event-rule-templates-api";
import { motion } from "framer-motion";
import PreviewModal from "../components/event-details-form/PreviewModal";

const AddEventPage = () => {
  const [showPreview, setShowPreview] = useState(false);

  const [categories, setCategories] = useState([]);
  const [ruleTemplates, setRuleTemplates] = useState([]);
  const [event, setEvent] = useState({
    title: "",
    oneLiner: "",
    description: "",
    slug: "",
    type: "INDIVIDUAL",
    eventCategoryId: null,
    eventRules: [],
    rounds: [
      {
        roundType: "PRELIMINARY",
        qualifyNumber: 2,
        status: "NOT_STARTED",
        note: "",
        disableNotifications: false,
        venues: [
          {
            name: "",
            roundId: undefined,
            start: "",
            end: "",
          },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log(data);
        setCategories(data);
        setEvent((prev) => ({ ...prev, eventCategoryId: data[0]?.id }));
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchEventTemplateRules().then((data) => {
      console.log("rule templates:", data);
      setRuleTemplates(data);
      setEvent((prev) => ({
        ...prev,
        eventRules: [
          {
            value: "",
            eventRuleTemplate: data[0],
          },
        ],
      }));
    });
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase() // convert to lowercase
      .trim() // remove leading/trailing spaces
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/[^\w-]+/g, ""); // remove non-alphanumeric characters except hyphens
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the title changes, update the slug automatically
    if (name === "title") {
      setEvent((prev) => {
        const updatedEvent = { ...prev, [name]: value };
        updatedEvent.slug = generateSlug(value); // generate the slug from the title
        console.log(updatedEvent);
        return updatedEvent;
      });
    } else {
      setEvent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRound = () => {
    const newEvent = { ...event };
    const newRounds = [
      {
        roundType: "PRELIMINARY",
        qualifyNumber: 2,
        status: "NOT_STARTED",
        note: "",
        disableNotifications: false,
        venues: [
          {
            name: "",
            roundId: undefined,
            start: new Date(),
            end: new Date(),
          },
        ],
      },
      ...newEvent.rounds,
    ];
    newEvent.rounds = newRounds;

    setEvent(newEvent);
  };

  const handleAddRule = () => {
    const newEvent = { ...event };
    newEvent.eventRules = [
      {
        eventRuleTemplate: ruleTemplates[0],
        value: "",
      },
      ...newEvent.eventRules,
    ];

    setEvent(newEvent);
  };

  const handleDeleteRule = (ruleIndex) => {
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.filter((ele, index) => index != ruleIndex);

    setEvent(newEvent);
  };

  const handleChangeRule = (e, ruleIndex) => {
    const { name, value } = e.target;
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.map((ele, index) => {
      if (index === ruleIndex) {
        console.log("name:", name, value);
        if (name == "eventRuleTemplate") {
          const eventRuleTemplate = ruleTemplates.find((r) => r.id == value);
          console.log(eventRuleTemplate);
          return { ...ele, [name]: eventRuleTemplate };
        }

        return { ...ele, [name]: value };
      }

      return ele;
    });

    setEvent(newEvent);
  };

  const handleDeleteRound = (roundIndex) => {
    const newEvent = { ...event };
    newEvent.rounds = newEvent.rounds.filter((ele, index) => index != roundIndex);

    setEvent(newEvent);
  };

  const handleChangeRound = (e, roundIndex) => {
    const { name, value } = e.target;
    const newEvent = { ...event };
    newEvent.rounds = newEvent.rounds.map((round, index) => {
      if (roundIndex == index) {
        return { ...round, [name]: value };
      }
      return round;
    });

    setEvent(newEvent);
  };

  const handleAddVenue = (roundIndex) => {
    const newEvent = { ...event };
    newEvent.rounds = newEvent.rounds.map((round, index) => {
      if (roundIndex == index) {
        const newRound = { ...round };
        newRound.venues = [
          {
            name: "",
            roundId: undefined,
            start: "",
            end: "",
          },
          ...newRound.venues,
        ];

        return newRound;
      }

      return round;
    });

    setEvent(newEvent);
  };

  const handleDeleteVenue = (roundIndex, venueIndex) => {
    const newEvent = { ...event };
    newEvent.rounds = newEvent.rounds.map((round, index) => {
      if (roundIndex == index) {
        const newRound = { ...round };
        newRound.venues = newRound.venues.filter((_, idx) => idx != venueIndex);

        return newRound;
      }

      return round;
    });

    setEvent(newEvent);
  };

  const handleVenueChange = (e, roundIndex, venueIndex) => {
    const { name, value } = e.target;
    const newEvent = { ...event };
    newEvent.rounds = newEvent.rounds.map((round, index) => {
      if (roundIndex == index) {
        const newRound = { ...round };
        newRound.venues = newRound.venues.map((venue, idx) => {
          if (idx == venueIndex) {
            return { ...venue, [name]: value };
          }
        });

        return newRound;
      }

      return round;
    });

    setEvent(newEvent);
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     console.log("new event:", event);
  //     try {
  //       const response = await addAvailableEvent(event);
  //       console.log(response);
  //       alert("Event Successfully added!");
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Open the preview modal
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    // Submit the event
    try {
      const response = await addAvailableEvent(event);
      console.log(response);
      alert("Event Successfully added!");
    } catch (error) {
      console.log(error);
    } finally {
      // Close the modal after submission
      setShowPreview(false);
    }
  };

  const handleClosePreview = () => {
    // Close the preview modal without submitting
    setShowPreview(false);
  };

  return (
    <motion.div className="container mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center text-primary mb-4">Add New Event</h1>
      <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-center mt-4">
          <button type="submit" className="btn btn-success btn-lg">
            Submit Event
          </button>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <EventInfo categories={categories} event={event} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <EventRules ruleTemplates={ruleTemplates} event={event} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onChangeRule={handleChangeRule} />
          </div>
          <div className="col-md-4">
            <EventRounds
              event={event}
              onAddRound={handleAddRound}
              onDeleteRound={handleDeleteRound}
              onChange={handleChangeRound}
              onAddVenue={handleAddVenue}
              onDeleteVenue={handleDeleteVenue}
              onChangeVenue={handleVenueChange}
            />
          </div>
        </div>

        
      </form>

      {/* Preview Modal */}
      <PreviewModal show={showPreview} event={event} onClose={handleClosePreview} onConfirm={handleConfirmSubmit} />
    </motion.div>
  );
};

export default AddEventPage;
