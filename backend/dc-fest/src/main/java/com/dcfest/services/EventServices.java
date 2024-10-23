package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.EventDto;

public interface EventServices {

    EventDto createEvent(EventDto eventDto);

    List<EventDto> getAllEvents();

    EventDto getEventByAvailableEventId(Long availableEventId);

    List<EventDto> getEventsByParticipantId(Long participantId);

    EventDto getEventById(Long id);

    boolean deleteEvent(Long id);

    void deleteEventsByAvailableEventId(Long availableEventId);

}
