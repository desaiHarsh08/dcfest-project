package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.EventCategoryDto;

public interface EventCategoryServices {

    EventCategoryDto createEventCategory(EventCategoryDto eventCategoryDto);

    List<EventCategoryDto> getAllEventCategory();

    EventCategoryDto getEventCategoryById(Long id);

    EventCategoryDto updateEventCategory(EventCategoryDto eventCategoryDto);

    boolean deleteEventCategory(Long id);

}
