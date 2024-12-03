package com.dcfest.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.CollegeParticipationModel;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeParticipationRepository extends JpaRepository<CollegeParticipationModel, Long> {

    List<CollegeParticipationModel> findByAvailableEvent(AvailableEventModel availableEvent);

    List<CollegeParticipationModel> findByCollege(CollegeModel collegeModel);

    Optional<CollegeParticipationModel> findByCollegeAndAvailableEvent(CollegeModel college,
            AvailableEventModel availableEvent);

    @Query("""
        SELECT cp 
        FROM CollegeParticipationModel cp 
        JOIN EventModel e ON e.availableEvent.id = cp.availableEvent.id 
        WHERE e.participants IS EMPTY
    """)
    List<CollegeParticipationModel> findByEventWithEmptyParticipants();

}
