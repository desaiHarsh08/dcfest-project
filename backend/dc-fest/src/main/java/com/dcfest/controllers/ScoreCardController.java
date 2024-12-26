package com.dcfest.controllers;

import com.dcfest.dtos.ScoreCardDto;
import com.dcfest.services.ScoreCardServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/scorecards")
public class ScoreCardController {

    @Autowired
    private ScoreCardServices scoreCardService;

    @PostMapping
    public ResponseEntity<ScoreCardDto> createScoreCard(@RequestBody ScoreCardDto scoreCardDto) {
        ScoreCardDto createdScoreCard = scoreCardService.createScoreCard(scoreCardDto);
        return ResponseEntity.ok(createdScoreCard);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScoreCardDto> updateScoreCard(@PathVariable Long id, @RequestBody ScoreCardDto scoreCardDto) {
        ScoreCardDto updatedScoreCard = scoreCardService.updateScoreCard(id, scoreCardDto);
        return ResponseEntity.ok(updatedScoreCard);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScoreCardDto> getScoreCardById(@PathVariable Long id) {
        ScoreCardDto scoreCard = scoreCardService.getScoreCardById(id);
        return ResponseEntity.ok(scoreCard);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScoreCardById(@PathVariable Long id) {
        return new ResponseEntity<>(scoreCardService.deleteScoreCard(id), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<ScoreCardDto>> getAllScoreCards() {
        List<ScoreCardDto> scoreCards = scoreCardService.getAllScoreCards();
        return ResponseEntity.ok(scoreCards);
    }



    @PostMapping("/promote-team")
    public ResponseEntity<ScoreCardDto> handlePromoteTeam(@RequestBody ScoreCardDto scoreCardDto) {
        return new ResponseEntity<>(
                this.scoreCardService.handlePromoteTeam(scoreCardDto),
                HttpStatus.OK
        );
    }

    @GetMapping("/get-scorecard-sheet")
    public ResponseEntity<InputStreamResource> getPop(
            @RequestParam Long availableEventId,
            @RequestParam Long roundId
    ) {
        System.out.println(availableEventId);
        System.out.println(roundId);

        try {
            // Generate the PDF byte array from the service method
            InputStreamSource pdf = this.scoreCardService.getScoreCardSheet(availableEventId, roundId);

            // Prepare the PDF byte array to be returned as InputStreamResource
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(((ByteArrayResource) pdf).getByteArray());

            // Create the response with the correct headers
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=pop_participants.pdf"); // Inline opens in browser
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");

            return new ResponseEntity<>(new InputStreamResource(byteArrayInputStream), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-college-participations")
    public ResponseEntity<?> getParticipations(
            @RequestParam Long availableEventId,
            @RequestParam Long roundId
    ) {

       return new ResponseEntity<>(
               this.scoreCardService.getScoresForCollegeParticipations(availableEventId, roundId),
               HttpStatus.OK
       );
    }
}
