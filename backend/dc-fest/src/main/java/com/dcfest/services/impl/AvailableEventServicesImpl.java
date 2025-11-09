package com.dcfest.services.impl;

import java.util.ArrayList;
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
        for (JudgeDto judgeDto : availableEventDto.getJudges()) {
            judgeDto.setAvailableEventId(availableEventModel.getId());
            this.judgeServices.createJudge(judgeDto);
        }

        return this.availableEventModelToDto(availableEventModel);
    }

    @Override
    public List<AvailableEventDto> getAllAvailableEvents() {
        return this.availableEventRepository.findAllByIsActiveTrue().stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailableEventDto> getAvailableEventsByCategoryId(Long eventCategoryId) {
        EventCategoryModel eventCategoryModel = new EventCategoryModel();
        eventCategoryModel.setId(eventCategoryId);

        return this.availableEventRepository.findByEventCategoryAndIsActiveTrue(eventCategoryModel).stream()
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
        return this.availableEventRepository.findByCategorySlugActive(categorySlug).stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    public List<AvailableEventDto> getAvailableEventByCategorySlugAll(String categorySlug) {
        return this.availableEventRepository.findByCategorySlugAll(categorySlug).stream()
                .map(this::availableEventModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AvailableEventDto getAvailableEventBySlug(String slug) {
        System.out.println("slug: " + slug);
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(
                        () -> new ResourceNotFoundException("No `AVAILABLE_EVENT` exist for slug: " + slug));

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    public AvailableEventDto getAvailableEventBySlugAll(String slug) {
        System.out.println("slug: " + slug);
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findBySlug(slug)
                .orElseThrow(
                        () -> new ResourceNotFoundException("No `AVAILABLE_EVENT` exist for slug: " + slug));

        return this.availableEventModelToDto(foundAvailableEventModel);
    }

    public AvailableEventDto toggleActive(Long availableEventId) {
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId));

        availableEventModel.setActive(!availableEventModel.isActive());
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        return this.availableEventModelToDto(availableEventModel);
    }

    // @Override
    // public AvailableEventDto updateAvailableEvent(AvailableEventDto
    // availableEventDto) {
    // AvailableEventModel foundAvailableEventModel =
    // this.availableEventRepository.findById(availableEventDto.getId())
    // .orElseThrow(
    // () -> new ResourceNotFoundException(
    // "No `AVAILABLE_EVENT` exist for id: " + availableEventDto.getId()));
    // // Update the fields
    // foundAvailableEventModel.setTitle(availableEventDto.getTitle());
    // foundAvailableEventModel.setOneLiner(availableEventDto.getOneLiner());
    // foundAvailableEventModel.setDescription(availableEventDto.getDescription());
    // foundAvailableEventModel.setType(availableEventDto.getType());
    // foundAvailableEventModel.setCloseRegistration(availableEventDto.isCloseRegistration());
    // foundAvailableEventModel.setCode(availableEventDto.getCode());
    //
    // // Save the changes
    // foundAvailableEventModel =
    // this.availableEventRepository.save(foundAvailableEventModel);
    //
    // // Update the event_rules
    // List<EventRuleDto> existingEventRuleDtos =
    // this.eventRuleServices.getEventRulesByAvailableEventId(foundAvailableEventModel.getId());
    // for (EventRuleDto eventRuleDto : availableEventDto.getEventRules()) {
    // eventRuleDto.setAvailableEventId(foundAvailableEventModel.getId());
    // if (eventRuleDto.getId() != null && existingEventRuleDtos.stream().anyMatch(e
    // -> e.getId().equals(eventRuleDto.getId()))) {
    // this.eventRuleServices.updateEventRule(eventRuleDto);
    // }
    // else if(existingEventRuleDtos.stream().noneMatch(e ->
    // e.getId().equals(eventRuleDto.getId()))) {
    // this.eventRuleServices.deleteEventRule(eventRuleDto.getId());
    // }
    // }
    //
    //
    // // Update the round
    // List<RoundDto> existingRoundDtos =
    // this.roundServices.getRoundsByAvailableEventId(foundAvailableEventModel.getId());
    // if (!existingRoundDtos.isEmpty()) {
    // for (RoundDto roundDto : availableEventDto.getRounds()) {
    // roundDto.setAvailableEventId(foundAvailableEventModel.getId());
    // if (roundDto.getId() != null && existingRoundDtos.stream().anyMatch(r ->
    // r.getId().equals(roundDto.getId()))) {
    // this.roundServices.updateRound(roundDto);
    // }
    // else if (existingRoundDtos.stream().noneMatch(r ->
    // r.getId().equals(roundDto.getId()))) {
    // this.roundServices.deleteRound(roundDto.getId());
    // }
    // }
    // }
    //
    // // Update the judges
    // List<JudgeDto> existingJudgeDtos =
    // this.judgeServices.getJudgesByAvailableEventId(availableEventDto.getId());
    // for (JudgeDto judgeDto: availableEventDto.getJudges()) {
    //
    // }
    //
    // return this.availableEventModelToDto(foundAvailableEventModel);
    // }

    @Override
    public AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto) {
        // Fetch the existing event
        Long availableEventId = availableEventDto.getId();
        AvailableEventModel foundAvailableEventModel = this.availableEventRepository.findById(availableEventId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No `AVAILABLE_EVENT` exists for id: " + availableEventId));

        // Update the fields
        if (availableEventDto.getTitle() != null) {
            foundAvailableEventModel.setTitle(availableEventDto.getTitle());
        }
        if (availableEventDto.getOneLiner() != null) {
            foundAvailableEventModel.setOneLiner(availableEventDto.getOneLiner());
        }
        if (availableEventDto.getDescription() != null) {
            foundAvailableEventModel.setDescription(availableEventDto.getDescription());
        }
        if (availableEventDto.getType() != null) {
            foundAvailableEventModel.setType(availableEventDto.getType());
        }
        if (availableEventDto.getCode() != null) {
            foundAvailableEventModel.setCode(availableEventDto.getCode());
        }
        if (availableEventDto.getEventMaster() != null) {
            foundAvailableEventModel.setEventMaster(availableEventDto.getEventMaster());
        }
        if (availableEventDto.getEventMasterPhone() != null) {
            foundAvailableEventModel.setEventMasterPhone(availableEventDto.getEventMasterPhone());
        }

        // Save the changes to the main entity
        foundAvailableEventModel = this.availableEventRepository.save(foundAvailableEventModel);
        Long foundAvailableEventModelId = foundAvailableEventModel.getId();

        // Update Event Rules
        List<EventRuleDto> existingEventRules = this.eventRuleServices
                .getEventRulesByAvailableEventId(foundAvailableEventModelId);
        Map<Long, EventRuleDto> existingEventRulesMap = existingEventRules.stream()
                .collect(Collectors.toMap(EventRuleDto::getId, Function.identity()));

        List<EventRuleDto> eventRules = availableEventDto.getEventRules();
        if (eventRules != null) {
            for (EventRuleDto eventRuleDto : eventRules) {
                eventRuleDto.setAvailableEventId(foundAvailableEventModelId);
                Long eventRuleId = eventRuleDto.getId();
                if (eventRuleId != null && existingEventRulesMap.containsKey(eventRuleId)) {
                    this.eventRuleServices.updateEventRule(eventRuleDto);
                    existingEventRulesMap.remove(eventRuleId);
                } else {
                    this.eventRuleServices.createEventRule(eventRuleDto);
                }
            }
        }
        // Delete any remaining (obsolete) rules
        for (Long id : existingEventRulesMap.keySet()) {
            this.eventRuleServices.deleteEventRule(id);
        }

        // Update Rounds
        List<RoundDto> existingRounds = this.roundServices
                .getRoundsByAvailableEventId(foundAvailableEventModelId);
        Map<Long, RoundDto> existingRoundsMap = existingRounds.stream()
                .collect(Collectors.toMap(RoundDto::getId, Function.identity()));

        List<RoundDto> rounds = availableEventDto.getRounds();
        if (rounds != null) {
            for (RoundDto roundDto : rounds) {
                roundDto.setAvailableEventId(foundAvailableEventModelId);
                Long roundId = roundDto.getId();
                if (roundId != null && existingRoundsMap.containsKey(roundId)) {
                    this.roundServices.updateRound(roundDto);
                    existingRoundsMap.remove(roundId);
                } else {
                    this.roundServices.createRound(roundDto);
                }
            }
        }
        // TODO: Delete any remaining (obsolete) rounds
        for (Long id : existingRoundsMap.keySet()) {
            this.roundServices.deleteRound(id);
        }

        // Update Judges
        List<JudgeDto> existingJudges = this.judgeServices
                .getJudgesByAvailableEventId(foundAvailableEventModelId);
        Map<Long, JudgeDto> existingJudgesMap = existingJudges.stream()
                .collect(Collectors.toMap(JudgeDto::getId, Function.identity()));

        List<JudgeDto> judges = availableEventDto.getJudges();
        if (judges != null) {
            for (JudgeDto judgeDto : judges) {
                judgeDto.setAvailableEventId(foundAvailableEventModelId);
                Long judgeId = judgeDto.getId();
                if (judgeId != null && existingJudgesMap.containsKey(judgeId)) {
                    this.judgeServices.updateJudge(judgeDto);
                    existingJudgesMap.remove(judgeId);
                } else {
                    this.judgeServices.createJudge(judgeDto);
                }
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
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId));

        availableEventModel.setCloseRegistration(true);
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        List<String> messageArr = new ArrayList<>();
        messageArr.add(availableEventModel.getTitle());

        this.whatsAppService.sendWhatsAppMessage(
                closeRegPhone,
                messageArr,
                "umang_reg_off",
                null);

        return this.availableEventModelToDto(availableEventModel);
    }

    @Override
    public AvailableEventDto toggleRegistrationProcess(Long availableEventId) {
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId));

        // Toggle the registration status
        boolean newStatus = !availableEventModel.isCloseRegistration();
        availableEventModel.setCloseRegistration(newStatus);
        availableEventModel = this.availableEventRepository.save(availableEventModel);

        List<String> messageArr = new ArrayList<>();
        messageArr.add(availableEventModel.getTitle());

        // Send appropriate WhatsApp message based on the new status
        String templateName = "umang_reg_off"; // Use same template for both cases
        String statusMessage = newStatus ? "Registration closed for" : "Registration opened for";
        messageArr.set(0, statusMessage + " " + availableEventModel.getTitle());

        this.whatsAppService.sendWhatsAppMessage(
                closeRegPhone,
                messageArr,
                templateName,
                null);

        return this.availableEventModelToDto(availableEventModel);
    }

    @Override
    public boolean deleteAvailableEvent(Long id) {
        AvailableEventDto availableEventDto = this.getAvailableEventById(id);
        // Delete the logs
        List<NotificationLogModel> notificationLogModels = this.notificationLogRepository
                .findByAvailableEvent(new AvailableEventModel(id));
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
        for (JudgeDto judgeDto : availableEventDto.getJudges()) {
            this.judgeServices.deleteJudge(judgeDto.getId());
        }

        // Delete the college_participations
        List<CollegeParticipationDto> collegeParticipationDtos = this.collegeParticipationService
                .getByAvailableEvent(id);
        for (CollegeParticipationDto collegeParticipationDto : collegeParticipationDtos) {
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
        availableEventDto
                .setEventRules(this.eventRuleServices.getEventRulesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setRounds(this.roundServices.getRoundsByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setJudges(this.judgeServices.getJudgesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setEventMaster(availableEventModel.getEventMaster());
        availableEventDto.setEventMasterPhone(availableEventModel.getEventMasterPhone());
        return availableEventDto;
    }

}
