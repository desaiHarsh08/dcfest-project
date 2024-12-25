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
    public ResponseEntity<List<ParticipantDto>> createParticipants(@RequestBody List<ParticipantDto> participantDtos) {
        List<ParticipantDto> createdParticipants = participantServices.createParticipants(participantDtos);
        return new ResponseEntity<>(createdParticipants, HttpStatus.CREATED);
    }

    @PostMapping("/add-participant")
    public ResponseEntity<ParticipantDto> addParticipant(@RequestBody ParticipantDto participantDto) {
        ParticipantDto addedParticipant = participantServices.addParticipant(participantDto);
        return new ResponseEntity<>(addedParticipant, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PageResponse<ParticipantDto>> getAllParticipants(@RequestParam("page") int pageNumber) {
        PageResponse<ParticipantDto> participants = participantServices.getAllParticipants(pageNumber);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @GetMapping("/occupied-slots")
    public ResponseEntity<Long> getSlotsOccupied(@RequestParam("eventId") Long eventId) {
        return new ResponseEntity<>(participantServices.slotsOccupied(eventId), HttpStatus.OK);
    }

    @GetMapping("/correct-group-names")
    public ResponseEntity<?> correctGroupNames() {
        return new ResponseEntity<>(participantServices.correctGroupNameForParticipants(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantDto> getParticipantById(@PathVariable Long id) {
        ParticipantDto participant = participantServices.getParticipantById(id);
        return new ResponseEntity<>(participant, HttpStatus.OK);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<ParticipantDto>> getParticipantByCollegeId(@PathVariable Long collegeId) {
        List<ParticipantDto> participants = participantServices.getParticipantByCollegeId(collegeId);
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }
    @GetMapping("/college-event")
    public ResponseEntity<List<ParticipantDto>> getParticipantByEventIdAndCollegeId(@RequestParam Long eventId, @RequestParam Long collegeId) {
        List<ParticipantDto> participants = participantServices.getParticipantsByEventIdandCollegeId(eventId, collegeId);
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

    @PutMapping("/{id}")
    public ResponseEntity<ParticipantDto> updateParticipant(@RequestBody ParticipantDto participantDto, @PathVariable Long id) {
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

    @GetMapping("/disable-participation")
    public ResponseEntity<?> disableParticipation(@RequestParam String group, @RequestParam Long eventId,  @RequestParam boolean status) {
        return new ResponseEntity<>(
                participantServices.disableParticipation(group, eventId, status),
                HttpStatus.OK
        );
    }

}
