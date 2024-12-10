package com.dcfest.repositories;

import com.dcfest.models.AvailableEventModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.JudgeModel;

import java.util.List;

@Repository
public interface JudgeRepository extends JpaRepository<JudgeModel, Long> {

    List<JudgeModel> findByAvailableEvent(AvailableEventModel availableEvent);

}
