package com.dcfest.services;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.utils.PageResponse;

import java.util.List;

public interface ParticipantServices {

    ParticipantDto createParticipant(ParticipantDto participantDto);

    PageResponse<ParticipantDto> getAllParticipants(int pageNumber);

    ParticipantDto getParticipantById(Long id);

    PageResponse<ParticipantDto> getParticipantByCollegeId(int pageNumber, Long collegeId);

    PageResponse<ParticipantDto> getParticipantByIsPresent(int pageNumber, boolean isPresent);

    List<ParticipantDto> getParticipantByEventId(Long eventId);

    boolean markPoints(Long points, String group);

    ParticipantDto updateParticipant(ParticipantDto participantDto);

    boolean deleteParticipant(Long id);

    void deleteParticipantsByEventId(Long eventId);

    void deleteParticipantsByCollegesId(Long collegeId);

}
