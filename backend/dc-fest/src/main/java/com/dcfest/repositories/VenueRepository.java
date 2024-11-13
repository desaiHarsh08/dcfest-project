package com.dcfest.repositories;

import java.time.LocalDateTime;
import java.util.List;

import com.dcfest.constants.RoundStatus;
import com.dcfest.models.RoundModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.VenueModel;

@Repository
public interface VenueRepository extends JpaRepository<VenueModel, Long> {

    List<VenueModel> findByRound(RoundModel round);

    List<VenueModel> findByStart(LocalDateTime start);

    List<RoundModel> findByStatus(RoundStatus status);

    List<VenueModel> findByStartBetween(LocalDateTime start, LocalDateTime end);


}
