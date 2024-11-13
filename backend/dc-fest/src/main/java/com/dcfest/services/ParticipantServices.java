package com.dcfest.services;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.utils.PageResponse;

public interface ParticipantServices {

    ParticipantDto createParticipant(ParticipantDto participantDto);

    PageResponse<ParticipantDto> getAllParticipants(int pageNumber);

    ParticipantDto getParticipantById(Long id);

    PageResponse<ParticipantDto> getParticipantByCollegeId(int pageNumber, Long collegeId);

    PageResponse<ParticipantDto> getParticipantByIsPresent(int pageNumber, boolean isPresent);

    PageResponse<ParticipantDto> getParticipantByEventId(int pageNumber, Long eventId);

    ParticipantDto updateParticipant(ParticipantDto participantDto);

    boolean deleteParticipant(Long id);

    void deleteParticipantsByEventId(Long eventId);

    void deleteParticipantsByCollegesId(Long collegeId);

}
