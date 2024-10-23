package com.dcfest.services.impl;

import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.CollegeParticipationModel;
import com.dcfest.repositories.CollegeParticipationRepository;
import com.dcfest.services.CollegeParticipationService;

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

    @Override
    public CollegeParticipationDto createParticipation(CollegeParticipationDto participationDto) {
        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(participationDto.getCollegeId());
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(participationDto.getAvailableEventId());
        CollegeParticipationModel collegeParticipationModel = new CollegeParticipationModel();
        collegeParticipationModel.setAvailableEvent(availableEventModel);
        collegeParticipationModel.setCollege(collegeModel);
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
        if (participationRepository.existsById(id)) {
            participationRepository.deleteById(id);
            return true;
        }
        return false; // Return false if the participation was not found
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
}
