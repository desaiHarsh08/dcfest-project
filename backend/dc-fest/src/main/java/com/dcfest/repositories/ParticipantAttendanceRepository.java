package com.dcfest.repositories;

import com.dcfest.models.ParticipantAttendanceModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantAttendanceRepository extends JpaRepository<ParticipantAttendanceModel, Long> {

    List<ParticipantAttendanceModel> findByQrcode(String qrcode);

}
