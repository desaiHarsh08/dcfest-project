package com.dcfest.services.impl;

import com.dcfest.constants.QuotaType;
import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.exceptions.RegisteredSlotsAvailableException;
import com.dcfest.exceptions.RegistrationDeadlineClosedException;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import com.dcfest.services.AcademicYearService;
import com.dcfest.services.CollegeParticipationService;

import com.dcfest.services.ParticipantServices;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Service
public class CollegeParticipationServiceImpl implements CollegeParticipationService {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CollegeParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private ParticipantServices participantServices;

    @Autowired
    private EventRuleRepository eventRuleRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private com.dcfest.services.WebSocketService webSocketService;

    @Autowired
    private AcademicYearService academicYearService;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public CollegeParticipationDto createParticipation(CollegeParticipationDto participationDto) {
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

        // Validate college exists and is not archived
        CollegeModel collegeModel = this.collegeRepository.findById(participationDto.getCollegeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "College not found or has been archived for id: " + participationDto.getCollegeId()));

        // Validate available event exists
        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(participationDto.getAvailableEventId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Available event not found for id: " + participationDto.getAvailableEventId()));

        List<EventRuleModel> eventRuleModels = this.eventRuleRepository
                .findByAvailableEvent(availableEventModel);
        EventRuleModel eventRuleModel = eventRuleModels.stream()
                .filter(e -> e.getEventRuleTemplate().getName().equalsIgnoreCase("REGISTERED_SLOTS_AVAILABLE"))
                .findFirst().orElse(null);
        if (eventRuleModel == null) {
            throw new IllegalArgumentException("Unable to find event rule.");
        }

        int maxSlotsAvailable = Integer.parseInt(eventRuleModel.getValue());

//        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository
//                .findByAvailableEvent(availableEventModel);

        // int slotsOccupied = collegeParticipationModels.size();
        long registeredCount = participationRepository.findByAvailableEvent(availableEventModel).stream()
                .filter(cp -> cp.getWaitingListSequence() == null)
                .count();

        long waitingListCount = participationRepository.findByAvailableEvent(availableEventModel).stream()
                .filter(cp -> cp.getWaitingListSequence() != null && cp.getWaitingListSequence().startsWith("WL_"))
                .count();

        // Check if registration slots are full
//        boolean isRegistrationFull = registeredCount >= maxSlotsAvailable;
//        String waitingListSequence = null;
//
//
//        if (isRegistrationFull) {
//            // Check if waiting list slots are available
//            EventRuleModel waitingListSlotsEventRule = eventRuleModels.stream()
//                    .filter(e -> e.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS"))
//                    .findFirst().orElse(null);
//
//            if (waitingListSlotsEventRule != null) {
//                int maxWaitingListSlots = Integer.parseInt(waitingListSlotsEventRule.getValue());
//
//                // Count colleges already in waiting list (those with waitingListSequence set)
//                List<CollegeParticipationModel> existingParticipations = this.participationRepository
//                        .findByAvailableEvent(availableEventModel);
//                long waitingListCollegesCount = existingParticipations.stream()
//                        .filter(cp -> cp.getWaitingListSequence() != null
//                                && cp.getWaitingListSequence().startsWith("WL_"))
//                        .count();
//
//                if (waitingListCount >= maxWaitingListSlots) {
//                    // Both registration and waiting list are full
//                    throw new RegisteredSlotsAvailableException(
//                            "Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
//                } else {
//
//                    // Waiting list slots are available, assign sequence number
//                    waitingListSequence = generateNextWaitingListSequence(availableEventModel);
//                }
//            } else {
//                // No waiting list quota available, registration is full
//                throw new RegisteredSlotsAvailableException(
//                        "Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
//            }
//        }

        // Create the college's participation

        // === FINAL 100% SAFE QUOTA LOGIC (MAX 30 TOTAL) ===
        EventRuleModel waitingListRule = eventRuleModels.stream()
                .filter(e -> e.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS"))
                .findFirst()
                .orElse(null);

        int maxWaitingListSlots = waitingListRule != null
                ? Integer.parseInt(waitingListRule.getValue())
                : 0;

        int totalAllowed = maxSlotsAvailable + maxWaitingListSlots;

        // HARD LIMIT: Total registered + waiting list must not exceed total allowed
        if (registeredCount + waitingListCount >= totalAllowed) {
            throw new RegisteredSlotsAvailableException(
                    "Event is completely full! All " + maxSlotsAvailable +
                            " registration slots + " + maxWaitingListSlots +
                            " waiting list slots are taken. Total capacity: " + totalAllowed + ". " +
                            "Contact dean.office@thebges.edu.in for assistance."
            );
        }

        String waitingListSequence = null;

        if (registeredCount >= maxSlotsAvailable) {
            // Registration is full → go to waiting list (already checked total limit above)
            waitingListSequence = generateNextWaitingListSequence(availableEventModel);
        }

        CollegeParticipationModel collegeParticipationModel = new CollegeParticipationModel();
        collegeParticipationModel.setAvailableEvent(availableEventModel);
        collegeParticipationModel.setCollege(collegeModel);
        collegeParticipationModel.setWaitingListSequence(waitingListSequence); // Set sequence if in waiting list

        collegeParticipationModel = this.participationRepository.save(collegeParticipationModel);

        // Emit WebSocket event for enrollment (participation created)
        try {
            Long availableEventId = availableEventModel.getId();
            // Get updated slots count after enrollment
            Long updatedSlotsOccupied = (long) this.participationRepository.findByAvailableEvent(availableEventModel)
                    .size();
            Long waitingListSlotsOccupied = this.participantServices
                    .waitingListSlotsOccupiedByAvailableEventId(availableEventId);
            webSocketService.emitQuotaUpdate(availableEventId, updatedSlotsOccupied, waitingListSlotsOccupied);
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event on enrollment: " + e.getMessage());
        }

        return this.collegeParticipationModelToDto(collegeParticipationModel);
    }

    @Override
    public List<CollegeParticipationDto> getAllParticipations() {
        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository.findAll();
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeParticipationModels.stream()
                .map(this::collegeParticipationModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CollegeParticipationDto> getByAvailableEvent(Long availableEventId) {
        // Validate available event exists
        AvailableEventModel availableEvent = this.availableEventRepository.findById(availableEventId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Available event not found for id: " + availableEventId));

        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository
                .findByAvailableEvent(availableEvent);
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeParticipationModels.stream()
                .map(this::collegeParticipationModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CollegeParticipationDto> getByCollege(Long collegeId) {
        // Validate college exists and is not archived
        CollegeModel collegeModel = this.collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "College not found or has been archived for id: " + collegeId));

        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository
                .findByCollege(collegeModel);

        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeParticipationModels.stream()
                .map(this::collegeParticipationModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CollegeParticipationDto getByCollegeAndAvailableEvent(
            Long collegeId, Long availableEventId) {

        // Validate college exists and is not archived
        CollegeModel collegeModel = this.collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "College not found or has been archived for id: " + collegeId));

        // Validate available event exists
        AvailableEventModel availableEvent = this.availableEventRepository.findById(availableEventId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Available event not found for id: " + availableEventId));

        CollegeParticipationModel collegeParticipationModel = this.participationRepository
                .findByCollegeAndAvailableEvent(collegeModel, availableEvent).orElseThrow(
                        () -> new ResourceNotFoundException("No `COLLEGE_PARTICIPATION` exist for collge_id ("
                                + collegeId + ") and available_event_id (" + availableEventId + ""));

        return this.collegeParticipationModelToDto(collegeParticipationModel);
    }

    @Override
    public boolean deleteParticipation(Long id) {
        // Check for whether college's participation exist.
        CollegeParticipationModel existCollegeParticipationModel = this.participationRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException("No college_participation exist for id: " + id));
        System.out.println(existCollegeParticipationModel);

        AvailableEventModel availableEventModel = existCollegeParticipationModel.getAvailableEvent();

        // Fetch the event from available_event (may be null if no participants added yet)
        EventModel eventModel = this.eventRepository
                .findByAvailableEvent(availableEventModel)
                .orElse(null);

        // Check if the deleted college was in the waiting list
        String deletedCollegeSequence = existCollegeParticipationModel.getWaitingListSequence();
        boolean wasInWaitingList = deletedCollegeSequence != null && deletedCollegeSequence.startsWith("WL_");

        // Delete the participants only if EventModel exists
        if (eventModel != null) {
            List<ParticipantModel> participantModels = this.participantRepository
                    .findByEvent_IdAndCollegeId(eventModel.getId(), existCollegeParticipationModel.getCollege().getId());
            for (ParticipantModel participantModel : participantModels) {
                if (!this.participantServices.deleteParticipant(participantModel.getId())) {
                    throw new IllegalArgumentException("Unable to delete the participants");
                }
            }
        } else {
            // If EventModel doesn't exist, try to delete participants by availableEventId and collegeId
            // This handles the case where college enrolled but hasn't added participants yet
            List<ParticipantModel> participantModels = this.participantRepository
                    .findByAvailableEventId(availableEventModel.getId()).stream()
                    .filter(p -> p.getCollege().getId().equals(existCollegeParticipationModel.getCollege().getId()))
                    .collect(Collectors.toList());
            for (ParticipantModel participantModel : participantModels) {
                if (!this.participantServices.deleteParticipant(participantModel.getId())) {
                    throw new IllegalArgumentException("Unable to delete the participants");
                }
            }
        }

        // Delete the college's participation (must be done before updating sequences)
        participationRepository.deleteById(id);

        // If the deleted college was in the waiting list, update sequences for
        // remaining colleges
        if (wasInWaitingList) {
            updateWaitingListSequencesAfterDeletion(availableEventModel, deletedCollegeSequence);
        }

        // After deletion, check if we should promote waiting list participants
        // (This will promote the first waiting list college if there's a vacant
        // registration slot)
        // Only promote if EventModel exists, otherwise we can't count slots properly
        if (eventModel != null) {
            promoteWaitingListParticipant(eventModel, availableEventModel);
        }

        // Emit WebSocket event for quota update after deletion
        try {
            Long availableEventId = availableEventModel.getId();
            Long slotsOccupied = eventModel != null 
                    ? this.participantServices.slotsOccupied(eventModel.getId())
                    : 0L; // If no EventModel, no slots are occupied
            Long waitingListSlotsOccupied = this.participantServices
                    .waitingListSlotsOccupiedByAvailableEventId(availableEventId);
            webSocketService.emitQuotaUpdate(availableEventId, slotsOccupied, waitingListSlotsOccupied);
            if (eventModel != null) {
                webSocketService.emitParticipantRemoved(availableEventId, eventModel.getId());
            }
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event: " + e.getMessage());
        }

        return true;
    }

    @Override
    public CollegeParticipationDto getParticipationById(Long id) {
        CollegeParticipationModel collegeParticipationModel = this.participationRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No participation exist for id: " + id));

        return this.collegeParticipationModelToDto(collegeParticipationModel);
    }

    private CollegeParticipationDto collegeParticipationModelToDto(
            CollegeParticipationModel collegeParticipationModel) {
        if (collegeParticipationModel == null) {
            return null;
        }
        CollegeParticipationDto collegeParticipationDto = this.modelMapper.map(collegeParticipationModel,
                CollegeParticipationDto.class);
        collegeParticipationDto.setCollegeId(collegeParticipationModel.getCollege().getId());
        collegeParticipationDto.setAvailableEventId(collegeParticipationModel.getAvailableEvent().getId());
        collegeParticipationDto.setWaitingListSequence(collegeParticipationModel.getWaitingListSequence());

        return collegeParticipationDto;
    }

    public List<CollegeParticipationDto> getInterestedColleges() {
        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository
                .findByEventWithEmptyParticipants();
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeParticipationModels.stream().map(this::collegeParticipationModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void realignWaitlistForAvailableEvent(Long availableEventId) {
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId)
                .orElse(null);
        if (availableEventModel == null) {
            return;
        }

        EventModel eventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElse(null);
        if (eventModel == null) {
            return;
        }

        this.promoteWaitingListParticipant(eventModel, availableEventModel);
    }

    /**
     * Updates waiting list sequences after a college in the waiting list is
     * deleted.
     * Decrements sequence numbers for all colleges that came after the deleted
     * college.
     */
    private void updateWaitingListSequencesAfterDeletion(AvailableEventModel availableEventModel,
            String deletedSequence) {
        try {
            int deletedSequenceNumber = Integer.parseInt(deletedSequence.substring(3)); // "WL_" is 3 chars

            // Get all remaining waiting list participations
            List<CollegeParticipationModel> allParticipations = this.participationRepository
                    .findByAvailableEvent(availableEventModel);

            for (CollegeParticipationModel participation : allParticipations) {
                if (participation.getWaitingListSequence() != null &&
                        participation.getWaitingListSequence().startsWith("WL_")) {
                    try {
                        int currentSequence = Integer.parseInt(participation.getWaitingListSequence().substring(3)); // "WL_"
                                                                                                                     // is
                                                                                                                     // 3
                                                                                                                     // chars

                        // If this college came after the deleted one, decrement its sequence
                        if (currentSequence > deletedSequenceNumber) {
                            int newSequence = currentSequence - 1;
                            participation.setWaitingListSequence(String.format("WL_%03d", newSequence));
                            this.participationRepository.save(participation);

                            // Also update all participants of this college
                            List<ParticipantModel> participants = this.participantRepository
                                    .findByAvailableEventId(availableEventModel.getId()).stream()
                                    .filter(p -> p.getCollege().getId().equals(participation.getCollege().getId()))
                                    .filter(p -> p.getQuotaType() == QuotaType.WAITING_LIST_QUOTA)
                                    .collect(Collectors.toList());

                            CollegeModel collegeModel = this.collegeRepository.findById(participants.get(0).getCollege().getId()).orElse(null);

                            if (collegeModel == null) continue;;

                            for (ParticipantModel participant : participants) {
                                participant.setQuotaCount(String.format("WL_%03d", newSequence));
                                participant.setGroup(collegeModel.getIcCode() + "_" + participation.getWaitingListSequence());
                                this.participantRepository.save(participant);
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Skip if sequence number is invalid
                        continue;
                    }
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("Error updating waiting list sequences after deletion: " + e.getMessage());
        }
    }

    /**
     * Generates the next waiting list sequence number for college participations
     * Format: WL_001, WL_002, etc.
     */
    private String generateNextWaitingListSequence(AvailableEventModel availableEventModel) {
        List<CollegeParticipationModel> allParticipations = this.participationRepository
                .findByAvailableEvent(availableEventModel);

        // Find the maximum sequence number
        int maxSequence = 0;
        for (CollegeParticipationModel cp : allParticipations) {
            if (cp.getWaitingListSequence() != null && cp.getWaitingListSequence().startsWith("WL_")) {
                try {
                    int seq = Integer.parseInt(cp.getWaitingListSequence().substring(3)); // "WL_" is 3 chars
                    if (seq > maxSequence) {
                        maxSequence = seq;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid sequence numbers
                }
            }
        }

        // Return the next sequence number
        return String.format("WL_%03d", maxSequence + 1);
    }

    /**
     * Promotes the first waiting list college to REGISTRATION_QUOTA if:
     * 1. Waiting list quota exists for the event
     * 2. There are vacant registration slots
     * Also updates remaining waiting list colleges' sequence numbers
     */
    private void promoteWaitingListParticipant(EventModel eventModel, AvailableEventModel availableEventModel) {
        // Get event rules
        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(availableEventModel);

        // Check if WAITING_LIST_SLOTS rule exists
        EventRuleModel waitingListSlotsEventRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("WAITING_LIST_SLOTS"))
                .findAny()
                .orElse(null);

        if (waitingListSlotsEventRule == null) {
            // No waiting list quota exists, nothing to promote
            return;
        }

        // Check for REGISTERED_SLOTS_AVAILABLE
        EventRuleModel registeredSlotsRule = eventRuleModels.stream()
                .filter(ele -> ele.getEventRuleTemplate().getId().equals(6L)
                        || ele.getEventRuleTemplate().getName().equalsIgnoreCase("REGISTERED_SLOTS_AVAILABLE"))
                .findAny()
                .orElse(null);

        if (registeredSlotsRule == null) {
            return;
        }

        // Check if there are vacant registration slots
        int maxSlotsAvailable = Integer.parseInt(registeredSlotsRule.getValue());
        Long slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId());

        if (slotsOccupied >= maxSlotsAvailable) {
            // No vacant slots available
            return;
        }

        // Find all waiting list college participations, sorted by sequence
        List<CollegeParticipationModel> allParticipations = this.participationRepository
                .findByAvailableEvent(availableEventModel);
        List<CollegeParticipationModel> waitingListParticipations = allParticipations.stream()
                .filter(cp -> cp.getWaitingListSequence() != null && cp.getWaitingListSequence().startsWith("WL_"))
                .sorted((cp1, cp2) -> {
                    // Sort by WL sequence number (ascending)
                    try {
                        int seq1 = Integer.parseInt(cp1.getWaitingListSequence().substring(3)); // "WL_" is 3 chars
                        int seq2 = Integer.parseInt(cp2.getWaitingListSequence().substring(3)); // "WL_" is 3 chars
                        return Integer.compare(seq1, seq2);
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .collect(Collectors.toList());

        if (waitingListParticipations.isEmpty()) {
            // No waiting list colleges to promote
            return;
        }

        // Promote the first college (lowest WL sequence number)
        CollegeParticipationModel firstInQueue = waitingListParticipations.get(0);
        firstInQueue.setWaitingListSequence(null); // Clear waiting list sequence
        this.participationRepository.save(firstInQueue);

        // Update all participants of this college to REGISTRATION_QUOTA
        List<ParticipantModel> collegeParticipants = this.participantRepository
                .findByAvailableEventId(availableEventModel.getId()).stream()
                .filter(p -> p.getCollege().getId().equals(firstInQueue.getCollege().getId()))
                .filter(p -> p.getQuotaType() == QuotaType.WAITING_LIST_QUOTA)
                .collect(Collectors.toList());

        CollegeModel collegeModel = this.collegeRepository.findById(collegeParticipants.get(0).getCollege().getId()).orElseThrow(
                () -> new ResourceNotFoundException("College not found")
        );

        for (ParticipantModel participant : collegeParticipants) {
            String group = collegeModel.getIcCode() + "_01";
            participant.setQuotaType(QuotaType.REGISTRATION_QUOTA);
            participant.setQuotaCount(null); // Clear WL sequence
            participant.setGroup(group);
            participant.setEntryType(com.dcfest.constants.EntryType.NORMAL); // Reset to NORMAL
            this.participantRepository.save(participant);
        }

        // Update remaining waiting list colleges: decrement their sequence numbers
        for (int i = 1; i < waitingListParticipations.size(); i++) {
            CollegeParticipationModel participation = waitingListParticipations.get(i);
            try {
                int currentSequence = Integer.parseInt(participation.getWaitingListSequence().substring(3)); // "WL_" is
                                                                                                             // 3 chars
                int newSequence = currentSequence - 1;
                participation.setWaitingListSequence(String.format("WL_%03d", newSequence));
                this.participationRepository.save(participation);

                // Also update all participants of this college
                List<ParticipantModel> participants = this.participantRepository
                        .findByAvailableEventId(availableEventModel.getId()).stream()
                        .filter(p -> p.getCollege().getId().equals(participation.getCollege().getId()))
                        .filter(p -> p.getQuotaType() == QuotaType.WAITING_LIST_QUOTA)
                        .collect(Collectors.toList());

                CollegeModel waitingCollegeModel = this.collegeRepository.findById(collegeParticipants.get(0).getCollege().getId()).orElseThrow(
                        () -> new ResourceNotFoundException("College not found")
                );

                for (ParticipantModel participant : participants) {
                    String group = waitingCollegeModel.getIcCode() + "_" + participation.getWaitingListSequence();
                    participant.setQuotaCount(participation.getWaitingListSequence());
                    participant.setGroup(group);
                    this.participantRepository.save(participant);
                }
            } catch (NumberFormatException e) {
                // Skip if sequence number is invalid
                continue;
            }
        }

        // Emit WebSocket event for waiting list promotion
        try {
            Long availableEventId = availableEventModel.getId();
            Long slotsOccupiedAfterPromotion = this.participantRepository
                    .countDistinctCollegesForEvent(eventModel.getId());
            Long waitingListSlotsOccupied = this.participantServices
                    .waitingListSlotsOccupiedByAvailableEventId(availableEventId);
            webSocketService.emitQuotaUpdate(availableEventId, slotsOccupiedAfterPromotion, waitingListSlotsOccupied);
            webSocketService.emitWaitingListPromotion(availableEventId);
        } catch (Exception e) {
            System.err.println("Error emitting WebSocket event: " + e.getMessage());
        }
    }

}
