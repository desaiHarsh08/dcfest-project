package com.dcfest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.EventModel;
import com.dcfest.models.AvailableEventModel;

@Repository
public interface EventRepository extends JpaRepository<EventModel, Long> {

    Optional<EventModel> findByAvailableEvent(AvailableEventModel availableEvent);

    @Query("SELECT e FROM EventModel e JOIN e.participants p WHERE p.id = :participantId")
    List<EventModel> findByParticipantId(Long participantId);

    // TODO


    @Query("DELETE FROM EventModel e WHERE e.availableEvent.id = :availableEventId")
    void deleteByAvailableEventId(@Param("availableEventId") Long availableEventId);

}
