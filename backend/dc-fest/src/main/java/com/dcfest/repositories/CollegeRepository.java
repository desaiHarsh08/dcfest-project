package com.dcfest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.dcfest.models.CollegeModel;

@Repository
public interface CollegeRepository extends JpaRepository<CollegeModel, Long> {


    Optional<CollegeModel> findByIcCode(String icCode);

    @Query("SELECT c FROM CollegeModel c ORDER BY c.points DESC")
    List<CollegeModel> findAllOrderByPointsDesc();

}
