package com.dcfest.controllers;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.services.ParticipantServices;
import com.dcfest.utils.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    @Autowired
    private ParticipantServices participantServices;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ParticipantDto> createParticipant(@RequestBody ParticipantDto participantDto) {
        ParticipantDto createdParticipant = participantServices.createParticipant(participantDto);
        return new ResponseEntity<>(createdParticipant, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PageResponse<ParticipantDto>> getAllParticipants(@RequestParam("page") int pageNumber) {
        PageResponse<ParticipantDto> participants = participantServices.getAllParticipants(pageNumber);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantDto> getParticipantById(@PathVariable Long id) {
        ParticipantDto participant = participantServices.getParticipantById(id);
        return new ResponseEntity<>(participant, HttpStatus.OK);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<PageResponse<ParticipantDto>> getParticipantByCollegeId(@RequestParam int pageNumber, @PathVariable Long collegeId) {
        PageResponse<ParticipantDto> participants = participantServices.getParticipantByCollegeId(pageNumber, collegeId);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @GetMapping("/is-present")
    public ResponseEntity<PageResponse<ParticipantDto>> getParticipantByIsPresent(@RequestParam int pageNumber, @RequestParam boolean isPresent) {
        PageResponse<ParticipantDto> participants = participantServices.getParticipantByIsPresent(pageNumber, isPresent);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ParticipantDto>> getParticipantByEventId(@PathVariable Long eventId) {
        List<ParticipantDto> participants = participantServices.getParticipantByEventId(eventId);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<ParticipantDto> updateParticipant(@RequestBody ParticipantDto participantDto) {
        ParticipantDto updatedParticipant = participantServices.updateParticipant(participantDto);
        return new ResponseEntity<>(updatedParticipant, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        boolean isDeleted = participantServices.deleteParticipant(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/event/{eventId}")
    public ResponseEntity<Void> deleteParticipantsByEventId(@PathVariable Long eventId) {
        participantServices.deleteParticipantsByEventId(eventId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/college/{collegeId}")
    public ResponseEntity<Void> deleteParticipantsByCollegesId(@PathVariable Long collegeId) {
        participantServices.deleteParticipantsByCollegesId(collegeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
