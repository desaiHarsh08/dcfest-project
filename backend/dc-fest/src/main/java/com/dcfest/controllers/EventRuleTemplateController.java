package com.dcfest.controllers;

import com.dcfest.models.EventRuleTemplateModel;
import com.dcfest.services.EventRuleTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-rule-templates")
public class EventRuleTemplateController {

    @Autowired
    private EventRuleTemplateService eventRuleTemplateService;

    @PostMapping
    public ResponseEntity<EventRuleTemplateModel> createEventRuleTemplate(@RequestBody EventRuleTemplateModel templateModel) {
        EventRuleTemplateModel createdTemplate = eventRuleTemplateService.createEventRuleTemplate(templateModel);
        return new ResponseEntity<>(createdTemplate, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<EventRuleTemplateModel> updateEventRuleTemplate(@RequestBody EventRuleTemplateModel templateModel) {
        EventRuleTemplateModel updatedTemplate = eventRuleTemplateService.updateEventRuleTemplate(templateModel);
        return new ResponseEntity<>(updatedTemplate, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventRuleTemplate(@PathVariable Long id) {
        eventRuleTemplateService.deleteEventRuleTemplate(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventRuleTemplateModel> getEventRuleTemplateById(@PathVariable Long id) {
        EventRuleTemplateModel template = eventRuleTemplateService.getEventRuleTemplateById(id);
        return new ResponseEntity<>(template, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<EventRuleTemplateModel>> getAllEventRuleTemplates() {
        List<EventRuleTemplateModel> templates = eventRuleTemplateService.getAllEventRuleTemplates();
        return new ResponseEntity<>(templates, HttpStatus.OK);
    }
}