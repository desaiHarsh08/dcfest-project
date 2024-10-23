package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollegeParticipationDto {

    private Long id;

    private Long collegeId;

    private Long availableEventId;

}
