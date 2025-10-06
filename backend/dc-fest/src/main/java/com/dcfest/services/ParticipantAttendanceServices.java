package com.dcfest.services;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.models.ParticipantModel;
import com.dcfest.models.RoundModel;
import com.dcfest.utils.ScannedQrcodeResponse;
import org.springframework.core.io.InputStreamSource;

import java.util.List;

public interface ParticipantAttendanceServices {

    List<ParticipantAttendanceDto> createAttendance(String qrcodeData, List<ParticipantModel> participantModels,
            RoundModel roundModel, String group, String teamNumber);

    ParticipantAttendanceDto getAttendanceById(Long id);

    InputStreamSource generateQrcode(Long collegeId, Long availableEventId, Long roundId, String group);

    List<ParticipantAttendanceDto> getAllAttendances();

    List<ParticipantAttendanceDto> getParticipantAttendancesByParticipantId(Long participantId);

    ScannedQrcodeResponse scanQrcode(String qrData);

    ParticipantAttendanceDto markAttendance(Long roundId, Long collegeId, Long participantId, boolean status);

    boolean deleteAttendance(Long id);

    InputStreamSource getPop(Long roundId, Long collegeId, Long availableEventId, String group);

}
