package com.dcfest.utils;

import com.dcfest.dtos.AvailableEventDto;
import com.dcfest.dtos.ParticipantDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScannedQrcodeResponse {

    private AvailableEventDto availableEvent;

    private Long roundId;

    private List<ParticipantDto> participants = new ArrayList<>();

}
