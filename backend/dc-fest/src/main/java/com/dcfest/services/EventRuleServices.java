package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.EventRuleDto;

public interface EventRuleServices {

    EventRuleDto createEventRule(EventRuleDto eventRuleDto);

    List<EventRuleDto> getAllEventRules();

    List<EventRuleDto> getEventRulesByAvailableEventId(Long availableEventId);

    EventRuleDto getEventRuleById(Long id);

    EventRuleDto updateEventRule(EventRuleDto eventRuleDto);

    boolean deleteEventRule(Long id);

    void deleteEventRulesByAvailableEventId(Long availableEventId);

}
