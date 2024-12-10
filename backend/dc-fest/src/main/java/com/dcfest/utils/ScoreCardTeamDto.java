package com.dcfest.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreCardTeamDto {

    private String teamNumber;

    private String param1;

    private String p1;

    private String param2;

    private String p2;

    private String param3;

    private String p3;

    private String param4;

    private String p4;

    private String totalPoints;

    private String rank;

}
