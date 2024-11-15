package com.dcfest.controllers;

import com.dcfest.dtos.VenueDto;
import com.dcfest.services.VenueServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueServices venueServices;

    @PostMapping
    public ResponseEntity<VenueDto> createVenue(@RequestBody VenueDto venueDto) {
        VenueDto createdVenue = venueServices.createVenue(venueDto);
        return new ResponseEntity<>(createdVenue, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueDto>> getAllVenues() {
        List<VenueDto> venues = venueServices.getAllVenues();
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDto> getVenueById(@PathVariable Long id) {
        VenueDto venue = venueServices.getVenueById(id);
        return new ResponseEntity<>(venue, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueDto> updateVenue(@RequestBody VenueDto venueDto, @PathVariable Long id) {
        VenueDto updatedVenue = venueServices.updateVenue(venueDto);
        return new ResponseEntity<>(updatedVenue, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        boolean isDeleted = venueServices.deleteVenue(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
