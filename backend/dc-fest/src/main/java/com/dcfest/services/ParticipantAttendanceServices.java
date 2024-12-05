package com.dcfest.services;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.models.ParticipantAttendanceModel;
import com.dcfest.models.ParticipantModel;
import com.dcfest.models.RoundModel;
import org.springframework.core.io.InputStreamSource;

import java.util.List;

public interface ParticipantAttendanceServices {

    List<ParticipantAttendanceDto> createAttendance(String qrcodeData, List<ParticipantModel> participantModels, RoundModel roundModel);

    ParticipantAttendanceDto getAttendanceById(Long id);

    InputStreamSource generateQrcode(Long collegeId, Long availableEventId, Long roundId);

    List<ParticipantAttendanceDto> getAllAttendances();

    ParticipantAttendanceDto updateAttendance(ParticipantAttendanceDto participantAttendanceDto);

    boolean deleteAttendance(Long id);

    InputStreamSource getPop(Long roundId, Long collegeId, Long availableEventId);

}
