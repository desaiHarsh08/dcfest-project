package com.dcfest.dtos;

import java.util.ArrayList;
import java.util.List;

import com.dcfest.utils.PageResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {

    private Long id;

    private Long availableEventId;

    private PageResponse<ParticipantDto> participants;

    private List<JudgeDto> judges = new ArrayList<>();

}
