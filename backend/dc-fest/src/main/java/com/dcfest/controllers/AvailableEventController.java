package com.dcfest.controllers;

import com.dcfest.dtos.AvailableEventDto;
import com.dcfest.services.AvailableEventServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/available-events")
public class AvailableEventController {

    @Autowired
    private AvailableEventServices availableEventServices;

    @PostMapping
    public ResponseEntity<AvailableEventDto> createAvailableEvent(@RequestBody AvailableEventDto availableEventDto) {
        AvailableEventDto createdEvent = availableEventServices.createAvailableEvent(availableEventDto);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AvailableEventDto>> getAllAvailableEvents() {
        List<AvailableEventDto> events = availableEventServices.getAllAvailableEvents();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/category/{categorySlug}")
    public ResponseEntity<List<AvailableEventDto>> getAvailableEventsByCategorySlug(
            @PathVariable String categorySlug,
            @RequestParam(name = "includeInactive", required = false, defaultValue = "false") boolean includeInactive) {
        List<AvailableEventDto> events = includeInactive
                ? availableEventServices.getAvailableEventByCategorySlugAll(categorySlug)
                : availableEventServices.getAvailableEventByCategorySlug(categorySlug);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/slug/{eventSlug}")
    public ResponseEntity<AvailableEventDto> getAvailableEventsBySlug(
            @PathVariable String eventSlug,
            @RequestParam(name = "includeInactive", required = false, defaultValue = "false") boolean includeInactive) {
        AvailableEventDto events = includeInactive
                ? availableEventServices.getAvailableEventBySlugAll(eventSlug)
                : availableEventServices.getAvailableEventBySlug(eventSlug);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    // @GetMapping("/category/{categoryId}")
    // public ResponseEntity<List<AvailableEventDto>>
    // getAvailableEventsByCategoryId(@PathVariable Long categoryId) {
    // List<AvailableEventDto> events =
    // availableEventServices.getAvailableEventsByCategoryId(categoryId);
    // return new ResponseEntity<>(events, HttpStatus.OK);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<AvailableEventDto> getAvailableEventById(@PathVariable Long id) {
        AvailableEventDto event = availableEventServices.getAvailableEventById(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @GetMapping("/toggle-reg/{id}")
    public ResponseEntity<AvailableEventDto> toggleRegistration(@PathVariable Long id) {
        AvailableEventDto event = availableEventServices.toggleRegistrationProcess(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @GetMapping("/toggle-active/{id}")
    public ResponseEntity<AvailableEventDto> toggleActive(@PathVariable Long id) {
        AvailableEventDto event = availableEventServices.toggleActive(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvailableEventDto> updateAvailableEvent(@RequestBody AvailableEventDto availableEventDto) {
        AvailableEventDto updatedEvent = availableEventServices.updateAvailableEvent(availableEventDto);
        return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailableEvent(@PathVariable Long id) {
        boolean isDeleted = availableEventServices.deleteAvailableEvent(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
