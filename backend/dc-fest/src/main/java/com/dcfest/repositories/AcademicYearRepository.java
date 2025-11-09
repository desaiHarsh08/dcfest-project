package com.dcfest.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AcademicYearModel;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYearModel, Long> {
    
    Optional<AcademicYearModel> findByIsActiveTrue();
}

