package com.dcfest.controllers;


import com.dcfest.dtos.CollegeRepresentativeDto;
import com.dcfest.services.CollegeRepresentativeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/representatives")
public class CollegeRepresentativeController {

    @Autowired
    private CollegeRepresentativeService representativeService;

    @PostMapping
    public ResponseEntity<?> createRepresentative(@RequestBody CollegeRepresentativeDto representativeDto) {
        return new ResponseEntity<>(
                representativeService.createRepresentative(representativeDto),
                HttpStatus.CREATED
        );
    }

    @PutMapping
    public ResponseEntity<?> updateRepresentative(@RequestBody CollegeRepresentativeDto representativeDto) {
        return new ResponseEntity<>(representativeService.updateRepresentative(representativeDto), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRepresentative(@PathVariable Long id) {
        return new ResponseEntity<>(
                representativeService.deleteRepresentative(id),
                HttpStatus.OK
        );

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRepresentativeById(@PathVariable Long id) {
        return new ResponseEntity<>(representativeService.getRepresentativeById(id), HttpStatus.OK);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<CollegeRepresentativeDto>> getRepresentativesByCollege(@PathVariable Long collegeId) {
        return new ResponseEntity<>(representativeService.getRepresentativesByCollege(collegeId), HttpStatus.OK);
    }
}
