package com.dcfest.controllers;

import com.dcfest.dtos.CollegeDto;
import com.dcfest.services.CollegeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    @Autowired
    private CollegeServices collegeServices;

    @PostMapping
    public ResponseEntity<CollegeDto> createCollege(@RequestBody CollegeDto collegeDto) {
        System.out.println(collegeDto);
        CollegeDto createdCollege = collegeServices.createCollege(collegeDto);
        return new ResponseEntity<>(createdCollege, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CollegeDto>> getAllColleges() {
        List<CollegeDto> colleges = collegeServices.getAllColleges();
        return new ResponseEntity<>(colleges, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollegeDto> getCollegeById(@PathVariable Long id) {
        CollegeDto college = collegeServices.getCollegeById(id);
        return new ResponseEntity<>(college, HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CollegeDto> getCollegeByEmail(@PathVariable String email) {
        CollegeDto college = collegeServices.getCollegeByEmail(email);
        return new ResponseEntity<>(college, HttpStatus.OK);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<CollegeDto> getCollegeByName(@PathVariable String name) {
        CollegeDto college = collegeServices.getCollegeByName(name);
        return new ResponseEntity<>(college, HttpStatus.OK);
    }

    @GetMapping("/ic-code/{icCode}")
    public ResponseEntity<CollegeDto> getCollegeByIcCode(@PathVariable String icCode) {
        CollegeDto college = collegeServices.getCollegeByIcCode(icCode);
        return new ResponseEntity<>(college, HttpStatus.OK);
    }

    @GetMapping("/rankings")
    public ResponseEntity<List<CollegeDto>> getCollegeRankings() {
        List<CollegeDto> rankings = collegeServices.getCollegeRankings();
        return new ResponseEntity<>(rankings, HttpStatus.OK);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CollegeDto> updateCollege(@RequestBody CollegeDto collegeDto, @PathVariable Long id) {
        CollegeDto updatedCollege = collegeServices.updateCollege(collegeDto);
        return new ResponseEntity<>(updatedCollege, HttpStatus.OK);
    }

    @PutMapping("/reset-password/{id}")
    public ResponseEntity<CollegeDto> resetCollegePassword(@RequestBody CollegeDto collegeDto, @PathVariable Long id) {
        return new ResponseEntity<>(collegeServices.resetCollegePassword(collegeDto), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollege(@PathVariable Long id) {
        boolean isDeleted = collegeServices.deleteCollege(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
