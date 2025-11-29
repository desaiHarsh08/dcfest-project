package com.dcfest.services.impl;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

import com.dcfest.constants.*;
import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.models.AcademicYearModel;
import com.dcfest.dtos.PromotedRoundDto;
import com.dcfest.exceptions.OTSESlotsException;
import com.dcfest.exceptions.RegisteredSlotsAvailableException;
import com.dcfest.exceptions.RegistrationDeadlineClosedException;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import com.dcfest.services.ParticipantAttendanceServices;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.services.ParticipantServices;
import com.dcfest.utils.PageResponse;

@Service
public class ParticipantServicesImpl implements ParticipantServices {

    private static final int PAGE_SIZE = 100;

    @Autowired
    private ParticipantAttendanceServices participantAttendanceServices;

    @Autowired
    private PromotedRoundRepository promotedRoundRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeParticipationRepository collegeParticipationRepository;

    @Autowired
    private EventRuleRepository eventRuleRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private com.dcfest.services.WebSocketService webSocketService;

    @Autowired
    private com.dcfest.services.AcademicYearService academicYearService;

    /**
     * Determines the quota type based on academic year, available quotas, and
     * registration slot availability
     */
    private QuotaType determineQuotaType(AvailableEventModel availableEventModel,
            List<EventRuleModel> eventRuleModels, EventModel eventModel) {
        // First, check if registration slots are full
        EventRuleModel registeredSlotsRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("REGISTERED_SLOTS_AVAILABLE"))
                .findFirst()
                .orElse(null);

        if (registeredSlotsRule != null && eventModel != null) {
            int maxSlotsAvailable = Integer.parseInt(registeredSlotsRule.getValue());
            Long slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId());

            // If registration slots are full, check for waiting list
            if (slotsOccupied >= maxSlotsAvailable) {
                EventRuleModel waitingListSlotsEventRule = eventRuleModels.stream()
                        .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS"))
                        .findAny()
                        .orElse(null);

                if (waitingListSlotsEventRule != null) {
                    int maxWaitingListSlots = Integer.parseInt(waitingListSlotsEventRule.getValue());
                    Long waitingListSlotsOccupied = this
                            .waitingListSlotsOccupiedByAvailableEventId(availableEventModel.getId());

                    // If waiting list slots are available, use WAITING_LIST_QUOTA
                    if (waitingListSlotsOccupied != null && waitingListSlotsOccupied < maxWaitingListSlots) {
                        return QuotaType.WAITING_LIST_QUOTA;
                    }
                }

                // If waiting list is full or doesn't exist, check for OTSE
                EventRuleModel otseSlotsEventRule = eventRuleModels.stream()
                        .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("OTSE_SLOTS"))
                        .findAny()
                        .orElse(null);

