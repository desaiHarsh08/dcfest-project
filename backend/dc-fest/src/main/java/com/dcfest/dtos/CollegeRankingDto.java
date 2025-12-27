package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollegeRankingDto {
    private String collegeName;
    private String icCode;
    private Long points;
    private Long ranking;
    private Long teams;
}
