package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.AvailableEventDto;
import com.dcfest.dtos.EventDto;
import com.dcfest.dtos.EventRuleDto;
import com.dcfest.dtos.RoundDto;
import com.dcfest.dtos.VenueDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventCategoryModel;
import com.dcfest.models.NotificationLogModel;
import com.dcfest.repositories.AvailableEventRepository;
import com.dcfest.repositories.NotificationLogRepository;
import com.dcfest.services.AvailableEventServices;
import com.dcfest.services.EventRuleServices;
import com.dcfest.services.EventServices;
import com.dcfest.services.RoundServices;
import com.dcfest.services.VenueServices;

@Service
public class AvailableEventServicesImpl implements AvailableEventServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private EventRuleServices eventRuleServices;

    @Autowired
    private VenueServices venueServices;

    @Autowired
    private EventServices eventServices;

    @Autowired
    private RoundServices roundServices;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Override
    public AvailableEventDto createAvailableEvent(AvailableEventDto availableEventDto) {
        EventCategoryModel eventCategoryModel = new EventCategoryModel();
        eventCategoryModel.setId(availableEventDto.getEventCategoryId());

        // Create the available_event
        AvailableEventModel availableEventModel = this.modelMapper.map(availableEventDto, AvailableEventModel.class);
        availableEventModel.setEventCategory(eventCategoryModel);

        // Save the available_event
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        // Save the event_rules
        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
            eventRuleDto.setAvailableEventId(availableEventModel.getId());
            this.eventRuleServices.createEventRule(eventRuleDto);
        }

        // Save the venue
        for (VenueDto venueDto : availableEventDto.getVenues()) {
            venueDto.setAvailableEventId(availableEventModel.getId());
            this.venueServices.createVenue(venueDto);
        }

        // Create the event
        EventDto eventDto = new EventDto();
        eventDto.setAvailableEventId(availableEventModel.getId());
        this.eventServices.createEvent(eventDto);

        for (RoundDto roundDto : availableEventDto.getRounds()) {
            roundDto.setAvailableEventId(availableEventModel.getId());
            this.roundServices.createRound(roundDto);
        }

        return this.availableEventModelToDto(availableEventModel);
    }

    @Override
    public List<AvailableEventDto> getAllAvailableEvents() {
        return this.availableEventRepository.findAll().stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailableEventDto> getAvailableEventsByCategoryId(Long eventCategoryId) {
        EventCategoryModel eventCategoryModel = new EventCategoryModel();
        eventCategoryModel.setId(eventCategoryId);

        return this.availableEventRepository.findByEventCategory(eventCategoryModel).stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AvailableEventDto getAvailableEventById(Long id) {
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `AVAILABLE_EVENT` exist for id: " + id));

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    @Override
    public List<AvailableEventDto> getAvailableEventByCategorySlug(String categorySlug) {
        return this.availableEventRepository.findByCategorySlug(categorySlug).stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AvailableEventDto getAvailableEventBySlug(String slug) {
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findBySlug(slug).orElseThrow(
                () -> new ResourceNotFoundException("No `AVAILABLE_EVENT` exist for slug: " + slug));

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    @Override
    public AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto) {
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findById(availableEventDto.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "No `AVAILABLE_EVENT` exist for id: " + availableEventDto.getId()));
        // Update the fields
        foundAvailableEventModel.setTitle(availableEventDto.getTitle());
        foundAvailableEventModel.setOneLiner(availableEventDto.getOneLiner());
        foundAvailableEventModel.setDescription(availableEventDto.getDescription());
        foundAvailableEventModel.setType(availableEventDto.getType());
        // Save the changes
        foundAvailableEventModel = this.availableEventRepository.save(foundAvailableEventModel);

        // Update the event_rules
        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
            this.eventRuleServices.updateEventRule(eventRuleDto);
        }
        // Update the venue
        for (VenueDto venueDto : availableEventDto.getVenues()) {
            this.venueServices.updateVenue(venueDto);
        }
        // Update the round
        for (RoundDto roundDto : availableEventDto.getRounds()) {
            this.roundServices.updateRound(roundDto);
        }

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    @Override
    public boolean deleteAvailableEvent(Long id) {
        AvailableEventDto availableEventDto = this.getAvailableEventById(id);
        // Delete the logs
        List<NotificationLogModel> notificationLogModels = this.notificationLogRepository.findByAvailableEventId(id);
        for (NotificationLogModel notificationLogModel : notificationLogModels) {
            this.notificationLogRepository.deleteById(notificationLogModel.getId());
        }
        // Delete the events
        this.eventServices.deleteEventsByAvailableEventId(id);
        // Delete the event_rules
        this.eventRuleServices.deleteEventRulesByAvailableEventId(id);
        // Delete all the rounds
        for (RoundDto roundDto : availableEventDto.getRounds()) {
            this.roundServices.deleteRound(roundDto.getId());
        }
        // Delete the venues
        this.venueServices.deleteVenuesByAvailableEventId(id);
        // Delete the available_event
        this.availableEventRepository.deleteById(id);

        return true;
    }

    @Override
    public void deleteAvailableEventsByCategoryId(Long categoryId) {
        // List<AvailableEventModel>
        // List<NotificationLogModel> notificationLogModels =
        // this.notificationLogRepository.findByAvailableEventId(id);
        // for (NotificationLogModel notificationLogModel: notificationLogModels) {
        // this.notificationLogRepository.deleteById(notificationLogModel.getId());
        // }
        // this.availableEventRepository.deleteByCategoryId(categoryId);
    }

    private AvailableEventDto availableEventModelToDto(AvailableEventModel availableEventModel) {
        if (availableEventModel == null) {
            return null;
        }
        AvailableEventDto availableEventDto = this.modelMapper.map(availableEventModel, AvailableEventDto.class);
        availableEventDto.setEventCategoryId(availableEventModel.getEventCategory().getId());
        availableEventDto
                .setEventRules(this.eventRuleServices.getEventRulesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setVenues(this.venueServices.getVenuesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setRounds(this.roundServices.getRoundsByAvailableEventId(availableEventModel.getId()));

        return availableEventDto;
    }

}
