import { useEffect, useState } from "react";
import { addAvailableEvent, fetchCategories } from "../services/categories-api";
import EventInfo from "../components/event-details-form/EventInfo";
import EventRules from "../components/event-details-form/EventRules";
import EventRounds from "../components/event-details-form/EventRounds";
import { fetchEventTemplateRules } from "../services/event-rule-templates-api";
import { motion } from "framer-motion";
import PreviewModal from "../components/event-details-form/PreviewModal";
import { fetchAvailableEventsBySlug } from "../services/available-events-apis";

const RULE_SEQ_NAME = [
  "REGISTERED_SLOTS_AVAILABLE",
  "MIN_PARTICIPANTS",
  "MAX_PARTICIPANTS",
  "MALE_PARTICIPANTS",
  "FEMALE_PARTICIPANTS",
  "COLLEGE_ACOMPANIST",
  "OTSE_SLOTS",
  "TIME_LIMIT",
  "THEME",
  "LANGUAGE",
  "OTSE",
  "NOTE",
];

const roundType = ["PRELIMINARY", "QUARTER", "SEMI_FINAL", "FINAL"];
const rounds = [];
for (let i = 0; i < roundType.length; i++) {
  rounds.push({
    roundType: roundType[i],
    status: "NOT_STARTED",
    note: "",
    disableNotifications: false,
    qualifyNumber: 1,
    venue: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  });
}

