package com.dcfest.services;

import com.dcfest.dtos.ScoreParameterDto;

import java.util.List;

public interface ScoreParameterServices {

    ScoreParameterDto createScoreParameter(ScoreParameterDto scoreParameterDto);

    ScoreParameterDto updateScoreParameter(Long id, ScoreParameterDto scoreParameterDto);

    ScoreParameterDto getScoreParameterById(Long id);

    List<ScoreParameterDto> getAllScoreParameters();

    List<ScoreParameterDto> getScoreParametersByScoreCardId(Long scoreCardId);

    boolean deleteScoreParameter(Long id);

}
