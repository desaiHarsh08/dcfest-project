package com.dcfest.services.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.dcfest.dtos.*;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import com.dcfest.services.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.exceptions.ResourceNotFoundException;

@Service
public class AvailableEventServicesImpl implements AvailableEventServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private EventRuleServices eventRuleServices;

    @Autowired
    private EventServices eventServices;

    @Autowired
    private RoundServices roundServices;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private CollegeParticipationService collegeParticipationService;

    @Autowired
    private ParticipantServices participantServices;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private CollegeParticipationRepository collegeParticipationRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Override
    public AvailableEventDto createAvailableEvent(AvailableEventDto availableEventDto) {
        EventCategoryModel eventCategoryModel = new EventCategoryModel();
        eventCategoryModel.setId(availableEventDto.getEventCategoryId());

        // Create the available_event
        AvailableEventModel availableEventModel = this.modelMapper.map(availableEventDto, AvailableEventModel.class);
        availableEventModel.setEventCategory(eventCategoryModel);

        // Save the available_event
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        // Create the event_rules
        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
            eventRuleDto.setAvailableEventId(availableEventModel.getId());
            this.eventRuleServices.createEventRule(eventRuleDto);
        }

        // Create the rounds
        for (RoundDto roundDto : availableEventDto.getRounds()) {
            roundDto.setAvailableEventId(availableEventModel.getId());
            this.roundServices.createRound(roundDto);
        }

        // Create the event
        this.eventServices.createEvent(new EventDto(null, availableEventModel.getId()));

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
        System.out.println("slug: " + slug);
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
        foundAvailableEventModel.setCloseRegistration(availableEventDto.isCloseRegistration());
        // Save the changes
        foundAvailableEventModel = this.availableEventRepository.save(foundAvailableEventModel);

        // Update the event_rules
        List<EventRuleDto> existingEventRuleDtos = this.eventRuleServices.getEventRulesByAvailableEventId(foundAvailableEventModel.getId());
        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
            eventRuleDto.setAvailableEventId(foundAvailableEventModel.getId());
            if (eventRuleDto.getId() != null && existingEventRuleDtos.stream().anyMatch(e -> e.getId().equals(eventRuleDto.getId()))) {
                this.eventRuleServices.updateEventRule(eventRuleDto);
            }
            else if(existingEventRuleDtos.stream().noneMatch(e -> e.getId().equals(eventRuleDto.getId()))) {
                this.eventRuleServices.deleteEventRule(eventRuleDto.getId());
            }
        }
        // Post close registration
        if (availableEventDto.isCloseRegistration()) {
            this.postCloseRegistrationProcess(foundAvailableEventModel, existingEventRuleDtos);
        }

        // Update the round
        List<RoundDto> existingRoundDtos = this.roundServices.getRoundsByAvailableEventId(foundAvailableEventModel.getId());
        if (!existingRoundDtos.isEmpty()) {
            for (RoundDto roundDto : availableEventDto.getRounds()) {
                roundDto.setAvailableEventId(foundAvailableEventModel.getId());
                if (roundDto.getId() != null && existingRoundDtos.stream().anyMatch(r -> r.getId().equals(roundDto.getId()))) {
                    this.roundServices.updateRound(roundDto);
                }
                else if (existingRoundDtos.stream().noneMatch(r -> r.getId().equals(roundDto.getId()))) {
                    this.roundServices.deleteRound(roundDto.getId());
                }
            }
        }

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    @Override
    public void postCloseRegistrationProcess(AvailableEventModel availableEventModel, List<EventRuleDto> eventRuleDtos) {
        EventDto eventDto = this.eventServices.getEventByAvailableEventId(availableEventModel.getId());
        if (eventDto == null) {
            return;
        }
        // Fetch all the participants
        List<ParticipantModel> allParticipantModels = this.participantRepository.findByEvents_Id(eventDto.getId());
        // Fetch colleges participated
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        // Sort by college's name
        collegeParticipationModels.sort(Comparator.comparing(college -> college.getCollege().getName()));
        // Assign the teamNumber to the participants
        int count = 0;
        EventRuleDto registeredAvailableSlotsRule = eventRuleDtos.stream().filter(e -> e.getEventRuleTemplate().getId().equals(6L)).findFirst().orElseThrow(
                () -> new IllegalArgumentException("unable to find the registered_slots_available_rule")
        );
        EventRuleDto otseSlotsRule = eventRuleDtos.stream().filter(e -> e.getEventRuleTemplate().getName().equals("OTSE_SLOTS")).findFirst().orElseThrow(
                () -> new IllegalArgumentException("unable to find the otse_slots_rule")
        );
        for (CollegeParticipationModel collegeParticipationModel: collegeParticipationModels) {

            if (count >= (Integer.parseInt(registeredAvailableSlotsRule.getValue()) + Integer.parseInt(otseSlotsRule.getValue()))) {
                break;
            }
            count = count + 1;
            // Fetch the college details: -
            CollegeModel collegeModel = this.collegeRepository.findById(collegeParticipationModel.getCollege().getId()).orElse(null);
            if (collegeModel == null) {
                continue;
            }
            // Generate the team_number
            String teamNumber = collegeModel.getIcCode() + "_" + String.format("%02d", count);
            // Set the team_number
            allParticipantModels = allParticipantModels.stream().map(p -> {
                if (p.getCollege().getId().equals(collegeModel.getId()) && p.getEvents().stream().anyMatch(e -> e.getId().equals(eventDto.getId()))) {
                    p.setTeamNumber(teamNumber);
                }
                return p;
            }).toList();
        }

    }

    @Override
    public boolean deleteAvailableEvent(Long id) {
        AvailableEventDto availableEventDto = this.getAvailableEventById(id);
        // Delete the logs
        List<NotificationLogModel> notificationLogModels = this.notificationLogRepository.findByAvailableEvent(new AvailableEventModel(id));
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
        // Delete all the colleges

        // Delete the college_participations
        List<CollegeParticipationDto> collegeParticipationDtos = this.collegeParticipationService.getByAvailableEvent(id);
        for (CollegeParticipationDto collegeParticipationDto: collegeParticipationDtos) {
            this.collegeParticipationService.deleteParticipation(collegeParticipationDto.getId());
        }

        this.availableEventRepository.deleteById(id);

        return true;
    }

    private AvailableEventDto availableEventModelToDto(AvailableEventModel availableEventModel) {
        if (availableEventModel == null) {
            return null;
        }
        AvailableEventDto availableEventDto = this.modelMapper.map(availableEventModel, AvailableEventDto.class);
        availableEventDto.setEventCategoryId(availableEventModel.getEventCategory().getId());
        availableEventDto.setEventRules(this.eventRuleServices.getEventRulesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setRounds(this.roundServices.getRoundsByAvailableEventId(availableEventModel.getId()));

        return availableEventDto;
    }

}