const AddEventPage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventRounds, setEventRounds] = useState(rounds);
  const [categories, setCategories] = useState([]);
  const [ruleTemplates, setRuleTemplates] = useState([]);
  const [event, setEvent] = useState({
    title: "",
    oneLiner: "",
    closeRegistration: false,
    description: "",
    slug: "",
    type: "INDIVIDUAL",
    eventCategoryId: null,
    eventRules: [],
    rounds: [],
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

    //   const eventRules = [];
    //   for (let i = 0; i < RULE_SEQ_NAME.length; i++) {
    //     const ruleTemp = data.find((ele) => ele.name == RULE_SEQ_NAME[i]);
    //     if (ruleTemp) {
    //       eventRules.push({
    //         value: "",
    //         eventRuleTemplate: ruleTemp,
    //       });
    //     }
    //   }

    //   const ruleTemplate = data.find((ele) => ele.name == "NOTE");
    //   if (ruleTemplate) {
    //     for (let i = 0; i < 5; i++) {
    //       eventRules.push({ value: "", eventRuleTemplate: ruleTemplate });
    //     }
    //   }


      setEvent((prev) => ({ ...prev, eventRules: handleDefaultEventRules(data), rounds }));
    });
  }, []);

  const handleDefaultEventRules = (ruleTemplates) => {
    const eventRules = [];
    for (let i = 0; i < RULE_SEQ_NAME.length; i++) {
      const ruleTemp = ruleTemplates.find((ele) => ele.name == RULE_SEQ_NAME[i]);
      if (ruleTemp) {
        eventRules.push({
          value: "",
          eventRuleTemplate: ruleTemp,
        });
      }
    }

    const ruleTemplate = ruleTemplates.find((ele) => ele.name == "NOTE");
    if (ruleTemplate) {
      for (let i = 0; i < 5; i++) {
        eventRules.push({ value: "", eventRuleTemplate: ruleTemplate });
      }
    }

    return eventRules;
  };

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

  const handleAddRule = () => {
    const newEvent = { ...event };
    newEvent.eventRules = [
      ...newEvent.eventRules,
      {
        eventRuleTemplate: ruleTemplates[0],
        value: "",
      },
    ];
    alert("Rule added, please scroll the rule's section");

    setEvent(newEvent);
  };

  const handleDeleteRule = (ruleIndex) => {
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.filter((ele, index) => index != ruleIndex);

    setEvent(newEvent);
  };

  const handleChangeRule = (e, ruleIndex) => {
    const { name, value, checked } = e.target;
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.map((ele, index) => {
      if (index === ruleIndex) {
        console.log("name:", name, value, checked);
        if (name == "eventRuleTemplate") {
          const eventRuleTemplate = ruleTemplates.find((r) => r.id == value);
          console.log(eventRuleTemplate);
          return { ...ele, [name]: eventRuleTemplate };
        }
        console.log(`ele.eventRuleTemplate.name: ${ele.eventRuleTemplate.name}`);
        if (ele.eventRuleTemplate.name == "OTSE") {
          return { ...ele, [name]: checked };
        }

        return { ...ele, [name]: value };
      }

      return ele;
    });

    setEvent(newEvent);
  };

  const handleChangeRound = (e, roundIndex) => {
    const { name, value } = e.target;
    let newEventRounds = [...eventRounds];
    newEventRounds = newEventRounds.map((round, index) => {
      if (roundIndex == index) {
        return { ...round, [name]: value };
      }
      return round;
    });

    setEventRounds(newEventRounds);
    setEvent((prev) => ({ ...prev, rounds: newEventRounds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (event.title == null || event.title == undefined || event.title.trim() == "") {
      alert("Please provide the event title!");
      return;
    }
    if (event.eventRules.length === 0) {
      alert("Please provide the rules!");
      return;
    }
    if (event.rounds.length === 0) {
      alert("Please provide the rounds!");
      return;
    }

    const existRegisteredSlots = event.eventRules.find((ele) => ele.eventRuleTemplate.id == 6);
    if (!existRegisteredSlots) {
      alert("Please provide the REGISTERED_SLOTS_AVAILABLE");
      return;
    }

    console.log("creating event:", event);

    const validRounds = event.rounds.filter((r) => r.venue.trim() != "");
    console.log("validRounds:", validRounds);
    if (validRounds.length == 0) {
      alert("Please provide the rounds (Round with empty input for venue is ignored).");
      return;
    }

    console.log(`event.title: ${event.title}, event.slug: ${event.slug}`);

    try {
      const response = await fetchAvailableEventsBySlug(event.slug);
      console.log(response);
      alert("Please provide the unique event title");
      return;
    } catch (error) {
      console.log(error);
    }

    // Open the preview modal
    setShowPreview(true);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleConfirmSubmit = async () => {
    // Submit the event
    const validRounds = event.rounds
      .filter((r) => r.venue.trim() !== "") // Filter rounds with non-empty venues
      .map((r) => ({
        ...r,
        startDate: r.startDate ? formatDate(new Date(r.startDate)) : null,
        endDate: r.endDate ? formatDate(new Date(r.endDate)) : null,
        startTime: `${r.startDate}T${r.startTime}`,
        endTime: `${r.endDate}T${r.endTime}`,
      }));

    let newEvent = { ...event, rounds: validRounds };
    console.log("newEvent:", newEvent);
    setEvent(newEvent);

    setLoading(true);
    console.log(" confirm, newEvent:", newEvent);
    try {
      const response = await addAvailableEvent(newEvent);
      console.log(response);
      alert("Event Successfully added!");
    } catch (error) {
      console.log(error);
    } finally {
      // Close the modal after submission
      setShowPreview(false);
    }
    setLoading(false);

    setEvent({
      title: "",
      oneLiner: "",
      closeRegistration: false,
      description: "",
      slug: "",
      type: "INDIVIDUAL",
      eventCategoryId: null,
      eventRules: handleDefaultEventRules(ruleTemplates),
      rounds,
    });
  };

  const handleClosePreview = () => {
    // Close the preview modal without submitting
    setShowPreview(false);
  };

  return (
    <motion.div className="container mt-5 pb-5 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center text-primary mb-4">Add New Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <EventInfo categories={categories} event={event} onChange={handleChange} />
          <EventRounds eventRounds={eventRounds} onChange={handleChangeRound} />
          <EventRules ruleTemplates={ruleTemplates} event={event} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onChangeRule={handleChangeRule} />
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button type="submit" disabled={loading} className="btn btn-success btn-lg">
            {loading ? "Adding..." : "Submit Event"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <PreviewModal show={showPreview} event={event} isLoading={loading} onClose={handleClosePreview} onConfirm={handleConfirmSubmit} />
    </motion.div>
  );
};

export default AddEventPage;
