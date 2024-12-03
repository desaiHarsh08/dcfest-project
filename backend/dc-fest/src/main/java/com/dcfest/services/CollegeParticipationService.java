package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.CollegeDto;
import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.models.CollegeParticipationModel;

public interface CollegeParticipationService {

    CollegeParticipationDto createParticipation(CollegeParticipationDto participationDto);

    List<CollegeParticipationDto> getAllParticipations();

    List<CollegeParticipationDto> getByAvailableEvent(Long availableEventId);

    List<CollegeParticipationDto> getByCollege(Long collegeId);

    CollegeParticipationDto getByCollegeAndAvailableEvent(Long collegeId, Long availableEventId);

    boolean deleteParticipation(Long id);
    List<CollegeParticipationDto> getInterestedColleges();


}
