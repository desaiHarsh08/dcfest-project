package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.VenueDto;

public interface VenueServices {

    VenueDto createVenue(VenueDto venueDto);

    List<VenueDto> getAllVenues();

    VenueDto getVenueById(Long id);

    VenueDto updateVenue(VenueDto venueDto);

    boolean deleteVenue(Long id);

}
