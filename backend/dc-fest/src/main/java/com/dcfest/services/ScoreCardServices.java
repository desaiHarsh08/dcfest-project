package com.dcfest.services;

import com.dcfest.dtos.ScoreCardDto;
import org.springframework.core.io.InputStreamSource;

import java.util.List;

public interface ScoreCardServices {

    ScoreCardDto createScoreCard(ScoreCardDto scoreCardDto);

    ScoreCardDto updateScoreCard(Long id, ScoreCardDto scoreCardDto);

    ScoreCardDto getScoreCardById(Long id);

    List<ScoreCardDto> getScoreCardsByRoundId(Long id);

    ScoreCardDto getScoreCardByTeamNumberAndRoundId(String teamNumber, Long roundId);

    List<ScoreCardDto> getAllScoreCards();

    boolean deleteScoreCard(Long id);

    InputStreamSource getScoreCardSheet(Long availableEventId, Long roundId);

    List<ScoreCardDto> getScoresForCollegeParticipations(Long availableEventId, Long roundId);

    ScoreCardDto handlePromoteTeam(ScoreCardDto scoreCardDto);

}
