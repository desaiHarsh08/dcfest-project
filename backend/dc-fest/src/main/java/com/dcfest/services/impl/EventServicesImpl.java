package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.dcfest.models.ParticipantModel;
import com.dcfest.repositories.ParticipantRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.EventDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventModel;
import com.dcfest.repositories.EventRepository;
import com.dcfest.services.EventServices;

@Service
public class EventServicesImpl implements EventServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Override
    public EventDto createEvent(EventDto eventDto) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(eventDto.getAvailableEventId());
        // Create the event
        EventModel eventModel = this.modelMapper.map(eventDto, EventModel.class);
        eventModel.setAvailableEvent(availableEventModel);
        // Save the event
        eventModel = this.eventRepository.save(eventModel);

        // Create the participant -> will be done while creating a participant

        return this.eventModelToDto(eventModel);

    }

    @Override
    public List<EventDto> getAllEvents() {
        List<EventModel> eventModels = this.eventRepository.findAll();

        if (eventModels.isEmpty()) {
            return new ArrayList<>();
        }

        return eventModels.stream().map(this::eventModelToDto).collect(Collectors.toList());
    }

    @Override
    public EventDto getEventByAvailableEventId(Long availableEventId) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(availableEventId);

        EventModel foundEventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElseThrow(
                () -> new ResourceNotFoundException("No `EVENT` exist for available_event_id: " + availableEventId));

        return this.eventModelToDto(foundEventModel);
    }

    @Override
    public List<EventDto> getEventsByParticipantId(Long participantId) {
        List<EventModel> eventModels = this.eventRepository.findByParticipantId(participantId);

        if (eventModels.isEmpty()) {
            return new ArrayList<>();
        }

        return eventModels.stream().map(this::eventModelToDto).collect(Collectors.toList());
    }

    @Override
    public EventDto getEventById(Long id) {
        EventModel foundEventModel = this.eventRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `EVENT` exist for id: " + id));

        return this.eventModelToDto(foundEventModel);
    }

    @Override
    public boolean deleteEvent(Long id) {
        // Fetch the event by ID
        EventModel event = this.eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));

        // Remove the event from each participant's event list
        for (ParticipantModel participant : event.getParticipants()) {
            participant.getEvents().remove(event);
            this.participantRepository.save(participant);
        }

        // Clear participants and judges lists in the event itself
        event.getParticipants().clear();

        // Save the event after clearing relationships to update the join tables
        this.eventRepository.save(event);

        // Delete the event
        this.eventRepository.deleteById(id);

        return false;
    }

    @Override
    public void deleteEventsByAvailableEventId(Long availableEventId) {
        EventModel eventModel = this.eventRepository.findByAvailableEvent(new AvailableEventModel(availableEventId))
                .orElse(null);
        if (eventModel != null) {
            this.eventRepository.deleteById(eventModel.getId());
        }
    }

    private EventDto eventModelToDto(EventModel eventModel) {
        if (eventModel == null) {
            return null;
        }

        EventDto eventDto = this.modelMapper.map(eventModel, EventDto.class);
        System.out.println(eventModel.getParticipants().size());
        eventDto.setAvailableEventId(eventModel.getAvailableEvent().getId());

        return eventDto;
    }

}
