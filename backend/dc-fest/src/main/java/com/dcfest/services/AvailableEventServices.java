package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.AvailableEventDto;
import com.dcfest.dtos.EventRuleDto;
import com.dcfest.models.AvailableEventModel;

public interface AvailableEventServices {

    AvailableEventDto createAvailableEvent(AvailableEventDto availableEventDto);

    List<AvailableEventDto> getAllAvailableEvents();

    List<AvailableEventDto> getAvailableEventsByCategoryId(Long eventCategoryId);

    AvailableEventDto getAvailableEventById(Long id);

    AvailableEventDto getAvailableEventBySlug(String slug);

    List<AvailableEventDto> getAvailableEventByCategorySlug(String categorySlug);

    AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto);

    boolean deleteAvailableEvent(Long id);

    void postCloseRegistrationProcess(AvailableEventModel availableEventModel, List<EventRuleDto> eventRuleDtos);


}
