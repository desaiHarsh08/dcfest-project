package com.dcfest.services.impl;

import com.dcfest.dtos.CollegeDto;
import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.exceptions.RegisteredSlotsAvailableException;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import com.dcfest.services.CollegeParticipationService;

import com.dcfest.services.ParticipantServices;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;

@Service
public class CollegeParticipationServiceImpl implements CollegeParticipationService {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CollegeParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private ParticipantServices participantServices;

    @Autowired
    private EventRuleRepository eventRuleRepository;

    @Override
    public CollegeParticipationDto createParticipation(CollegeParticipationDto participationDto) {
        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(new AvailableEventModel(participationDto.getAvailableEventId()));
        EventRuleModel eventRuleModel = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getName().equalsIgnoreCase("REGISTERED_SLOTS_AVAILABLE")).findFirst().orElse(null);
        if(eventRuleModel == null){
            throw new IllegalArgumentException("Unable to find event rule.");
        }

        int maxSlotsAvailable = Integer.parseInt(eventRuleModel.getValue());

        List<CollegeParticipationModel> collegeParticipationModels =  this.participationRepository.findByAvailableEvent(new AvailableEventModel(participationDto.getAvailableEventId()));

        int slotsOccupied = collegeParticipationModels.size();

        if(slotsOccupied >= maxSlotsAvailable){
            throw new RegisteredSlotsAvailableException("Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
        }

        // Create the college's participation
        CollegeParticipationModel collegeParticipationModel = new CollegeParticipationModel();
        collegeParticipationModel.setAvailableEvent(new AvailableEventModel(participationDto.getAvailableEventId()));
        collegeParticipationModel.setCollege(new CollegeModel(participationDto.getCollegeId()));

        return this.collegeParticipationModelToDto(this.participationRepository.save(collegeParticipationModel));
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
        AvailableEventModel availableEvent = new AvailableEventModel();
        availableEvent.setId(availableEventId);
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
    public List<CollegeParticipationDto> getByCollege(Long collegeParticipationId) {
        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(collegeParticipationId);
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

        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(collegeId);

        AvailableEventModel availableEvent = new AvailableEventModel();
        availableEvent.setId(availableEventId);

        CollegeParticipationModel collegeParticipationModel = this.participationRepository
                .findByCollegeAndAvailableEvent(collegeModel, availableEvent).orElseThrow(
                        () -> new ResourceNotFoundException("No `COLLEGE_PARTICIPATION` exist for collge_id ("
                                + collegeId + ") and available_event_id (" + availableEventId + ""));

        return this.collegeParticipationModelToDto(collegeParticipationModel);
    }

    @Override
    public boolean deleteParticipation(Long id) {
        // Check for whether college's participation exist.
        CollegeParticipationModel existCollegeParticipationModel = this.participationRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No college_participation exist for id: " + id)
        );
        // Fetch the event from available_event
        EventModel eventModel = this.eventRepository.findByAvailableEvent(new AvailableEventModel(existCollegeParticipationModel.getAvailableEvent().getId())).orElse(null);
        if (eventModel == null) {
            throw new IllegalArgumentException("Unable to find the event from the available_event");
        }
        // Delete the participants
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(eventModel.getId(), existCollegeParticipationModel.getCollege().getId());
        for (ParticipantModel participantModel: participantModels) {
            if (!this.participantServices.deleteParticipant(participantModel.getId())) {
                throw new IllegalArgumentException("Unable to delete the participants");
            }
        }
        // Delete the college's participation
        participationRepository.deleteById(id);
        return true;
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

        return collegeParticipationDto;
    }

    public List<CollegeParticipationDto> getInterestedColleges() {
        List<CollegeParticipationModel> collegeParticipationModels = this.participationRepository.findByEventWithEmptyParticipants();
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }


        return collegeParticipationModels.stream().map(this::collegeParticipationModelToDto).collect(Collectors.toList());
    }

}
