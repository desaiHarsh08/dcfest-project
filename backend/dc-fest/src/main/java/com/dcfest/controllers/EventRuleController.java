package com.dcfest.controllers;

import com.dcfest.dtos.EventRuleDto;
import com.dcfest.services.EventRuleServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-rules")
public class EventRuleController {

    @Autowired
    private EventRuleServices eventRuleServices;

    @PostMapping
    public ResponseEntity<EventRuleDto> createEventRule(@RequestBody EventRuleDto eventRuleDto) {
        EventRuleDto createdRule = eventRuleServices.createEventRule(eventRuleDto);
        return new ResponseEntity<>(createdRule, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventRuleDto>> getAllEventRules() {
        List<EventRuleDto> rules = eventRuleServices.getAllEventRules();
        return new ResponseEntity<>(rules, HttpStatus.OK);
    }

    @GetMapping("/available-event/{availableEventId}")
    public ResponseEntity<List<EventRuleDto>> getEventRulesByAvailableEventId(@PathVariable Long availableEventId) {
        List<EventRuleDto> rules = eventRuleServices.getEventRulesByAvailableEventId(availableEventId);
        return new ResponseEntity<>(rules, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventRuleDto> getEventRuleById(@PathVariable Long id) {
        EventRuleDto rule = eventRuleServices.getEventRuleById(id);
        return new ResponseEntity<>(rule, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<EventRuleDto> updateEventRule(@RequestBody EventRuleDto eventRuleDto) {
        EventRuleDto updatedRule = eventRuleServices.updateEventRule(eventRuleDto);
        return new ResponseEntity<>(updatedRule, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventRule(@PathVariable Long id) {
        boolean isDeleted = eventRuleServices.deleteEventRule(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/available-event/{availableEventId}")
    public ResponseEntity<Void> deleteEventRulesByAvailableEventId(@PathVariable Long availableEventId) {
        eventRuleServices.deleteEventRulesByAvailableEventId(availableEventId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
