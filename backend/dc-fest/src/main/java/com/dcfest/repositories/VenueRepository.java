package com.dcfest.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.VenueModel;

@Repository
public interface VenueRepository extends JpaRepository<VenueModel, Long> {

    List<VenueModel> findByAvailableEvent(AvailableEventModel availableEvent);

    List<VenueModel> findByStart(LocalDateTime start);

    List<VenueModel> findByStartBetween(LocalDateTime start, LocalDateTime end);

    @Query("DELETE FROM VenueModel v WHERE v.availableEvent.id = :availableEventId")
    void deleteByAvailableEventId(@Param("availableEventId") Long availableEventId);

}
