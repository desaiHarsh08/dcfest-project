package com.dcfest.controllers;

import com.dcfest.dtos.ScoreParameterDto;
import com.dcfest.services.ScoreParameterServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/score-parameters")
public class ScoreParameterController {

    @Autowired
    private ScoreParameterServices scoreParameterServices;

    // Create a new ScoreParameter
    @PostMapping
    public ResponseEntity<ScoreParameterDto> createScoreParameter(@RequestBody ScoreParameterDto scoreParameterDto) {
        ScoreParameterDto createdScoreParameter = scoreParameterServices.createScoreParameter(scoreParameterDto);
        return ResponseEntity.ok(createdScoreParameter);
    }

    // Update an existing ScoreParameter by ID
    @PutMapping("/{id}")
    public ResponseEntity<ScoreParameterDto> updateScoreParameter(
            @PathVariable Long id,
            @RequestBody ScoreParameterDto scoreParameterDto) {
        ScoreParameterDto updatedScoreParameter = scoreParameterServices.updateScoreParameter(id, scoreParameterDto);
        return ResponseEntity.ok(updatedScoreParameter);
    }

    // Get a ScoreParameter by ID
    @GetMapping("/{id}")
    public ResponseEntity<ScoreParameterDto> getScoreParameterById(@PathVariable Long id) {
        ScoreParameterDto scoreParameter = scoreParameterServices.getScoreParameterById(id);
        return ResponseEntity.ok(scoreParameter);
    }

    // Get all ScoreParameters
    @GetMapping
    public ResponseEntity<List<ScoreParameterDto>> getAllScoreParameters() {
        List<ScoreParameterDto> scoreParameters = scoreParameterServices.getAllScoreParameters();
        return ResponseEntity.ok(scoreParameters);
    }

    // Get ScoreParameters by ScoreCard ID
    @GetMapping("/by-score-card/{scoreCardId}")
    public ResponseEntity<List<ScoreParameterDto>> getScoreParametersByScoreCardId(@PathVariable Long scoreCardId) {
        List<ScoreParameterDto> scoreParameters = scoreParameterServices.getScoreParametersByScoreCardId(scoreCardId);
        return ResponseEntity.ok(scoreParameters);
    }

    // Delete a ScoreParameter by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteScoreParameter(@PathVariable Long id) {
        boolean isDeleted = scoreParameterServices.deleteScoreParameter(id);
        if (isDeleted) {
            return ResponseEntity.ok("ScoreParameter deleted successfully.");
        } else {
            return ResponseEntity.badRequest().body("Failed to delete ScoreParameter.");
        }
    }
}
