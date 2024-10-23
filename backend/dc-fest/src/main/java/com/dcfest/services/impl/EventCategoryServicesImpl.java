package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.AvailableEventDto;
import com.dcfest.dtos.EventCategoryDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.EventCategoryModel;
import com.dcfest.repositories.EventCategoryRepository;
import com.dcfest.services.AvailableEventServices;
import com.dcfest.services.EventCategoryServices;

@Service
public class EventCategoryServicesImpl implements EventCategoryServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventCategoryRepository eventCategoryRepository;

    @Autowired
    private AvailableEventServices availableEventServices;

    @Override
    public EventCategoryDto createEventCategory(EventCategoryDto eventCategoryDto) {
        // Create the event_category
        EventCategoryModel eventCategoryModel = this.modelMapper.map(eventCategoryDto, EventCategoryModel.class);
        eventCategoryModel = this.eventCategoryRepository.save(eventCategoryModel);

        // Create the available events
        for (AvailableEventDto availableEventDto : eventCategoryDto.getAvailableEvents()) {
            availableEventDto.setEventCategoryId(eventCategoryModel.getId());
            this.availableEventServices.createAvailableEvent(availableEventDto);
        }

        return this.eventCategoryModelToDto(eventCategoryModel);
    }

    @Override
    public List<EventCategoryDto> getAllEventCategory() {
        return this.eventCategoryRepository.findAll().stream()
                .map(this::eventCategoryModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EventCategoryDto getEventCategoryById(Long id) {
        EventCategoryModel foundEventCategoryModel = this.eventCategoryRepository.findById(id).orElseThrow(
            () -> new ResourceNotFoundException("No EVENT_CATEGORY exist for id: " + id)
        );

        return this.eventCategoryModelToDto(foundEventCategoryModel);
    }

    @Override
    public EventCategoryDto updateEventCategory(EventCategoryDto eventCategoryDto) {
        EventCategoryModel foundEventCategoryModel = this.eventCategoryRepository.findById(eventCategoryDto.getId()).orElseThrow(
            () -> new ResourceNotFoundException("No EVENT_CATEGORY exist for id: " + eventCategoryDto.getId())
        );

        // Update the fields
        foundEventCategoryModel.setName(eventCategoryDto.getName());
        // Save the changes
        foundEventCategoryModel = this.eventCategoryRepository.save(foundEventCategoryModel);

        return this.eventCategoryModelToDto(foundEventCategoryModel);
    }

    @Override
    public boolean deleteEventCategory(Long id) {
        EventCategoryDto eventCategoryDto = this.getEventCategoryById(id);
        // Delete all the available_events
        for (AvailableEventDto availableEventDto: eventCategoryDto.getAvailableEvents()) {
            this.availableEventServices.deleteAvailableEvent(availableEventDto.getId());
        }
        // Delete the category
        this.eventCategoryRepository.deleteById(id);

        return true;
    }

    private EventCategoryDto eventCategoryModelToDto(EventCategoryModel eventCategoryModel) {
        if (eventCategoryModel == null) {
            return null;
        }
        EventCategoryDto eventCategoryDto = this.modelMapper.map(eventCategoryModel, EventCategoryDto.class);
        eventCategoryDto.setAvailableEvents(
                this.availableEventServices.getAvailableEventsByCategoryId(eventCategoryDto.getId()));

        return eventCategoryDto;
    }

}
