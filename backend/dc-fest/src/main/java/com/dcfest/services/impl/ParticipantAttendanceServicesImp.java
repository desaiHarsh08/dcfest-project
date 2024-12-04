package com.dcfest.services.impl;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.models.CollegeModel;
import com.dcfest.repositories.*;
import com.dcfest.services.ParticipantAttendanceServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipantAttendanceServicesImp implements ParticipantAttendanceServices {

    @Autowired
    private ParticipantAttendanceRepository participantAttendanceRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RoundRepository roundRepository;

    @Override
    public ParticipantAttendanceDto createAttendance(ParticipantAttendanceDto participantAttendanceDto) {

        return null;
    }

    @Override
    public ParticipantAttendanceDto getAttendanceById(Long id) {
        return null;
    }

    @Override
    public boolean generateQrcode(Long collegeId, Long availableEventId, Long eventId, Long roundId) {
//        CollegeModel collegeModel = this.colleg

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
