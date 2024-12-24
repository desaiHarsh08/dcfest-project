package com.dcfest.services.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.dcfest.dtos.*;
import com.dcfest.models.*;
import com.dcfest.notifications.whatsapp.WhatsAppService;
import com.dcfest.repositories.*;
import com.dcfest.services.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dcfest.exceptions.ResourceNotFoundException;

@Service
public class AvailableEventServicesImpl implements AvailableEventServices {

    @Value("${close_reg_phone}")
    private String closeRegPhone;


    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private WhatsAppService whatsAppService;

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

    @Autowired
    private JudgeServices judgeServices;

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

        // Create the judges
        for (JudgeDto judgeDto: availableEventDto.getJudges()) {
            judgeDto.setAvailableEventId(availableEventModel.getId());
            this.judgeServices.createJudge(judgeDto);
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
        System.out.println("slug: " + slug);
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findBySlug(slug).orElseThrow(
                () -> new ResourceNotFoundException("No `AVAILABLE_EVENT` exist for slug: " + slug));

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

//    @Override
//    public AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto) {
//        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findById(availableEventDto.getId())
//                .orElseThrow(
//                        () -> new ResourceNotFoundException(
//                                "No `AVAILABLE_EVENT` exist for id: " + availableEventDto.getId()));
//        // Update the fields
//        foundAvailableEventModel.setTitle(availableEventDto.getTitle());
//        foundAvailableEventModel.setOneLiner(availableEventDto.getOneLiner());
//        foundAvailableEventModel.setDescription(availableEventDto.getDescription());
//        foundAvailableEventModel.setType(availableEventDto.getType());
//        foundAvailableEventModel.setCloseRegistration(availableEventDto.isCloseRegistration());
//        foundAvailableEventModel.setCode(availableEventDto.getCode());
//
//        // Save the changes
//        foundAvailableEventModel = this.availableEventRepository.save(foundAvailableEventModel);
//
//        // Update the event_rules
//        List<EventRuleDto> existingEventRuleDtos = this.eventRuleServices.getEventRulesByAvailableEventId(foundAvailableEventModel.getId());
//        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
//            eventRuleDto.setAvailableEventId(foundAvailableEventModel.getId());
//            if (eventRuleDto.getId() != null && existingEventRuleDtos.stream().anyMatch(e -> e.getId().equals(eventRuleDto.getId()))) {
//                this.eventRuleServices.updateEventRule(eventRuleDto);
//            }
//            else if(existingEventRuleDtos.stream().noneMatch(e -> e.getId().equals(eventRuleDto.getId()))) {
//                this.eventRuleServices.deleteEventRule(eventRuleDto.getId());
//            }
//        }
//
//
//        // Update the round
//        List<RoundDto> existingRoundDtos = this.roundServices.getRoundsByAvailableEventId(foundAvailableEventModel.getId());
//        if (!existingRoundDtos.isEmpty()) {
//            for (RoundDto roundDto : availableEventDto.getRounds()) {
//                roundDto.setAvailableEventId(foundAvailableEventModel.getId());
//                if (roundDto.getId() != null && existingRoundDtos.stream().anyMatch(r -> r.getId().equals(roundDto.getId()))) {
//                    this.roundServices.updateRound(roundDto);
//                }
//                else if (existingRoundDtos.stream().noneMatch(r -> r.getId().equals(roundDto.getId()))) {
//                    this.roundServices.deleteRound(roundDto.getId());
//                }
//            }
//        }
//
//        // Update the judges
//        List<JudgeDto> existingJudgeDtos = this.judgeServices.getJudgesByAvailableEventId(availableEventDto.getId());
//        for (JudgeDto judgeDto: availableEventDto.getJudges()) {
//
//        }
//
//        return this.availableEventModelToDto(foundAvailableEventModel);
//    }

    @Override
    public AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto) {
        // Fetch the existing event
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findById(availableEventDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No `AVAILABLE_EVENT` exists for id: " + availableEventDto.getId()));

        // Update the fields
        foundAvailableEventModel.setTitle(availableEventDto.getTitle());
        foundAvailableEventModel.setOneLiner(availableEventDto.getOneLiner());
        foundAvailableEventModel.setDescription(availableEventDto.getDescription());
        foundAvailableEventModel.setType(availableEventDto.getType());
        foundAvailableEventModel.setCode(availableEventDto.getCode());
        foundAvailableEventModel.setEventMaster(availableEventDto.getEventMaster());
        foundAvailableEventModel.setEventMasterPhone(availableEventDto.getEventMasterPhone());

        // Save the changes to the main entity
        foundAvailableEventModel = this.availableEventRepository.save(foundAvailableEventModel);

        // Update Event Rules
        Map<Long, EventRuleDto> existingEventRulesMap = this.eventRuleServices.getEventRulesByAvailableEventId(foundAvailableEventModel.getId())
                .stream().collect(Collectors.toMap(EventRuleDto::getId, Function.identity()));

        for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
            eventRuleDto.setAvailableEventId(foundAvailableEventModel.getId());
            if (eventRuleDto.getId() != null && existingEventRulesMap.containsKey(eventRuleDto.getId())) {
                this.eventRuleServices.updateEventRule(eventRuleDto);
                existingEventRulesMap.remove(eventRuleDto.getId());
            } else {
                this.eventRuleServices.createEventRule(eventRuleDto);
            }
        }
        // Delete any remaining (obsolete) rules
        for (Long id : existingEventRulesMap.keySet()) {
            this.eventRuleServices.deleteEventRule(id);
        }

        // Update Rounds
        Map<Long, RoundDto> existingRoundsMap = this.roundServices.getRoundsByAvailableEventId(foundAvailableEventModel.getId())
                .stream().collect(Collectors.toMap(RoundDto::getId, Function.identity()));

        for (RoundDto roundDto : availableEventDto.getRounds()) {
            roundDto.setAvailableEventId(foundAvailableEventModel.getId());
            if (roundDto.getId() != null && existingRoundsMap.containsKey(roundDto.getId())) {
                this.roundServices.updateRound(roundDto);
                existingRoundsMap.remove(roundDto.getId());
            } else {
                this.roundServices.createRound(roundDto);
            }
        }
        // TODO: Delete any remaining (obsolete) rounds
        for (Long id : existingRoundsMap.keySet()) {
            this.roundServices.deleteRound(id);
        }

        // Update Judges
        Map<Long, JudgeDto> existingJudgesMap = this.judgeServices.getJudgesByAvailableEventId(foundAvailableEventModel.getId())
                .stream().collect(Collectors.toMap(JudgeDto::getId, Function.identity()));

        for (JudgeDto judgeDto : availableEventDto.getJudges()) {
            judgeDto.setAvailableEventId(foundAvailableEventModel.getId());
            if (judgeDto.getId() != null && existingJudgesMap.containsKey(judgeDto.getId())) {
                this.judgeServices.updateJudge(judgeDto);
                existingJudgesMap.remove(judgeDto.getId());
            } else {
                this.judgeServices.createJudge(judgeDto);
            }
        }
        // Delete any remaining (obsolete) judges
        for (Long id : existingJudgesMap.keySet()) {
            this.judgeServices.deleteJudge(id);
        }

        // Return the updated DTO
        return this.availableEventModelToDto(foundAvailableEventModel);
    }


    @Override
    public AvailableEventDto postCloseRegistrationProcess(Long availableEventId) {
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId)
        );

        availableEventModel.setCloseRegistration(true);
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        List<Object> messageArr = new ArrayList<>();
        messageArr.add(availableEventModel.getTitle());


        this.whatsAppService.sendWhatsAppMessage(
                closeRegPhone,
                messageArr,
                "umang_reg_off",
                null
        );

        return this.availableEventModelToDto(availableEventModel);
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
        // Delete all the judges
        for (JudgeDto judgeDto: availableEventDto.getJudges()) {
            this.judgeServices.deleteJudge(judgeDto.getId());
        }

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
        availableEventDto.setJudges(this.judgeServices.getJudgesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setEventMaster(availableEventModel.getEventMaster());
        availableEventDto.setEventMasterPhone(availableEventModel.getEventMasterPhone());
        return availableEventDto;
    }

}
