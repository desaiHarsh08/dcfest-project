package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AcademicYearDto {

    private Long id;

    private String year;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private boolean isActive = false;

}

