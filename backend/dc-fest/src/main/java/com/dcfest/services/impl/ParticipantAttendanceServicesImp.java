package com.dcfest.services.impl;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.services.ParticipantAttendanceServices;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipantAttendanceServicesImp implements ParticipantAttendanceServices {
    @Override
    public ParticipantAttendanceDto createAttendance(ParticipantAttendanceDto participantAttendanceDto) {
        return null;
    }

    @Override
    public ParticipantAttendanceDto getAttendanceById(Long id) {
        return null;
    }

    @Override
    public boolean generateQrcode(Long collegeId, Long roundId) {
        return false;
    }

    @Override
    public List<ParticipantAttendanceDto> getAllAttendances() {
        return null;
    }

    @Override
    public ParticipantAttendanceDto updateAttendance(ParticipantAttendanceDto participantAttendanceDto) {
        return null;
    }

    @Override
    public boolean deleteAttendance(Long id) {
        return false;
    }
}
