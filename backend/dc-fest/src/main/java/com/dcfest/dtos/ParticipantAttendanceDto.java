package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantAttendanceDto {

    private Long id;

    private Long participantId;

    private String qrcode;

    private boolean isPresent;

    private Long roundId;

    private String group;

}
