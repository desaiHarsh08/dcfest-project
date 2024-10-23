package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.JudgeDto;

public interface JudgeServices {

    JudgeDto createJudge(JudgeDto judgeDto);

    List<JudgeDto> getAllJudges();

    JudgeDto getJudgeByUserId(Long userId);

    List<JudgeDto> getJudgesByEventId(Long eventId);

    JudgeDto getJudgeById(Long id);

    boolean deleteJudge(Long id);

}
