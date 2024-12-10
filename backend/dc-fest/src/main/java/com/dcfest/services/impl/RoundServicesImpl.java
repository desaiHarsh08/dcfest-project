package com.dcfest.services.impl;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.RoundDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.RoundModel;
import com.dcfest.repositories.RoundRepository;
import com.dcfest.services.RoundServices;

@Service
public class RoundServicesImpl implements RoundServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private RoundRepository roundRepository;

    @Override
    public RoundDto createRound(RoundDto roundDto) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(roundDto.getAvailableEventId());
        // Create the round
        RoundModel roundModel = this.modelMapper.map(roundDto, RoundModel.class);
        roundModel.setAvailableEvent(availableEventModel);
        // Save the round
        roundModel = this.roundRepository.save(roundModel);

        return this.roundModelToDto(roundModel);
    }

    @Override
    public List<RoundDto> getAllRounds() {
        List<RoundModel> roundModels = this.roundRepository.findAll();
        if (roundModels.isEmpty()) {
            return new ArrayList<>();
        }

        return roundModels.stream().map(this::roundModelToDto).collect(Collectors.toList());
    }

    @Override
    public List<RoundDto> getRoundsByAvailableEventId(Long availableEventId) {
        AvailableEventModel availableEventModel = new AvailableEventModel();
        availableEventModel.setId(availableEventId);

        List<RoundModel> roundModels = this.roundRepository.findByAvailableEvent(availableEventModel);

        if (roundModels.isEmpty()) {
            return new ArrayList<>();
        }

        return roundModels.stream().map(this::roundModelToDto).collect(Collectors.toList());
    }

    @Override
    public RoundDto getRoundById(Long id) {
        RoundModel foundRoundModel = this.roundRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `ROUND` exist for id: " + id));

        return this.roundModelToDto(foundRoundModel);
    }

    @Override
    public RoundDto updateRound(RoundDto roundDto) {
        RoundModel foundRoundModel = this.roundRepository.findById(roundDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No `ROUND` exist for id: " + roundDto.getId()));

        // Update the fields
        foundRoundModel.setRoundType(roundDto.getRoundType());
        foundRoundModel.setQualifyNumber(roundDto.getQualifyNumber());
        foundRoundModel.setStatus(roundDto.getStatus());
        foundRoundModel.setNote(roundDto.getNote());
        foundRoundModel.setVenue(roundDto.getVenue());
        foundRoundModel.setStartDate(roundDto.getStartDate());
        foundRoundModel.setEndDate(roundDto.getEndDate());
        foundRoundModel.setStartTime(roundDto.getStartTime());
        foundRoundModel.setEndTime(roundDto.getEndTime());
        foundRoundModel.setDisableNotifications(roundDto.isDisableNotifications());
        // Save the changes
        foundRoundModel = this.roundRepository.save(foundRoundModel);

        return this.roundModelToDto(foundRoundModel);
    }

    // TODO
    @Override
    public boolean deleteRound(Long id) {
        this.getRoundById(id);
        // Delete all the participant attendances

        // Delete all the scorecards

        // Delete the round
//        this.roundRepository.deleteById(id);

        return false;
    }

    private RoundDto roundModelToDto(RoundModel roundModel) {
        if (roundModel == null) {
            return null;
        }

        RoundDto roundDto = this.modelMapper.map(roundModel, RoundDto.class);
        roundDto.setAvailableEventId(roundModel.getAvailableEvent().getId());

        return roundDto;
    }

}
