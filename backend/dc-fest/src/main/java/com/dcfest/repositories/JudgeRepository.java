package com.dcfest.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.JudgeModel;
import com.dcfest.models.UserModel;

import java.util.List;

@Repository
public interface JudgeRepository extends JpaRepository<JudgeModel, Long> {

    Optional<JudgeModel> findByUser(UserModel user);

    @Query("SELECT j FROM JudgeModel j JOIN j.events e WHERE e.id = :eventId")
    List<JudgeModel> findByEventId(@Param("eventId") Long eventId);

}
