package com.dcfest.services;

import com.dcfest.dtos.AcademicYearDto;

import java.util.List;

public interface AcademicYearService {

    AcademicYearDto createAcademicYear(AcademicYearDto academicYearDto);

    List<AcademicYearDto> getAllAcademicYears();

    AcademicYearDto getAcademicYearById(Long id);

    AcademicYearDto getActiveAcademicYear();

    boolean isRegistrationDeadlineClosed();

    boolean isRegistrationOpen();

    AcademicYearDto updateAcademicYear(AcademicYearDto academicYearDto);

    boolean deleteAcademicYear(Long id);

    AcademicYearDto setActiveAcademicYear(Long id);

}

