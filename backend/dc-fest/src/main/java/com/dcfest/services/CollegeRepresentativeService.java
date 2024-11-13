package com.dcfest.services;

import com.dcfest.dtos.CollegeRepresentativeDto;

import java.util.List;

public interface CollegeRepresentativeService {

    CollegeRepresentativeDto createRepresentative(CollegeRepresentativeDto representativeDto);

    CollegeRepresentativeDto updateRepresentative(CollegeRepresentativeDto representativeDto);

    boolean deleteRepresentative(Long id);

    CollegeRepresentativeDto getRepresentativeById(Long id);

    List<CollegeRepresentativeDto> getRepresentativesByCollege(Long collegeId);

}
