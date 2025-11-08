package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.AvailableEventDto;

public interface AvailableEventServices {

    AvailableEventDto createAvailableEvent(AvailableEventDto availableEventDto);

    List<AvailableEventDto> getAllAvailableEvents();

    List<AvailableEventDto> getAvailableEventsByCategoryId(Long eventCategoryId);

    AvailableEventDto getAvailableEventById(Long id);

    AvailableEventDto getAvailableEventBySlug(String slug);

    AvailableEventDto getAvailableEventBySlugAll(String slug);

    List<AvailableEventDto> getAvailableEventByCategorySlug(String categorySlug);

    List<AvailableEventDto> getAvailableEventByCategorySlugAll(String categorySlug);

    AvailableEventDto updateAvailableEvent(AvailableEventDto availableEventDto);

    boolean deleteAvailableEvent(Long id);

    AvailableEventDto postCloseRegistrationProcess(Long availableEventId);

    AvailableEventDto toggleRegistrationProcess(Long availableEventId);

    AvailableEventDto toggleActive(Long availableEventId);

}
