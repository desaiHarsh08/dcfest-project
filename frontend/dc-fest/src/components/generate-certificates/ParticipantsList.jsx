/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { fetchParticipantsByCollegeId } from "../../services/participants-api";
import { fetchEvents } from "../../services/event-apis";
import ParticipantRow from "./ParticipantRow";
import { fetchCategories } from "../../services/categories-api";
import StatsCards from "./StatsCards";

export default function ParticipantsList({ selectedCollege, categories, setCategories, events, setEvents, participants, setParticipants, onGenerateCertificate }) {
  useEffect(() => {
    fetchParticipantsByCollegeId(selectedCollege?.id)
      .then((data) => {
        setParticipants(data);
      })
      .catch((err) => console.log(err));

    fetchCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.log(err));

    fetchEvents()
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => console.log(err));
  }, [selectedCollege]);

  let srno = 0;

  return (
    <div>
      <StatsCards participants={participants} />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Iccode</th>
            <th>Team</th>
            <th>Participant</th>
            <th>Category</th>
            <th>event</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, categoryIndex) => {
            return category?.availableEvents.map((availableEvent, availableEventIndex) => {
              const tmpEvent = events.find((e) => e.availableEventId == availableEvent.id);
              if (tmpEvent) {
                const tmpParticipants = participants?.filter((p) => p.eventIds.includes(tmpEvent.id));
                return tmpParticipants.map((participant, participantIndex) => {
                  srno += 1;
                  return (
                    <ParticipantRow
                      key={`participant-${participantIndex}-${categoryIndex}-${availableEventIndex}`}
                      srno={srno}
                      onGenerateCertificate={onGenerateCertificate}
                      participant={participant}
                      category={category}
                      availableEvent={availableEvent}
                      selectedCollege={selectedCollege}
                    />
                  );
                });
              }
            });
          })}
        </tbody>
      </Table>
    </div>
  );
}
