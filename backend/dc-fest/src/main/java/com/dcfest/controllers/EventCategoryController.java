package com.dcfest.controllers;

import com.dcfest.dtos.EventCategoryDto;
import com.dcfest.services.EventCategoryServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class EventCategoryController {

    @Autowired
    private EventCategoryServices eventCategoryServices;

    @PostMapping
    public ResponseEntity<EventCategoryDto> createEventCategory(@RequestBody EventCategoryDto eventCategoryDto) {
        EventCategoryDto createdCategory = eventCategoryServices.createEventCategory(eventCategoryDto);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventCategoryDto>> getAllEventCategories() {
        List<EventCategoryDto> categories = eventCategoryServices.getAllEventCategory();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventCategoryDto> getEventCategoryById(@PathVariable Long id) {
        EventCategoryDto category = eventCategoryServices.getEventCategoryById(id);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<EventCategoryDto> updateEventCategory(@RequestBody EventCategoryDto eventCategoryDto) {
        EventCategoryDto updatedCategory = eventCategoryServices.updateEventCategory(eventCategoryDto);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventCategory(@PathVariable Long id) {
        boolean isDeleted = eventCategoryServices.deleteEventCategory(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
