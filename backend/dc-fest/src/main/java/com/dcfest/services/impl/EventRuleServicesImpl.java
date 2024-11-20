package com.dcfest.services.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.EventRuleDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventRuleModel;
import com.dcfest.repositories.EventRuleRepository;
import com.dcfest.services.EventRuleServices;

@Service
public class EventRuleServicesImpl implements EventRuleServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventRuleRepository eventRuleRepository;

    @Override
    public EventRuleDto createEventRule(EventRuleDto eventRuleDto) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(eventRuleDto.getAvailableEventId());
        // Create the event_rule
        EventRuleModel eventRuleModel = this.modelMapper.map(eventRuleDto, EventRuleModel.class);
        eventRuleModel.setAvailableEvent(availableEventModel);

        // Save the event_rule
        eventRuleModel = this.eventRuleRepository.save(eventRuleModel);

        return this.eventRuleModelToDto(eventRuleModel);
    }

    @Override
    public List<EventRuleDto> getAllEventRules() {
        return this.eventRuleRepository.findAll().stream()
                .map(this::eventRuleModelToDto).toList();
    }

    @Override
    public List<EventRuleDto> getEventRulesByAvailableEventId(Long availableEventId) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(availableEventId);

        return this.eventRuleRepository.findByAvailableEvent(availableEventModel).stream()
                .map(this::eventRuleModelToDto).toList();
    }

    @Override
    public EventRuleDto getEventRuleById(Long id) {
        EventRuleModel foundEventRuleModel = this.eventRuleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `EVENT_RULE` exist for id: " + id));

        return this.eventRuleModelToDto(foundEventRuleModel);
    }

    @Override
    public EventRuleDto updateEventRule(EventRuleDto eventRuleDto) {
        if (eventRuleDto.getId() == null) {
            this.createEventRule(eventRuleDto);
        }
        EventRuleModel foundEventRuleModel = this.eventRuleRepository.findById(eventRuleDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No `EVENT_RULE` exist for id: " + eventRuleDto.getId()));
        // Update the fields
        foundEventRuleModel.setValue(eventRuleDto.getValue());
        // Save the changes
        foundEventRuleModel = this.eventRuleRepository.save(foundEventRuleModel);
        
        
        return this.eventRuleModelToDto(foundEventRuleModel);
    }

    @Override
    public boolean deleteEventRule(Long id) {
        this.getEventRuleById(id);
        // Delete the event_rule
        this.eventRuleRepository.deleteById(id);

        return true;
    }

    @Override
    public void deleteEventRulesByAvailableEventId(Long availableEventId) {
        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(new AvailableEventModel(availableEventId));
        for (EventRuleModel eventRuleModel: eventRuleModels) {
            this.deleteEventRule(eventRuleModel.getId());
        }
    }

    private EventRuleDto eventRuleModelToDto(EventRuleModel eventRuleModel) {
        if (eventRuleModel == null) {
            return null;
        }

        EventRuleDto eventRuleDto = this.modelMapper.map(eventRuleModel, EventRuleDto.class);
        eventRuleDto.setAvailableEventId(eventRuleModel.getAvailableEvent().getId());

        return eventRuleDto;
    }

}
