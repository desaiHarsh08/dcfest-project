package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.CollegeDto;

public interface CollegeServices {

    CollegeDto createCollege(CollegeDto collegeDto);

    List<CollegeDto> getAllColleges();

    CollegeDto getCollegeById(Long id);

    CollegeDto getCollegeByEmail(String email);

    CollegeDto getCollegeByName(String name);

    CollegeDto getCollegeByIcCode(String icCode);

    List<CollegeDto> getCollegeRankings();

    CollegeDto updateCollege(CollegeDto collegeDto);

    CollegeDto resetCollegePassword(CollegeDto collegeDto);

    boolean deleteCollege(Long id);

}
