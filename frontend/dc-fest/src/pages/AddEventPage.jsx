import { useEffect, useState } from "react";
import { addAvailableEvent, fetchCategories } from "../services/categories-api";
import EventInfo from "../components/event-details-form/EventInfo";
import EventRules from "../components/event-details-form/EventRules";
import EventRounds from "../components/event-details-form/EventRounds";
import { fetchEventTemplateRules } from "../services/event-rule-templates-api";

const AddEventPage = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRound = () => {
    const newEvent = { ...event };
    newEvent.rounds.push({
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
    });

    setEvent(newEvent);
  };

  const handleAddRule = () => {
    const newEvent = { ...event };
    newEvent.eventRules.push({
      eventRuleTemplate: ruleTemplates[0],
      value: "",
    });

    setEvent(newEvent);
  };

  const handleDeleteRule = (ruleIndex) => {
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.filter(
      (ele, index) => index != ruleIndex
    );

    setEvent(newEvent);
  };

  const handleChangeRule = (e, ruleIndex) => {
    const { name, value } = e.target;
    const newEvent = { ...event };
    newEvent.eventRules = newEvent.eventRules.map((ele, index) => {
      if (index === ruleIndex) {
        console.log("name:", name, value);
        //   console.log(eventRuleTemplate)
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
    newEvent.rounds = newEvent.rounds.filter(
      (ele, index) => index != roundIndex
    );

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
          ...newRound.venues,
          {
            name: "",
            roundId: undefined,
            start: "",
            end: "",
          },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("new event:", event);
    try {
      const response = await addAvailableEvent(event);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3">
      <h1 className="border-bottom pb-2">Add Event</h1>
      <form className="row" onSubmit={handleSubmit}>
        <div className="d-flex mt-5">
          <button>Submit</button>
        </div>
        <div className="col-3 px-4">
          <EventInfo
            categories={categories}
            event={event}
            onChange={handleChange}
          />
        </div>
        <div className="col-4 border-start border-end px-4">
          <EventRules
            ruleTemplates={ruleTemplates}
            event={event}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onChangeRule={handleChangeRule}
          />
        </div>
        <div className="col-5 px-4">
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
      </form>
    </div>
  );
};

export default AddEventPage;
