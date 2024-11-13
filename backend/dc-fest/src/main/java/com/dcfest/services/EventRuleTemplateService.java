package com.dcfest.services;

import com.dcfest.models.EventRuleTemplateModel;

import java.util.List;

public interface EventRuleTemplateService {

    EventRuleTemplateModel createEventRuleTemplate(EventRuleTemplateModel templateDto);

    EventRuleTemplateModel updateEventRuleTemplate(EventRuleTemplateModel templateDto);

    void deleteEventRuleTemplate(Long id);

    EventRuleTemplateModel getEventRuleTemplateById(Long id);

    List<EventRuleTemplateModel> getAllEventRuleTemplates();

}
