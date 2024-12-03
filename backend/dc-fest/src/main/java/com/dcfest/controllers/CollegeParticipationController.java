package com.dcfest.controllers;

import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.models.CollegeParticipationModel;
import com.dcfest.services.CollegeParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participations")
public class CollegeParticipationController {

    @Autowired
    private CollegeParticipationService collegeParticipationService;

    @PostMapping
    public ResponseEntity<CollegeParticipationDto> createParticipation(
            @RequestBody CollegeParticipationDto participationDto) {
        System.out.println(participationDto);
        CollegeParticipationDto createdParticipation = collegeParticipationService.createParticipation(participationDto);
        return ResponseEntity.ok(createdParticipation);
    }

    @GetMapping
    public ResponseEntity<List<CollegeParticipationDto>> getAllParticipations() {
        List<CollegeParticipationDto> participations = collegeParticipationService.getAllParticipations();
        return ResponseEntity.ok(participations);
    }

    @GetMapping("/available-event/{availableEventId}")
    public ResponseEntity<List<CollegeParticipationDto>> getByAvailableEvent(@PathVariable Long availableEventId) {
        List<CollegeParticipationDto> participations = collegeParticipationService
                .getByAvailableEvent(availableEventId);
        return ResponseEntity.ok(participations);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<CollegeParticipationDto>> getByCollege(@PathVariable Long collegeId) {
        List<CollegeParticipationDto> participations = collegeParticipationService.getByCollege(collegeId);
        return ResponseEntity.ok(participations);
    }

    @GetMapping("/college/{collegeId}/available-event/{availableEventId}")
    public ResponseEntity<CollegeParticipationDto> getByCollegeAndAvailableEvent(
            @PathVariable Long collegeId, @PathVariable Long availableEventId) {
        CollegeParticipationDto participation = collegeParticipationService.getByCollegeAndAvailableEvent(collegeId,
                availableEventId);
        return ResponseEntity.ok(participation);
    }

    @GetMapping("/interested-colleges")
    public ResponseEntity<List<CollegeParticipationDto>> getInterestedColleges() {
    return new ResponseEntity<>(this.collegeParticipationService.getInterestedColleges(), HttpStatus.OK);
    }





    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipation(@PathVariable Long id) {
        boolean deleted = collegeParticipationService.deleteParticipation(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.notFound().build(); // 404 Not Found
    }
}
