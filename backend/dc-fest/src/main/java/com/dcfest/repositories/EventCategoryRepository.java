package com.dcfest.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.EventCategoryModel;

@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategoryModel, Long> {

    Optional<EventCategoryModel> findByName(String name);
    
}
