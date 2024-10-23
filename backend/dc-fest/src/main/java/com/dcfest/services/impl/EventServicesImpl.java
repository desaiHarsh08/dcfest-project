package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.EventDto;
import com.dcfest.dtos.JudgeDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventModel;
import com.dcfest.repositories.EventRepository;
import com.dcfest.services.EventServices;
import com.dcfest.services.JudgeServices;
import com.dcfest.services.ParticipantServices;

@Service
public class EventServicesImpl implements EventServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JudgeServices judgeServices;

    @Autowired
    private ParticipantServices participantServices;

    @Override
    public EventDto createEvent(EventDto eventDto) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(eventDto.getAvailableEventId());
        // Create the event
        EventModel eventModel = this.modelMapper.map(eventDto, EventModel.class);
        eventModel.setAvailableEvent(availableEventModel);
        // Save the event
        eventModel = this.eventRepository.save(eventModel);

        // Create the judge -> will be done while creating a judge

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
        EventDto eventDto = this.getEventById(id);
        // Delete the judges
        for (JudgeDto judgeDto : eventDto.getJudges()) {
            this.judgeServices.deleteJudge(judgeDto.getId());
        }
        // Delete the participants
        this.participantServices.deleteParticipantsByEventId(id);
        // Delete the event
        this.eventRepository.deleteById(id);

        return true;
    }

    @Override
    public void deleteEventsByAvailableEventId(Long availableEventId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteEventsByAvailableEventId'");
    }

    private EventDto eventModelToDto(EventModel eventModel) {
        if (eventModel == null) {
            return null;
        }

        EventDto eventDto = this.modelMapper.map(eventModel, EventDto.class);
        eventDto.setAvailableEventId(eventModel.getAvailableEvent().getId());
        eventDto.setJudges(this.judgeServices.getJudgesByEventId(eventModel.getId()));
        eventDto.setParticipants(this.participantServices.getParticipantByEventId(1, eventModel.getId()));

        return eventDto;
    }

}
