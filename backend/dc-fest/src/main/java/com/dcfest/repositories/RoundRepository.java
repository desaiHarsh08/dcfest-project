package com.dcfest.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.RoundModel;

@Repository
public interface RoundRepository extends JpaRepository<RoundModel, Long> {

    List<RoundModel> findByAvailableEvent(AvailableEventModel availableEvent);

}
