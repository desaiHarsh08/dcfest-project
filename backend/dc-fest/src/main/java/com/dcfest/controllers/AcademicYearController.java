package com.dcfest.controllers;

import com.dcfest.dtos.AcademicYearDto;
import com.dcfest.services.AcademicYearService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic-years")
public class AcademicYearController {

    @Autowired
    private AcademicYearService academicYearService;

    @PostMapping
    public ResponseEntity<AcademicYearDto> createAcademicYear(@RequestBody AcademicYearDto academicYearDto) {
        AcademicYearDto createdAcademicYear = academicYearService.createAcademicYear(academicYearDto);
        return new ResponseEntity<>(createdAcademicYear, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AcademicYearDto>> getAllAcademicYears() {
        List<AcademicYearDto> academicYears = academicYearService.getAllAcademicYears();
        return new ResponseEntity<>(academicYears, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearDto> getAcademicYearById(@PathVariable Long id) {
        AcademicYearDto academicYear = academicYearService.getAcademicYearById(id);
        return new ResponseEntity<>(academicYear, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<AcademicYearDto> getActiveAcademicYear() {
        try {
            AcademicYearDto academicYear = academicYearService.getActiveAcademicYear();
            return new ResponseEntity<>(academicYear, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/registration-deadline-status")
    public ResponseEntity<Map<String, Object>> getRegistrationDeadlineStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AcademicYearDto activeYear = academicYearService.getActiveAcademicYear();
            boolean isClosed = academicYearService.isRegistrationDeadlineClosed();
            boolean isOpen = academicYearService.isRegistrationOpen();
            
            response.put("isDeadlineClosed", isClosed);
            response.put("isRegistrationOpen", isOpen);
            response.put("activeAcademicYear", activeYear);
            response.put("currentDateTime", java.time.LocalDateTime.now());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            // If no active academic year, registration is considered closed
            response.put("isDeadlineClosed", true);
            response.put("isRegistrationOpen", false);
            response.put("activeAcademicYear", null);
            response.put("currentDateTime", java.time.LocalDateTime.now());
            response.put("message", "No active academic year found");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYearDto> updateAcademicYear(
            @RequestBody AcademicYearDto academicYearDto,
            @PathVariable Long id) {
        academicYearDto.setId(id);
        AcademicYearDto updatedAcademicYear = academicYearService.updateAcademicYear(academicYearDto);
        return new ResponseEntity<>(updatedAcademicYear, HttpStatus.OK);
    }

    @PutMapping("/{id}/set-active")
    public ResponseEntity<AcademicYearDto> setActiveAcademicYear(@PathVariable Long id) {
        AcademicYearDto academicYear = academicYearService.setActiveAcademicYear(id);
        return new ResponseEntity<>(academicYear, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable Long id) {
        boolean isDeleted = academicYearService.deleteAcademicYear(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}

