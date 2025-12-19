package com.dcfest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.CollegeModel;

@Repository
public interface CollegeRepository extends JpaRepository<CollegeModel, Long> {

    // Explicit query to ensure archived colleges are never fetched during
    // authentication
    @Query("SELECT c FROM CollegeModel c WHERE c.icCode = :icCode AND c.isArchived = false")
    Optional<CollegeModel> findByIcCodeAndNotArchived(@Param("icCode") String icCode);

    @Query("""
SELECT DISTINCT cp.college
FROM ScoreCardModel sc
JOIN sc.collegeParticipation cp
WHERE cp.availableEvent.id = :availableEventId
AND (
    sc.round.id = :roundId
    OR sc.promotedRound.id = :roundId
)
""")
    List<CollegeModel> findDistinctCollegesByAvailableEventAndRound(
            @Param("availableEventId") Long availableEventId,
            @Param("roundId") Long roundId
    );

    @Query("""
        SELECT DISTINCT c
        FROM CollegeModel c
        JOIN ParticipantModel p ON p.college = c
        JOIN p.events e
        WHERE e.availableEvent.id = :availableEventId
          AND (p.disableParticipation = false OR p.disableParticipation IS NULL)    
    """)
    List<CollegeModel> findDistinctCollegesByAvailableEventAndEnabledParticipants(
            @Param("availableEventId") Long availableEventId
    );


    @Query("SELECT c FROM CollegeModel c WHERE c.icCode = :icCode AND c.year = :year AND c.isArchived = false")
    Optional<CollegeModel> findByIcCodeAndYearAndNotArchived(@Param("icCode") String icCode,
            @Param("year") Integer year);

    // Keep original for backward compatibility (already filtered by
    // @SQLRestriction)
    Optional<CollegeModel> findByIcCode(String icCode);

    Optional<CollegeModel> findByIcCodeAndYear(String icCode, Integer year);

    @Query("SELECT c FROM CollegeModel c WHERE c.isArchived = false ORDER BY c.points DESC")
    List<CollegeModel> findAllOrderByPointsDesc();

}
