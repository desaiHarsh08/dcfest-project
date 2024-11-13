package com.dcfest.services.impl;

import com.dcfest.models.EventRuleTemplateModel;
import com.dcfest.repositories.EventRuleTemplateRepository;
import com.dcfest.services.EventRuleTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventRuleTemplateServiceImpl implements EventRuleTemplateService {

    @Autowired
    private EventRuleTemplateRepository eventRuleTemplateRepository;

    @Override
    public EventRuleTemplateModel createEventRuleTemplate(EventRuleTemplateModel templateModel) {
        return eventRuleTemplateRepository.save(templateModel);
    }

    @Override
    public EventRuleTemplateModel updateEventRuleTemplate(EventRuleTemplateModel templateModel) {
        EventRuleTemplateModel existingTemplate = eventRuleTemplateRepository.findById(templateModel.getId())
                .orElseThrow(() -> new RuntimeException("Template not found"));

        existingTemplate.setName(templateModel.getName());
        existingTemplate.setValueType(templateModel.getValueType());
        existingTemplate.setConditionType(templateModel.getConditionType());

        return eventRuleTemplateRepository.save(existingTemplate);
    }

    @Override
    public void deleteEventRuleTemplate(Long id) {
        eventRuleTemplateRepository.deleteById(id);
    }

    @Override
    public EventRuleTemplateModel getEventRuleTemplateById(Long id) {
        return eventRuleTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Override
    public List<EventRuleTemplateModel> getAllEventRuleTemplates() {
        return eventRuleTemplateRepository.findAll();
    }
}