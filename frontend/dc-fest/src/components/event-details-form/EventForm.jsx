/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchCategories } from "../../services/categories-api";
import { fetchAvailableEventsBySlug } from "../../services/available-events-apis";
import { motion } from "framer-motion";
import PreviewModal from "./PreviewModal";
import EventRules from "./EventRules";
import EventRounds from "./EventRounds";
import EventInfo from "./EventInfo";
import { fetchEventTemplateRules } from "../../services/event-rule-templates-api";

const RULE_SEQ_NAME = [
  "REGISTERED_SLOTS_AVAILABLE",
  "MIN_PARTICIPANTS",
  "MAX_PARTICIPANTS",
  "MALE_PARTICIPANTS",
  "FEMALE_PARTICIPANTS",
  "NO_OF_PARTICIPANTS",
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

export default function EventForm({ event, setEvent, formType = "Add", onConfirmAction }) {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventRounds, setEventRounds] = useState(formType.toLowerCase() == "add" ? rounds : event?.rounds);
  const [categories, setCategories] = useState([]);
  const [ruleTemplates, setRuleTemplates] = useState([]);

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

      if (formType.toLowerCase() == "add") {
        const eventRules = [];
        for (let i = 0; i < RULE_SEQ_NAME.length; i++) {
          const ruleTemp = data.find((ele) => ele.name == RULE_SEQ_NAME[i]);
          if (ruleTemp) {
            eventRules.push({
              value: "",
              eventRuleTemplate: ruleTemp,
            });
          }
        }
        const ruleTemplate = data.find((ele) => ele.name == "NOTE");
        if (ruleTemplate) {
          for (let i = 0; i < 5; i++) {
            eventRules.push({ value: "", eventRuleTemplate: ruleTemplate });
          }
        }

        setEvent((prev) => ({ ...prev, eventRules, rounds }));
      }
    });
  }, []);

  const handleAddJudge = () => {
    const newEvent = { ...event };
    newEvent.judges.push({
      name: "",
      phone: "",
    });

    console.log("new judge:", newEvent);
    setEvent(newEvent);
  };

  const handleDeleteJudge = (judgeIndex) => {
    const newEvent = { ...event };
    newEvent.judges = newEvent.judges.filter((judge, idx) => idx != judgeIndex);
    setEvent(newEvent);
  };

  const handleJudgeChange = (e, index) => {
    const { name, value } = e.target;
    const newEvent = { ...event };
    newEvent.judges = newEvent.judges.map((judge, idx) => {
      if (idx == index) {
        if (name == "judgeName") {
          return { ...judge, name: value };
        } else {
          return { ...judge, phone: value };
        }
      }
      return judge;
    });

    setEvent(newEvent);
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

  const handleChangeRule = (e, ruleIndex, isRTE) => {
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.map((ele, index) => {
      if (index === ruleIndex) {
        if (isRTE && ele.eventRuleTemplate.name == "NOTE") {
          return { ...ele, value: e };
        }
        const { name, value, checked } = e.target;
        if (name == "eventRuleTemplate") {
          const eventRuleTemplate = ruleTemplates.find((r) => r.id == value);
          console.log(eventRuleTemplate);
          return { ...ele, [name]: eventRuleTemplate };
        }

        console.log(`ele.eventRuleTemplate.name: ${ele.eventRuleTemplate.name}`);
        if (ele.eventRuleTemplate.name == "OTSE") {
          return { ...ele, [name]: checked };
        }

        return { ...ele, [e.target.name]: e.target.value };
      }

      return ele;
    });

    setEvent(newEvent);
  };

  const handleChangeRound = (e, roundIndex) => {
    const { name, value } = e.target;
    console.log(`${name}: ${value}`);

    let newEventRounds = [...eventRounds];
    newEventRounds = newEventRounds.map((round, index) => {
      if (roundIndex == index) {
        console.log(round);
        if (name == "startTime" || name == "endTime") {
          return { ...round, [name]: `${round.startDate}T${value}` };
        }
        if (name == "endTime") {
          return { ...round, [name]: `${round.endDate}T${value}` };
        }
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

    if (formType.toLowerCase() == "add") {
      try {
        const response = await fetchAvailableEventsBySlug(event.slug);
        console.log(response);
        alert("Please provide the unique event title");
        return;
      } catch (error) {
        console.log(error);
      }
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
      .map((r) => {
        if (formType.toLowerCase() == "add") {
          let startTime = r.startTime;
          let endTime = r.endTime;
          if (!r.startTime.includes(r.startDate)) {
            startTime = `${r.startDate}T${r.startTime}`;
          }

          if (!r.endTime.includes(r.endTime)) {
            startTime = `${r.endDate}T${r.endTime}`;
          }
          return {
            ...r,
            startDate: r.startDate ? formatDate(new Date(r.startDate)) : null,
            endDate: r.endDate ? formatDate(new Date(r.endDate)) : null,
            startTime: startTime,
            endTime: endTime,
          };
        } else {
          return r;
        }
      });

    let newEvent = { ...event, rounds: validRounds };
    console.log("newEvent:", newEvent);
    setEvent(newEvent);

    setLoading(true);
    console.log(" confirm, newEvent:", newEvent);
    try {
      console.log("updating:", newEvent);
      await onConfirmAction(newEvent);

      alert("Event Successfully saved!");
    } catch (error) {
      console.log(error);
    } finally {
      // Close the modal after submission
      setShowPreview(false);
    }
    setLoading(false);
  };

  const handleClosePreview = () => {
    // Close the preview modal without submitting
    setShowPreview(false);
  };

  const handleAddRound = () => {
    const newEvent = { ...event };
    newEvent.rounds.push({
      roundType: roundType[0],
      status: "NOT_STARTED",
      note: "",
      disableNotifications: false,
      qualifyNumber: 1,
      venue: "",
      startDate: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`,
      endDate: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`,
      startTime: new Date(),
      endTime: new Date(),
    });

    setEvent(newEvent);
  };

  const handleDeleteRound = (roundIndex) => {
    console.log("in delete, roundIndex:", roundIndex);
    const newEvent = { ...event };
    console.log("in delete, before:", newEvent.rounds);
    newEvent.rounds = newEvent.rounds.filter((_, idx) => idx != roundIndex);
    console.log("in delete, after:", newEvent.rounds);
    setEvent(newEvent);
  };

  return (
    <motion.div className="container mt-5 pb-5 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center text-primary mb-4">{formType} Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <EventInfo categories={categories} event={event} onChange={handleChange} onAddJudge={handleAddJudge} onDeleteJudge={handleDeleteJudge} onJudgeChange={handleJudgeChange} />
          <EventRounds eventRounds={event.rounds} onChange={handleChangeRound} onAddRound={handleAddRound} onDeleteRound={handleDeleteRound} />
          <EventRules ruleTemplates={ruleTemplates} event={event} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onChangeRule={handleChangeRule} />
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button type="submit" disabled={loading} className="btn btn-success btn-lg">
            {loading ? "Adding..." : "Submit Event"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <PreviewModal show={showPreview} event={event} isLoading={loading} formType="UPDATE" onClose={handleClosePreview} onConfirm={handleConfirmSubmit} />
    </motion.div>
  );
}
