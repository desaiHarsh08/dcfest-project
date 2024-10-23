package com.dcfest.services;

import java.util.List;

import com.dcfest.dtos.RoundDto;

public interface RoundServices {

    RoundDto createRound(RoundDto roundDto);

    List<RoundDto> getAllRounds();

    List<RoundDto> getRoundsByAvailableEventId(Long availableEventId);

    RoundDto getRoundById(Long id);

    RoundDto updateRound(RoundDto roundDto);

    boolean deleteRound(Long id);

}
