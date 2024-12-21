package com.dcfest.dtos;

import com.dcfest.models.RoundModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreCardDto {

    private Long id;

    private Long collegeParticipationId;

    private Long roundId;

    private List<ScoreParameterDto> scoreParameters = new ArrayList<>();

    private String teamNumber;

    private Long promotedRoundId;

    private Integer rank;

    private Integer slot;

    private Integer points;

}
