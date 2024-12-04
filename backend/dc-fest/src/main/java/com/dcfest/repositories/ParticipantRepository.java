package com.dcfest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import com.dcfest.models.CollegeModel;
import com.dcfest.models.ParticipantModel;
import com.dcfest.models.UserModel;

@Repository
public interface ParticipantRepository extends JpaRepository<ParticipantModel, Long> {

    List<ParticipantModel> findByCollege(CollegeModel college);

    Page<ParticipantModel> findByIsPresent(Pageable pageable, boolean isPresent);

    List<ParticipantModel> findByGroup(String group);

    @Query("SELECT p FROM ParticipantModel p JOIN p.events e WHERE e.id = :eventId AND p.college.id = :collegeId")
    List<ParticipantModel> findByEvent_IdAndCollegeId(@Param("eventId") Long eventId, @Param("collegeId") Long collegeId);

    @Query("SELECT p FROM ParticipantModel p JOIN p.events e WHERE e.id = :eventId")
    List<ParticipantModel> findByEvents_Id(@Param("eventId") Long eventId);

    @Query("SELECT p FROM ParticipantModel p JOIN p.events e WHERE e.availableEvent.id = :availableEventId")
    List<ParticipantModel> findByAvailableEventId(@Param("availableEventId") Long availableEventId);

    @Modifying
    @Query("DELETE FROM ParticipantModel p WHERE p.college.id = :collegeId")
    void deleteByCollegeId(@Param("collegeId") Long collegeId);

    @Query("SELECT COUNT(DISTINCT p.college.id) " +
            "FROM ParticipantModel p JOIN p.events e " +
            "WHERE e.id = :eventId")
    Long countDistinctCollegesForEvent(@Param("eventId") Long eventId);


}
