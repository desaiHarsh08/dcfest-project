package com.dcfest.services;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.models.ParticipantAttendanceModel;

import java.util.List;

public interface ParticipantAttendanceServices {

    ParticipantAttendanceDto createAttendance(ParticipantAttendanceDto participantAttendanceDto);

    ParticipantAttendanceDto getAttendanceById(Long id);

    boolean generateQrcode(Long collegeId, Long roundId);

    List<ParticipantAttendanceDto> getAllAttendances();

    ParticipantAttendanceDto updateAttendance(ParticipantAttendanceDto participantAttendanceDto);

    boolean deleteAttendance(Long id);

}
