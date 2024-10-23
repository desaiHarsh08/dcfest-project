package com.dcfest.controllers;

import com.dcfest.dtos.RoundDto;
import com.dcfest.services.RoundServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rounds")
public class RoundController {

    @Autowired
    private RoundServices roundServices;

    @PostMapping
    public ResponseEntity<RoundDto> createRound(@RequestBody RoundDto roundDto) {
        RoundDto createdRound = roundServices.createRound(roundDto);
        return new ResponseEntity<>(createdRound, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RoundDto>> getAllRounds() {
        List<RoundDto> rounds = roundServices.getAllRounds();
        return new ResponseEntity<>(rounds, HttpStatus.OK);
    }

    @GetMapping("/available-event/{availableEventId}")
    public ResponseEntity<List<RoundDto>> getRoundsByAvailableEventId(@PathVariable Long availableEventId) {
        List<RoundDto> rounds = roundServices.getRoundsByAvailableEventId(availableEventId);
        return new ResponseEntity<>(rounds, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoundDto> getRoundById(@PathVariable Long id) {
        RoundDto round = roundServices.getRoundById(id);
        return new ResponseEntity<>(round, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<RoundDto> updateRound(@RequestBody RoundDto roundDto) {
        RoundDto updatedRound = roundServices.updateRound(roundDto);
        return new ResponseEntity<>(updatedRound, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long id) {
        boolean isDeleted = roundServices.deleteRound(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
