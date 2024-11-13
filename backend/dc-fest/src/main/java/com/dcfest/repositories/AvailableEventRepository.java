package com.dcfest.repositories;

import java.util.List;
import java.util.Optional;

import com.dcfest.constants.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventCategoryModel;

@Repository
public interface AvailableEventRepository extends JpaRepository<AvailableEventModel, Long> {

    Optional<AvailableEventModel> findByTitle(String title);

    List<AvailableEventModel> findByType(EventType type);

    Optional<AvailableEventModel> findBySlug(String slug);

    List<AvailableEventModel> findByEventCategory(EventCategoryModel eventCategory);

    @Query("SELECT a FROM AvailableEventModel a JOIN a.eventCategory e WHERE e.slug = :categorySlug")
    List<AvailableEventModel> findByCategorySlug(@Param("categorySlug") String categorySlug);

    @Query("DELETE FROM AvailableEventModel a WHERE a.eventCategory.id = :eventCategoryId")
    void deleteByCategoryId(@Param("eventCategoryId") Long eventCategoryId);

}
