package com.dcfest.repositories;

import com.dcfest.models.ParticipantAttendanceModel;
import com.dcfest.models.ParticipantModel;
import com.dcfest.models.RoundModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantAttendanceRepository extends JpaRepository<ParticipantAttendanceModel, Long> {

    List<ParticipantAttendanceModel> findByQrcode(String qrcode);

    List<ParticipantAttendanceModel> findByGroup(String group);

    List<ParticipantAttendanceModel> findByGroupAndRound(String group, RoundModel round);

    List<ParticipantAttendanceModel> findByRound(RoundModel round);

    List<ParticipantAttendanceModel> findByParticipant(ParticipantModel participant);

    @Query("SELECT COUNT(DISTINCT p.qrcode) FROM ParticipantAttendanceModel p WHERE p.round.id = :roundId")
    int countTeam(@Param("roundId") Long roundId);

    @Query("SELECT pa FROM ParticipantAttendanceModel pa WHERE pa.round.id = :roundId AND pa.participant.college.id = :collegeId")
    List<ParticipantAttendanceModel> findParticipantAttendanceByRoundIdAndCollegeId(
            @Param("roundId") Long roundId,
            @Param("collegeId") Long collegeId
    );

}
