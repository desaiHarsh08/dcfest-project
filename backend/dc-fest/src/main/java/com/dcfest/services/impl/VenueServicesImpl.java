package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.dcfest.models.RoundModel;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.VenueDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.NotificationLogModel;
import com.dcfest.models.VenueModel;
import com.dcfest.repositories.NotificationLogRepository;
import com.dcfest.repositories.VenueRepository;
import com.dcfest.services.VenueServices;

@Service
public class VenueServicesImpl implements VenueServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Override
    public VenueDto createVenue(VenueDto venueDto) {
        // Create the venue
        VenueModel venueModel = this.modelMapper.map(venueDto, VenueModel.class);
        venueModel.setRound(new RoundModel(venueDto.getRoundId()));
        // Save the venue
        venueModel = this.venueRepository.save(venueModel);

        return this.venueModelToDto(venueModel);
    }

    @Override
    public List<VenueDto> getAllVenues() {
        List<VenueModel> venueModels = this.venueRepository.findAll();

        if (venueModels.isEmpty()) {
            return new ArrayList<>();
        }

        return venueModels.stream().map(this::venueModelToDto).collect(Collectors.toList());
    }


    @Override
    public VenueDto getVenueById(Long id) {
        VenueModel foundVenueModel = this.venueRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `VENUE` exist for id: " + id));

        return this.venueModelToDto(foundVenueModel);
    }

    @Override
    public VenueDto updateVenue(VenueDto venueDto) {
        VenueModel foundVenueModel = this.venueRepository.findById(venueDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No `VENUE` exist for id: " + venueDto.getId()));
        // Update the fields
        foundVenueModel.setName(venueDto.getName());
        foundVenueModel.setStart(venueDto.getStart());
        foundVenueModel.setEnd(venueDto.getEnd());
        // Save the changes
        foundVenueModel = this.venueRepository.save(foundVenueModel);

        return this.venueModelToDto(foundVenueModel);
    }

    @Override
    public boolean deleteVenue(Long id) {
        this.getVenueById(id);
        // Delete the venue
        this.venueRepository.deleteById(id);

        return true;
    }


    private VenueDto venueModelToDto(VenueModel venueModel) {
        if (venueModel == null) {
            return null;
        }

        VenueDto venueDto = this.modelMapper.map(venueModel, VenueDto.class);
        venueDto.setRoundId(venueModel.getRound().getId());

        return venueDto;
    }

}
