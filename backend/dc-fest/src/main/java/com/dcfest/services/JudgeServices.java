package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.JudgeDto;

public interface JudgeServices {

    JudgeDto createJudge(JudgeDto judgeDto);

    List<JudgeDto> getAllJudges();

    JudgeDto updateJudge(JudgeDto judgeDto);

    List<JudgeDto> getJudgesByAvailableEventId(Long availableEventId);

    JudgeDto getJudgeById(Long id);

    boolean deleteJudge(Long id);

}