                if (otseSlotsEventRule != null && Integer.parseInt(otseSlotsEventRule.getValue()) > 0) {
                    return QuotaType.OTSE_QUOTA;
                }
            }
        }

        // Get active academic year
        AcademicYearModel activeAcademicYear = academicYearRepository.findByIsActiveTrue()
                .orElse(null);

        // If no active academic year or current date is before endDate, use
        // REGISTRATION_QUOTA
        if (activeAcademicYear == null) {
            return QuotaType.REGISTRATION_QUOTA;
        }

        java.time.LocalDateTime currentDateTime = java.time.LocalDateTime.now();

        // If current datetime is before endDate, use REGISTRATION_QUOTA
        if (currentDateTime.isBefore(activeAcademicYear.getEndDate())) {
            return QuotaType.REGISTRATION_QUOTA;
        }

        // After endDate, check for WAITING_LIST quota first (optional)
        EventRuleModel waitingListSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS"))
                .findAny()
                .orElse(null);

        // If WAITING_LIST quota exists and has available slots, use it
        if (waitingListSlotsEventRule != null && Integer.parseInt(waitingListSlotsEventRule.getValue()) > 0) {
            return QuotaType.WAITING_LIST_QUOTA;
        }

        // If WAITING_LIST quota doesn't exist, check for OTSE quota (optional)
        EventRuleModel otseSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("OTSE_SLOTS"))
                .findAny()
                .orElse(null);

        // If OTSE quota exists and has available slots, use it
        if (otseSlotsEventRule != null && Integer.parseInt(otseSlotsEventRule.getValue()) > 0) {
            return QuotaType.OTSE_QUOTA;
        }

        // Default to REGISTRATION_QUOTA if WAITING_LIST doesn't exist and OTSE doesn't
        // exist or is not available
        return QuotaType.REGISTRATION_QUOTA;
    }

    /**
     * Generates the next WL sequence number (WL_001, WL_002, etc.)
     */
    private String generateWLQSequenceNumber(Long eventId) {
        // Find all participants with WAITING_LIST_QUOTA for this event
        List<ParticipantModel> allParticipants = participantRepository.findByEvents_Id(eventId);

        List<ParticipantModel> waitingListParticipants = allParticipants.stream()
                .filter(p -> p.getQuotaType() == QuotaType.WAITING_LIST_QUOTA)
                .filter(p -> p.getQuotaCount() != null && p.getQuotaCount().startsWith("WL_"))
                .toList();

        if (waitingListParticipants.isEmpty()) {
            return "WL_001";
        }

        // Extract sequence numbers and find the maximum
        int maxSequence = waitingListParticipants.stream()
                .map(p -> {
                    String quotaCount = p.getQuotaCount();
                    if (quotaCount != null && quotaCount.startsWith("WL_")) {
                        try {
                            return Integer.parseInt(quotaCount.substring(3)); // Extract number after "WL_" (3 chars)
                        } catch (NumberFormatException e) {
                            return 0;
                        }
                    }
                    return 0;
                })
                .max(Integer::compare)
                .orElse(0);

        // Return next sequence number
        return String.format("WL_%03d", maxSequence + 1);
    }

    /**
     * Gets the next OTSE sequence number for an event (incremental across all
     * colleges)
     * Returns the next sequence number (e.g., 1, 2, 3...) to be used in group name
     * format: {icCode}_OTSE_{sequenceNumber}
     */
    private int getNextOTSESequenceNumber(Long eventId) {
        // Find all OTSE participants for this event
        List<ParticipantModel> allParticipants = participantRepository.findByEvents_Id(eventId);
        List<ParticipantModel> otseParticipants = allParticipants.stream()
                .filter(p -> p.getEntryType() == EntryType.OTSE)
                .toList();

        if (otseParticipants.isEmpty()) {
            return 1; // First OTSE group
        }

        // Extract unique groups and find the maximum sequence number
        Set<String> uniqueGroups = otseParticipants.stream()
                .map(ParticipantModel::getGroup)
                .filter(Objects::nonNull)
                .filter(grp -> grp.contains("_OTSE_"))
                .collect(Collectors.toSet());

        if (uniqueGroups.isEmpty()) {
            return 1;
        }

        // Extract sequence numbers from groups (pattern: *_{icCode}_OTSE_{##})
        int maxSequence = uniqueGroups.stream()
                .mapToInt(grp -> {
                    try {
                        // Find the position of "_OTSE_"
                        int otseIndex = grp.indexOf("_OTSE_");
                        if (otseIndex == -1) {
                            return 0;
                        }
                        // Extract the number after "_OTSE_"
                        String sequencePart = grp.substring(otseIndex + 6); // "_OTSE_" is 6 chars
                        return Integer.parseInt(sequencePart);
                    } catch (NumberFormatException | StringIndexOutOfBoundsException e) {
                        return 0;
                    }
                })
                .max()
                .orElse(0);

        return maxSequence + 1;
    }

    @Override
    public List<ParticipantDto> createParticipants(List<ParticipantDto> participantDtos) {
        CollegeModel collegeModel = this.collegeRepository.findById(participantDtos.get(0).getCollegeId()).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid college id"));

        EventModel eventModel = this.eventRepository.findById(participantDtos.get(0).getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id"));
        eventModel.setId(participantDtos.get(0).getEventIds().get(0));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid `AVAILABLE_EVENT` id provided: " + eventModel.getAvailableEvent().getId()));

        if (availableEventModel.isCloseRegistration()) {
            throw new IllegalArgumentException("Registrations are now closed. Please contact the host college!");
        }

        eventModel.setAvailableEvent(availableEventModel);

        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(availableEventModel);

        // Retrieve the REGISTERED_SLOTS_AVAILABLE (or quota count)
        EventRuleModel eventRuleModel = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getId().equals(6L)).findAny().orElse(null);
        if (eventRuleModel == null) {
            throw new RegisteredSlotsAvailableException("Unable to get the Maximum slots available");
        }
        // Retrieve the OTSE_SLOTS (or quota count)
        EventRuleModel otseSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("OTSE_SLOTS")).findAny()
                .orElse(null);
        if (otseSlotsEventRule == null) {
            throw new IllegalArgumentException("Unable to get the OTSE slots available rule");
        }
        // Retrieve the WAITING_LIST_SLOTS (or quota count) - Optional
        EventRuleModel waitingListSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS")).findAny()
                .orElse(null);
        // WAITING_LIST_SLOTS is optional - if it doesn't exist, waiting list is not
        // available

        // Check for enrollment
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository
                .findByAvailableEvent(availableEventModel);
        CollegeParticipationModel existingCollegeParticipation = collegeParticipationModels.stream()
                .filter(cp -> cp.getCollege().getId().equals(participantDtos.get(0).getCollegeId())).findAny()
                .orElse(null);
        if (collegeParticipationModels.isEmpty() || existingCollegeParticipation == null) {
            // Check if registration is open (startDate <= currentDateTime <= endDate)
            if (!academicYearService.isRegistrationOpen()) {
                AcademicYearModel activeAcademicYear = academicYearRepository.findByIsActiveTrue()
                        .orElse(null);

                if (activeAcademicYear == null) {
                    throw new RegistrationDeadlineClosedException(
                            "No active academic year found. Registration is not available.");
                }

                LocalDateTime currentDateTime = LocalDateTime.now();
                if (currentDateTime.isBefore(activeAcademicYear.getStartDate())) {
                    throw new RegistrationDeadlineClosedException(
                            "Registration has not started yet. Please wait until the registration period begins.");
                } else {
                    throw new RegistrationDeadlineClosedException(
                            "Registration deadline has passed. New event registrations and waiting list applications are no longer accepted.");
                }
            }
            // Use already fetched and validated collegeModel
            CollegeParticipationModel newParticipation = new CollegeParticipationModel();
            newParticipation.setCollege(collegeModel);
            newParticipation.setAvailableEvent(availableEventModel);
            newParticipation.setTeamNumber(null);
            newParticipation.setWaitingListSequence(null);
            newParticipation.setArchived(false);
            this.collegeParticipationRepository.save(newParticipation);
        }

        // Check the unique college
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(
                participantDtos.get(0).getEventIds().get(0), participantDtos.get(0).getCollegeId());

        // Check if trying to add NORMAL entry type PERFORMER when college already has
        // NORMAL PERFORMER participants
        // Note: ACCOMPANIST participants are allowed even if NORMAL PERFORMER
        // participants exist
        EntryType requestedEntryType = participantDtos.get(0).getEntryType();
        ParticipantType requestedParticipantType = participantDtos.get(0).getType();
        String requestedTeamNumber = participantDtos.get(0).getTeamNumber();
        String requestedGroup = participantDtos.get(0).getGroup();
        String existingTeamNumber = participantModels.stream().map(ParticipantModel::getTeamNumber)
                .filter(Objects::nonNull).findFirst().orElse(null);
        String existingGroup = participantModels.stream().map(ParticipantModel::getGroup)
                .filter(Objects::nonNull).findFirst().orElse(null);
        boolean isSameTeamNumber = (existingTeamNumber == null && requestedTeamNumber == null)
                || (existingTeamNumber != null && existingTeamNumber.equals(requestedTeamNumber));
        boolean isSameGroup = (existingGroup == null && requestedGroup == null)
                || (existingGroup != null && existingGroup.equals(requestedGroup));
        boolean isExistingTeam = isSameTeamNumber || isSameGroup;
        if (EntryType.NORMAL.equals(requestedEntryType) && ParticipantType.PERFORMER.equals(requestedParticipantType)
                && !participantModels.isEmpty() && !isExistingTeam) {
            boolean hasNormalPerformers = participantModels.stream()
                    .anyMatch(p -> EntryType.NORMAL.equals(p.getEntryType())
                            && ParticipantType.PERFORMER.equals(p.getType()));
            if (hasNormalPerformers) {
                throw new IllegalArgumentException(
                        "Your college has already added participants with NORMAL entry type. Only one NORMAL entry is allowed per college. You can add OTSE or WAITING_LIST entry types instead.");
            }
        }

        if (participantModels.isEmpty()) { // Unique (New) College participant

            int maxSlotsAvailable = Integer.parseInt(eventRuleModel.getValue());

            int slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId()).intValue();
            System.out.println("Slots occupied: " + slotsOccupied);

            if (slotsOccupied + 1 > maxSlotsAvailable) {
                // If registration slots are full, check EntryType
                EntryType entryType = participantDtos.get(0).getEntryType();
                if (entryType.equals(EntryType.NORMAL)) {
                    // Check if waiting list is available (waitingListSlotsEventRule is optional)
                    if (waitingListSlotsEventRule != null) {
                        int maxWaitingListSlots = Integer.parseInt(waitingListSlotsEventRule.getValue());
                        Long waitingListSlotsOccupiedCount = this
                                .waitingListSlotsOccupiedByAvailableEventId(availableEventModel.getId());

                        if (waitingListSlotsOccupiedCount != null
                                && waitingListSlotsOccupiedCount < maxWaitingListSlots) {
                            // Waiting list is available, but EntryType is NORMAL - this should be handled
                            // by frontend
                            // For now, allow it and backend will set it to WAITING_LIST based on QuotaType
                        } else {
                            // Waiting list is also full
                            throw new RegisteredSlotsAvailableException(
                                    "Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
                        }
                    } else {
                        // No waiting list available - registration is full
                        throw new RegisteredSlotsAvailableException(
                                "Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
                    }
                } else if (entryType.equals(EntryType.OTSE)) {
                    // If EntryType is OTSE, check OTSE slots availability
                    int otseSlotsAvailable = Integer.parseInt(otseSlotsEventRule.getValue());
                    if (otseSlotsAvailable == 0) {
                        throw new OTSESlotsException("No OTSE slots available");
                    }

                    // Grab the unique colleges
                    List<ParticipantModel> allParticipantModels = this.participantRepository
                            .findByEvents_Id(participantDtos.get(0).getEventIds().get(0));
                    List<ParticipantModel> fiteredParticipantsByType = allParticipantModels.stream()
                            .filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();
                    List<Long> collegesIds = new ArrayList<>();
                    for (ParticipantModel participantModel : fiteredParticipantsByType) {
                        if (collegesIds.contains(participantModel.getCollege().getId())) {
                            continue;
                        }
                        collegesIds.add(participantModel.getCollege().getId());
                    }

                    int otseSlotsOccupied = collegesIds.size();
                    if (otseSlotsOccupied + 1 > otseSlotsAvailable) {
                        throw new OTSESlotsException("Maximum OTSE slots for this event has been filled.");
                    }
                }
                // If EntryType is WAITING_LIST, allow it to proceed (no additional checks
                // needed)

            }
        }

        List<String> groups = new ArrayList<>();

        if (participantDtos.get(0).getEntryType().equals(EntryType.OTSE)) {
            int otseSlotsAvailable = Integer.parseInt(otseSlotsEventRule.getValue());
            if (otseSlotsAvailable == 0) {
                throw new OTSESlotsException("No OTSE slots available");
            }

            // Grab the unique colleges
            List<ParticipantModel> allParticipantModels = this.participantRepository
                    .findByEvents_Id(participantDtos.get(0).getEventIds().get(0));
            List<ParticipantModel> fiteredParticipantsByType = allParticipantModels.stream()
                    .filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();

            for (ParticipantModel participantModel : fiteredParticipantsByType) {
                if (groups.contains(participantModel.getGroup())) {
                    continue;
                }
                groups.add(participantModel.getGroup());
            }

            System.out.println(groups);

            int otseSlotsOccupied = groups.size();
            if (otseSlotsOccupied + 1 > otseSlotsAvailable) {
                throw new OTSESlotsException("Maximum OTSE slots for this event has been filled.");
            }

        }

        String group;

        if (participantDtos.get(0).getEntryType().equals(EntryType.NORMAL)) {
            System.out.println("in normal");
            group = collegeModel.getIcCode() + "_" + String.format("%02d", 1);
        } else if (participantDtos.get(0).getEntryType().equals(EntryType.WAITING_LIST)) {
            System.out.println("in waiting list");
            // For waiting list, use a similar group naming pattern
            CollegeParticipationModel cp = collegeParticipationModels.stream()
                    .filter(p -> p.getCollege().getId().equals(collegeModel.getId()))
                    .findFirst()
                    .orElse(null);

            group = collegeModel.getIcCode() + "_WL_" + String.format("%03d", cp.getWaitingListSequence().substring(3));
        } else {
            // OTSE: Use incremental sequence number across all colleges for this event
            int nextOTSESequence = getNextOTSESequenceNumber(eventModel.getId());
            group = collegeModel.getIcCode() + "_OTSE_" + String.format("%02d", nextOTSESequence);
        }

        // Check if college has a waiting list sequence (assigned during enrollment)
        CollegeParticipationModel collegeParticipation = this.collegeParticipationRepository
                .findByCollegeAndAvailableEvent(collegeModel, availableEventModel)
                .orElse(null);

        String collegeWaitingListSequence = null;
        if (collegeParticipation != null && collegeParticipation.getWaitingListSequence() != null) {
            collegeWaitingListSequence = collegeParticipation.getWaitingListSequence();
        }

        // Determine quota type based on academic year, slot availability, and event
        // rules
        QuotaType quotaType = determineQuotaType(availableEventModel, eventRuleModels, eventModel);

        // If college has waiting list sequence, use WAITING_LIST_QUOTA
        if (collegeWaitingListSequence != null) {
            quotaType = QuotaType.WAITING_LIST_QUOTA;
        }

        // Create the participants
        List<ParticipantModel> savedParticipantModels = new ArrayList<>();
        for (int i = 0; i < participantDtos.size(); i++) {
            ParticipantDto participantDto = participantDtos.get(i);
            ParticipantModel participantModel = this.modelMapper.map(participantDto, ParticipantModel.class);
            participantModel.setCollege(collegeModel);
            participantModel.setEntryType(participantModel.getEntryType());
            participantModel.getEvents().add(eventModel);
            participantModel.setHandPreference(participantDto.getHandPreference());
            participantModel.setGroup(group);

            // Set quota type and count
            participantModel.setQuotaType(quotaType);
            if (quotaType == QuotaType.WAITING_LIST_QUOTA) {
                // Use college's waiting list sequence (assigned during enrollment)
                if (collegeWaitingListSequence != null) {
                    participantModel.setQuotaCount(collegeWaitingListSequence);
                    participantModel.setGroup(group);
                } else {
                    // Fallback: generate sequence if college doesn't have one (shouldn't happen)
                    String quotaCount = generateWLQSequenceNumber(eventModel.getId());
                    group = collegeModel.getIcCode() + "_" + quotaCount;
                    participantModel.setGroup(group);
                    participantModel.setQuotaCount(quotaCount);
                }
                // Automatically set EntryType to WAITING_LIST when QuotaType is
                // WAITING_LIST_QUOTA
                participantModel.setEntryType(EntryType.WAITING_LIST);
            }

            // Save the participant
            participantModel = this.participantRepository.save(participantModel);

            // Save the events
            eventModel.getParticipants().add(participantModel);
            this.eventRepository.save(eventModel);

            savedParticipantModels.add(participantModel);
        }

        // Emit WebSocket event for quota update
        try {
            Long availableEventId = availableEventModel.getId();
            Long slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId());
            Long waitingListSlotsOccupied = this.waitingListSlotsOccupiedByAvailableEventId(availableEventId);
            webSocketService.emitQuotaUpdate(availableEventId, slotsOccupied, waitingListSlotsOccupied);
            webSocketService.emitParticipantAdded(availableEventId, eventModel.getId());
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event: " + e.getMessage());
        }

        return savedParticipantModels.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public ParticipantDto addParticipant(ParticipantDto participantDto) {
        CollegeModel collegeModel = this.collegeRepository.findById(participantDto.getCollegeId()).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid college id"));

        EventModel eventModel = this.eventRepository.findById(participantDto.getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id"));
        eventModel.setId(participantDto.getEventIds().get(0));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid `AVAILABLE_EVENT` id provided: " + eventModel.getAvailableEvent().getId()));
        eventModel.setAvailableEvent(availableEventModel);

        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(availableEventModel);
        // for (EventRuleModel eventRuleModel: eventRuleModels) {
        // EventRuleTemplateModel eventRuleTemplateModel =
        // this.eventRuleTemplateRepository.findById(eventRuleModel.getEventRuleTemplate().getId()).orElseThrow(
        // () ->new IllegalArgumentException("Unable to load the checks")
        // );
        // eventRuleModel.setEventRuleTemplate(eventRuleTemplateModel);
        // }

        // Retrieve the REGISTERED_SLOTS_AVAILABLE
        EventRuleModel maxSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getId().equals(6L)).findAny().orElse(null);
        if (maxSlotsEventRule == null) {
            throw new RegisteredSlotsAvailableException("Unable to get the Maximum slots available");
        }

        // Check for enrollment
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository
                .findByAvailableEvent(availableEventModel);
        CollegeParticipationModel existingCollegeParticipation = collegeParticipationModels.stream()
                .filter(cp -> cp.getCollege().getId().equals(participantDto.getCollegeId())).findAny().orElse(null);
        if (collegeParticipationModels.isEmpty() || existingCollegeParticipation == null) {
            // Check if registration is open (startDate <= currentDateTime <= endDate)
            if (!academicYearService.isRegistrationOpen()) {
                AcademicYearModel activeAcademicYear = academicYearRepository.findByIsActiveTrue()
                        .orElse(null);

                if (activeAcademicYear == null) {
                    throw new RegistrationDeadlineClosedException(
                            "No active academic year found. Registration is not available.");
                }

                LocalDateTime currentDateTime = LocalDateTime.now();
                if (currentDateTime.isBefore(activeAcademicYear.getStartDate())) {
                    throw new RegistrationDeadlineClosedException(
                            "Registration has not started yet. Please wait until the registration period begins.");
                } else {
                    throw new RegistrationDeadlineClosedException(
                            "Registration deadline has passed. New event registrations and waiting list applications are no longer accepted.");
                }
            }
            // Use already fetched and validated collegeModel
            CollegeParticipationModel newParticipation = new CollegeParticipationModel();
            newParticipation.setCollege(collegeModel);
            newParticipation.setAvailableEvent(availableEventModel);
            newParticipation.setTeamNumber(null);
            newParticipation.setWaitingListSequence(null);
            newParticipation.setArchived(false);
            this.collegeParticipationRepository.save(newParticipation);
        }

        // Check if trying to add NORMAL entry type PERFORMER when college already has
        // NORMAL PERFORMER participants
        // Note: ACCOMPANIST participants are allowed even if NORMAL PERFORMER
        // participants exist
        EntryType requestedEntryType = participantDto.getEntryType();
        ParticipantType requestedParticipantType = participantDto.getType();
        String requestedTeamNumber = participantDto.getTeamNumber();
        String requestedGroup = participantDto.getGroup();
        if (EntryType.NORMAL.equals(requestedEntryType) && ParticipantType.PERFORMER.equals(requestedParticipantType)) {
            List<ParticipantModel> existingParticipants = this.participantRepository.findByEvent_IdAndCollegeId(
                    participantDto.getEventIds().get(0), participantDto.getCollegeId());
            String existingTeamNumber = existingParticipants.stream().map(ParticipantModel::getTeamNumber)
                    .filter(Objects::nonNull).findFirst().orElse(null);
            String existingGroup = existingParticipants.stream().map(ParticipantModel::getGroup)
                    .filter(Objects::nonNull)
                    .findFirst().orElse(null);
            boolean isSameTeamNumber = (existingTeamNumber == null && requestedTeamNumber == null)
                    || (existingTeamNumber != null && existingTeamNumber.equals(requestedTeamNumber));
            boolean isSameGroup = (existingGroup == null && requestedGroup == null)
                    || (existingGroup != null && existingGroup.equals(requestedGroup));
            boolean isExistingTeam = isSameTeamNumber || isSameGroup;
            if (!existingParticipants.isEmpty() && !isExistingTeam) {
                boolean hasNormalPerformers = existingParticipants.stream()
                        .anyMatch(p -> EntryType.NORMAL.equals(p.getEntryType())
                                && ParticipantType.PERFORMER.equals(p.getType()));
                if (hasNormalPerformers) {
                    throw new IllegalArgumentException(
                            "Your college has already added participants with NORMAL entry type. Only one NORMAL entry is allowed per college. You can add OTSE or WAITING_LIST entry types instead.");
                }
            }
        }

        // Fetch the participant
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeIdAndGroup(
                participantDto.getEventIds().get(0), participantDto.getCollegeId(), participantDto.getGroup());

        // Check for max_slots
        if (participantDto.getType().equals(ParticipantType.PERFORMER)) {
            EventRuleModel performerRule = eventRuleModels.stream()
                    .filter(e -> e.getEventRuleTemplate().getId().equals(10L)).findAny().orElse(null);
            System.out.println("max_slots:" + Integer.parseInt(performerRule.getValue()));
            System.out.println(
                    "con: " + participantModels.stream().filter(p -> p.getType().equals(ParticipantType.PERFORMER)
                            && p.getGroup().equals(participantDto.getGroup())).count());
            if (participantModels.stream()
                    .filter(p -> p.getType().equals(ParticipantType.PERFORMER)
                            && p.getGroup().equals(participantDto.getGroup()))
                    .count() + 1 > Integer.parseInt(performerRule.getValue())) {
                throw new IllegalArgumentException("Performer can't be added now!");
            }
        }

        // Check for accompanist
        if (participantDto.getType().equals(ParticipantType.ACCOMPANIST)) {
            System.out.println(eventRuleModels);
            System.out.println("in accompanist: -");
            for (EventRuleModel eventRuleModel : eventRuleModels) {
                System.out.println(eventRuleModel.getAvailableEvent() + "\t" + eventRuleModel.getEventRuleTemplate());
            }
            EventRuleModel accompanistRule = eventRuleModels.stream()
                    .filter(e -> e.getEventRuleTemplate().getId().equals(3L)).findAny().orElse(null);
            if (accompanistRule == null) {
                throw new IllegalArgumentException("Accompanist can't be added!");
            }
            if (accompanistRule != null) {
                if (participantModels.stream()
                        .filter(p -> p.getType().equals(ParticipantType.ACCOMPANIST)
                                && p.getGroup().equals(participantDto.getGroup()))
                        .count() + 1 > Integer.parseInt(accompanistRule.getValue())) {
                    throw new IllegalArgumentException("Accompanist can't be added now!");
                }
            }

        }

        // Check for gender
        if (participantDto.isMale()) {

            EventRuleModel maleRule = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getId().equals(11L))
                    .findAny().orElse(null);
            if (maleRule != null) {
                if (participantModels.stream().filter(p -> p.isMale() && p.getGroup().equals(participantDto.getGroup()))
                        .count() + 1 > Integer.parseInt(maleRule.getValue())) {
                    throw new IllegalArgumentException("MALE_PARTICIPANT can't be added now!");
                }
            }

        } else {
            EventRuleModel femaleRule = eventRuleModels.stream()
                    .filter(e -> e.getEventRuleTemplate().getId().equals(12L)).findAny().orElse(null);
            if (femaleRule != null) {
                if (participantModels.stream()
                        .filter(p -> !p.isMale() && p.getGroup().equals(participantDto.getGroup())).count()
                        + 1 > Integer.parseInt(femaleRule.getValue())) {
                    throw new IllegalArgumentException("FEMALE_PARTICIPANT can't be added now!");
                }
            }

        }

        // Check if college has a waiting list sequence (assigned during enrollment)
        CollegeParticipationModel collegeParticipation = this.collegeParticipationRepository
                .findByCollegeAndAvailableEvent(collegeModel, availableEventModel)
                .orElse(null);

        String collegeWaitingListSequence = null;
        if (collegeParticipation != null && collegeParticipation.getWaitingListSequence() != null) {
            collegeWaitingListSequence = collegeParticipation.getWaitingListSequence();
        }

        // Determine quota type based on academic year, slot availability, and event
        // rules
        QuotaType quotaType = determineQuotaType(availableEventModel, eventRuleModels, eventModel);

        // If college has waiting list sequence, use WAITING_LIST_QUOTA
        if (collegeWaitingListSequence != null) {
            quotaType = QuotaType.WAITING_LIST_QUOTA;
        }

        // Create the participant
        ParticipantModel participantModel = this.modelMapper.map(participantDto, ParticipantModel.class);
        participantModel.setCollege(collegeModel);
        participantModel.setEntryType(participantModel.getEntryType());
        participantModel.getEvents().add(eventModel);
        participantModel.setHandPreference(participantDto.getHandPreference());
        participantModel.setGroup(participantDto.getGroup());

        // Set quota type and count
        participantModel.setQuotaType(quotaType);
        if (quotaType == QuotaType.WAITING_LIST_QUOTA) {
            // Use college's waiting list sequence (assigned during enrollment)
            if (collegeWaitingListSequence != null) {
                participantModel.setQuotaCount(collegeWaitingListSequence);
            } else {
                // Fallback: generate sequence if college doesn't have one (shouldn't happen)
                String quotaCount = generateWLQSequenceNumber(eventModel.getId());
                participantModel.setQuotaCount(quotaCount);
            }
            // Automatically set EntryType to WAITING_LIST when QuotaType is
            // WAITING_LIST_QUOTA
            participantModel.setEntryType(EntryType.WAITING_LIST);
        }

        // Save the participant
        participantModel = this.participantRepository.save(participantModel);
        // Save the events
        eventModel.getParticipants().add(participantModel);
        this.eventRepository.save(eventModel);

        // Emit WebSocket event for quota update
        try {
            Long availableEventId = availableEventModel.getId();
            Long slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId());
            Long waitingListSlotsOccupied = this.waitingListSlotsOccupiedByAvailableEventId(availableEventId);
            webSocketService.emitQuotaUpdate(availableEventId, slotsOccupied, waitingListSlotsOccupied);
            webSocketService.emitParticipantAdded(availableEventId, eventModel.getId());
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event: " + e.getMessage());
        }

        return this.participantModelToDto(participantModel);
    }

    @Override
    public Long slotsOccupied(Long eventId) {
        System.out.println("eventId: " + eventId);
        Long tmpSlotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventId);
        System.out.println(tmpSlotsOccupied);
        return tmpSlotsOccupied;
    }

    @Override
    public Long waitingListSlotsOccupied(Long eventId) {
        return this.participantRepository.countDistinctCollegesForEventByQuotaType(eventId,
                QuotaType.WAITING_LIST_QUOTA);
    }

    @Override
    public Long waitingListSlotsOccupiedByAvailableEventId(Long availableEventId) {
        // Count colleges with waitingListSequence set (assigned during enrollment)
        // This is the primary source of truth for waiting list queue
        try {
            AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId)
                    .orElse(null);
            if (availableEventModel == null) {
                return 0L;
            }

            List<CollegeParticipationModel> allParticipations = this.collegeParticipationRepository
                    .findByAvailableEvent(availableEventModel);

            // Count colleges with waitingListSequence set
            long collegesInWaitingList = allParticipations.stream()
                    .filter(cp -> cp.getWaitingListSequence() != null && cp.getWaitingListSequence().startsWith("WL_"))
                    .count();

            return collegesInWaitingList;
        } catch (Exception e) {
            System.err.println("Error calculating waiting list slots: " + e.getMessage());
            // Fallback: count colleges with participants in WAITING_LIST_QUOTA
            return this.participantRepository
                    .countDistinctCollegesForAvailableEventByQuotaType(availableEventId, QuotaType.WAITING_LIST_QUOTA);
        }
    }

    @Override
    public Long otseSlotsOccupiedByAvailableEventId(Long availableEventId) {
        try {
            return this.participantRepository
                    .countDistinctCollegesForAvailableEventByQuotaType(availableEventId, QuotaType.OTSE_QUOTA);
        } catch (Exception e) {
            System.err.println("Error calculating OTSE slots: " + e.getMessage());
            return 0L;
        }
    }

    public byte[] generateQRCodeImage(String data, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1); // Adjust margin as necessary

        BitMatrix bitMatrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, width, height, hints);
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                image.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF); // Black and White QR code
            }
        }

        // Convert image to byte array
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }

    @Override
    public PageResponse<ParticipantDto> getAllParticipants(int pageNumber) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<ParticipantModel> pageParticipant = this.participantRepository.findAll(pageable);

        List<ParticipantModel> participantModels = pageParticipant.getContent();

        List<ParticipantDto> participantDtos = participantModels.stream().map(this::participantModelToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageParticipant.getTotalPages(),
                pageParticipant.getTotalElements(),
                participantDtos);
    }

    @Override
    public ParticipantDto getParticipantById(Long id) {
        ParticipantModel foundParticipantModel = this.participantRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `PARTICIPANT` exist for id: " + id));

        return this.participantModelToDto(foundParticipantModel);
    }

    @Override
    public List<ParticipantDto> getParticipantByCollegeId(Long collegeId) {
        // Validate college exists and is not archived
        CollegeModel collegeModel = this.collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "College not found or has been archived for id: " + collegeId));

        List<ParticipantModel> participantModels = this.participantRepository.findByCollege(collegeModel);

        if (participantModels.isEmpty()) {
            return new ArrayList<>();
        }

        return participantModels.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public PageResponse<ParticipantDto> getParticipantByIsPresent(int pageNumber, boolean isPresent) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<ParticipantModel> pageParticipant = this.participantRepository.findByIsPresent(pageable, isPresent);

        List<ParticipantModel> participantModels = pageParticipant.getContent();

        List<ParticipantDto> participantDtos = participantModels.stream().map(this::participantModelToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageParticipant.getTotalPages(),
                pageParticipant.getTotalElements(),
                participantDtos);
    }

    @Override
    public List<ParticipantDto> getParticipantByEventId(Long eventId) {
        EventModel eventModel = new EventModel();
        eventModel.setId(eventId);
        System.out.println(eventId);
        List<ParticipantModel> participants = this.participantRepository.findByEvents_Id(eventId);
        if (participants.isEmpty()) {
            return new ArrayList<>();
        }
        return participants.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public List<ParticipantDto> getParticipantsByEventIdandCollegeId(Long eventId, Long collegeId) {
        EventModel eventModel = new EventModel();
        eventModel.setId(eventId);
        System.out.println(eventId);
        List<ParticipantModel> participants = this.participantRepository.findByEvent_IdAndCollegeId(eventId, collegeId);
        if (participants.isEmpty()) {
            return new ArrayList<>();
        }
        return participants.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public ParticipantDto updateParticipant(ParticipantDto participantDto) {
        ParticipantModel foundParticipantModel = this.participantRepository.findById(participantDto.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "No `PARTICIPANT` exist for id: " + participantDto.getId()));
        // Update the fields
        foundParticipantModel.setName(participantDto.getName());
        foundParticipantModel.setEmail(participantDto.getEmail());
        foundParticipantModel.setPresent(participantDto.isPresent());
        foundParticipantModel.setWhatsappNumber(participantDto.getWhatsappNumber());
        foundParticipantModel.setMale(participantDto.isMale());
        foundParticipantModel.setHandPreference(participantDto.getHandPreference());

        // Save the changes
        foundParticipantModel = this.participantRepository.save(foundParticipantModel);

        return this.participantModelToDto(foundParticipantModel);
    }

    @Override
    public boolean markPoints(Long points, String group) {
        List<ParticipantModel> participantModels = this.participantRepository.findByGroup(group);
        if (participantModels.isEmpty()) {
            throw new ResourceNotFoundException("No participant(s) found for identifier: " + group);
        }
        for (ParticipantModel participantModel : participantModels) {
            participantModel.setPoints(points);
            this.participantRepository.save(participantModel);
        }

        return true;
    }

    @Override
    public boolean deleteParticipant(Long id) {
        // Fetch the participant by ID
        ParticipantModel participant = this.participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found with ID: " + id));

        // Store event info before deletion for WebSocket emission
        List<EventModel> events = new ArrayList<>(participant.getEvents());

        // Remove the participant from each event's participants list
        for (EventModel event : events) {
            event.getParticipants().remove(participant);
            this.eventRepository.save(event); // Save each event after removing the participant
        }

        // Remove participant attendance
        List<ParticipantAttendanceDto> participantAttendanceDtos = this.participantAttendanceServices
                .getParticipantAttendancesByParticipantId(id);
        for (ParticipantAttendanceDto participantAttendanceDto : participantAttendanceDtos) {
            this.participantAttendanceServices.deleteAttendance(participantAttendanceDto.getId());
        }

        // Clear the events list in the participant itself to complete the cleanup
        participant.getEvents().clear();
        this.participantRepository.save(participant);

        // Now delete the participant
        this.participantRepository.deleteById(id);

        // Emit WebSocket event for quota update after deletion
        try {
            for (EventModel event : events) {
                Long availableEventId = event.getAvailableEvent().getId();
                Long slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(event.getId());
                Long waitingListSlotsOccupied = this.waitingListSlotsOccupiedByAvailableEventId(availableEventId);
                webSocketService.emitQuotaUpdate(availableEventId, slotsOccupied, waitingListSlotsOccupied);
                webSocketService.emitParticipantRemoved(availableEventId, event.getId());
            }
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event: " + e.getMessage());
        }

        return true;
    }

    @Override
    public void deleteParticipantsByEventId(Long eventId) {
        List<ParticipantModel> participantModels = this.participantRepository.findByEvents_Id(eventId);
        for (ParticipantModel participantModel : participantModels) {
            this.deleteParticipant(participantModel.getId());
        }
    }

    @Override
    public void deleteParticipantsByCollegesId(Long collegeId) {
        // Validate college exists (allow deletion even if archived)
        CollegeModel collegeModel = this.collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College not found for id: " + collegeId));

        List<ParticipantModel> participantModels = this.participantRepository
                .findByCollege(collegeModel);
        for (ParticipantModel participantModel : participantModels) {
            this.deleteParticipant(participantModel.getId());
        }
    }

    @Override
    public boolean correctGroupNameForParticipants() {
        List<CollegeModel> collegeModels = this.collegeRepository.findAll();
        List<CollegeModel> filteredColleges = new ArrayList<>();
        for (CollegeModel collegeModel : collegeModels) {
            if (collegeModel.isDetailsUploaded()) {
                filteredColleges.add(collegeModel);
            }
        }

        List<AvailableEventModel> availableEventModels = this.availableEventRepository.findAll();

        List<EventModel> eventModels = this.eventRepository.findAll();

        System.out.println("Total events: " + eventModels.size());
        for (EventModel eventModel : eventModels) {
            // System.out.println("doing event: " + (++eventCount) + "/" +
            // eventModels.size());

            AvailableEventModel availableEventModel = availableEventModels.stream()
                    .filter(a -> a.getId().equals(eventModel.getAvailableEvent().getId())).findFirst().orElse(null);
            if (availableEventModel == null) {
                continue;
            }
            eventModel.setAvailableEvent(availableEventModel);
            List<CollegeModel> participatedCollege = this.getParticipatedCollegesByEvent(eventModel, filteredColleges);
            for (int i = 0; i < participatedCollege.size(); i++) {
                CollegeModel collegeModel = participatedCollege.get(i);

                List<ParticipantModel> participantModels = this.participantRepository
                        .findByEvent_IdAndCollegeId(eventModel.getId(), collegeModel.getId());
                if (participantModels.isEmpty()) {
                    continue;
                }

                List<ParticipantModel> normalParticipants = participantModels.stream()
                        .filter(p -> p.getEntryType().equals(EntryType.NORMAL)).toList();
                for (ParticipantModel participantModel : normalParticipants) {
                    participantModel.setGroup(
                            collegeModel.getIcCode() + "_" + String.format("%02d", 1));
                    participantModel = this.participantRepository.save(participantModel);
                    System.out.println(participantModel.getGroup());
                }

                List<ParticipantModel> otseParticipants = participantModels.stream()
                        .filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();
                for (ParticipantModel participantModel : otseParticipants) {
                    String group = participantModel.getGroup();
                    int count = 0;

                    // System.out.println(participantModel.getGroup());

                    if (participantModel.getGroup().contains(collegeModel.getIcCode() + "_" + 'T')) {
                        System.out.println("iccode_T: " + participantModel.getGroup());
                    }

                    try {
                        if (group.contains("_OTSE_")) {
                            // Safely extract substring and parse to integer
                            if (group.length() > 12) {
                                count = 1;
                            } else {
                                // System.out.println(participantModel.getGroup());
                                throw new IllegalArgumentException("Invalid group format: " + group);
                            }
                        } else {
                            // Safely extract substring and parse to integer
                            if (group.length() > 7) {
                                count = Integer.parseInt(group.substring(7));
                            } else if (group.length() == 7) {
                                count = Integer.parseInt(String.valueOf(group.charAt(6)));
                            } else {

                                throw new IllegalArgumentException("Invalid group format: " + group);
                            }
                        }

                        // Set the modified group
                        participantModel.setGroup(collegeModel.getIcCode() + "_OTSE_" + String.format("%02d", count));
                        participantModel = this.participantRepository.save(participantModel);
                        // System.out.println(participantModel.getGroup());

                    } catch (Exception e) {
                        // Handle invalid group format or parsing errors
                        System.err.println("Error processing group: " + group + ". " + e.getMessage());
                    }
                }

                // for (ParticipantModel participantModel: participantModels) {
                // if (participantModel.getEntryType().equals(EntryType.NORMAL)) {
                // // Extract the count from the group (IC000_count)
                // int count = Integer.parseInt(participantModel.getGroup().substring(7));
                // participantModel.setGroup(
                // collegeModel.getIcCode() + "_" + String.format("%02d", count)
                // );
                // }
                // else {
                //
                // }
                // participantModel.setGroup(group);
                //
                //
                // p
                // this.participantRepository.save(participantModel);
                //
                // System.out.println("College: " + (i + 1) + "/" + participatedCollege.size() +
                // ", participants size: " + participantModels.size());
                // }

                // System.out.println("done college: " + (i + 1));
            }

        }

        return true;
    }

    private List<CollegeModel> getParticipatedCollegesByEvent(EventModel eventModel,
            List<CollegeModel> givenCollegeModels) {
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository
                .findByAvailableEvent(eventModel.getAvailableEvent());
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        List<CollegeModel> collegeModels = new ArrayList<>();
        for (CollegeParticipationModel collegeParticipationModel : collegeParticipationModels) {
            CollegeModel collegeModel = givenCollegeModels.stream()
                    .filter(c -> c.getId().equals(collegeParticipationModel.getCollege().getId())).findFirst()
                    .orElse(null);
            if (collegeModel == null) {
                continue;
            }
            collegeModels.add(collegeModel);
        }

        return collegeModels;
    }

    private ParticipantDto participantModelToDto(ParticipantModel participantModel) {
        if (participantModel == null) {
            return null;
        }

        ParticipantDto participantDto = this.modelMapper.map(participantModel, ParticipantDto.class);
        participantDto.setCollegeId(participantModel.getCollege().getId());
        // participantDto.setEvents(new ArrayList<>());
        participantDto.setEntryType(participantModel.getEntryType());
        List<PromotedRoundModel> promotedRoundModels = this.promotedRoundRepository.findByParticipant(participantModel);
        for (PromotedRoundModel promotedRoundModel : promotedRoundModels) {
            PromotedRoundDto promotedRoundDto = new PromotedRoundDto();
            promotedRoundDto.setId(promotedRoundDto.getId());
            promotedRoundDto.setParticipantId(participantDto.getId());
            promotedRoundDto.setRoundId(promotedRoundModel.getRound().getId());

            participantDto.getPromotedRoundDtos().add(promotedRoundDto);
        }

        // Convert the list of EventModel to a list of event IDs
        List<Long> eventIds = participantModel.getEvents().stream().map(EventModel::getId).collect(Collectors.toList());
        participantDto.setEventIds(eventIds);

        return participantDto;
    }

    public boolean disableParticipation(String group, Long eventId, boolean status) {
        System.out.println("event id: " + eventId);
        System.out.println("status: " + status);
        System.out.println("group: " + group);
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndGroup(eventId, group);
        for (ParticipantModel participantModel : participantModels) {
            System.out.println(participantModel.getEvents());
            participantModel.setDisableParticipation(status);
            System.out.println("saving participant: " + participantModel.getDisableParticipation());
            this.participantRepository.save(participantModel);
        }

        return true;
    }

}
