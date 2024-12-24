package com.dcfest.services;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.utils.PageResponse;

import java.util.List;

public interface ParticipantServices {

    boolean disableParticipation(String group, boolean status);

    boolean correctGroupNameForParticipants();

    List<ParticipantDto> createParticipants(List<ParticipantDto> participantDto);

    ParticipantDto addParticipant(ParticipantDto participantDto);

    PageResponse<ParticipantDto> getAllParticipants(int pageNumber);

    ParticipantDto getParticipantById(Long id);

    List<ParticipantDto> getParticipantByCollegeId(Long collegeId);

    Long slotsOccupied(Long eventId);

    PageResponse<ParticipantDto> getParticipantByIsPresent(int pageNumber, boolean isPresent);

    List<ParticipantDto> getParticipantByEventId(Long eventId);

    boolean markPoints(Long points, String group);

    ParticipantDto updateParticipant(ParticipantDto participantDto);

    boolean deleteParticipant(Long id);

    void deleteParticipantsByEventId(Long eventId);

    void deleteParticipantsByCollegesId(Long collegeId);

    List<ParticipantDto> getParticipantsByEventIdandCollegeId(Long eventId, Long collegeId);

}
