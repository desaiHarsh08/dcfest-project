package com.dcfest.controllers;

import com.dcfest.dtos.EventDto;
import com.dcfest.services.EventServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventServices eventServices;

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {
        EventDto createdEvent = eventServices.createEvent(eventDto);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        List<EventDto> events = eventServices.getAllEvents();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/available-event/{availableEventId}")
    public ResponseEntity<EventDto> getEventByAvailableEventId(@PathVariable Long availableEventId) {
        EventDto event = eventServices.getEventByAvailableEventId(availableEventId);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @GetMapping("/participant/{participantId}")
    public ResponseEntity<List<EventDto>> getEventsByParticipantId(@PathVariable Long participantId) {
        List<EventDto> events = eventServices.getEventsByParticipantId(participantId);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventServices.getEventById(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        boolean isDeleted = eventServices.deleteEvent(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/available-event/{availableEventId}")
    public ResponseEntity<Void> deleteEventsByAvailableEventId(@PathVariable Long availableEventId) {
        eventServices.deleteEventsByAvailableEventId(availableEventId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
