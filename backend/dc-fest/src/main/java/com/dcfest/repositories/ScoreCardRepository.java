package com.dcfest.repositories;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.CollegeParticipationModel;
import com.dcfest.models.RoundModel;
import com.dcfest.models.ScoreCardModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreCardRepository extends JpaRepository<ScoreCardModel, Long> {

    List<ScoreCardModel> findByCollegeParticipationAndRound(CollegeParticipationModel collegeParticipation, RoundModel round);

    List<ScoreCardModel> findByCollegeParticipationAndPromotedRound(CollegeParticipationModel collegeParticipation, RoundModel promotedRound);

    @Query("""
SELECT sc FROM ScoreCardModel sc
WHERE sc.collegeParticipation = :collegeParticipation
AND (sc.round = :round OR sc.promotedRound = :round)
""")
    List<ScoreCardModel> findRelevantScoreCards(
            @Param("collegeParticipation") CollegeParticipationModel collegeParticipation,
            @Param("round") RoundModel round
    );



    List<ScoreCardModel> findByCollegeParticipationAndRoundAndTeamNumber(CollegeParticipationModel collegeParticipation, RoundModel round, String teamNumber);

    List<ScoreCardModel> findByRound(RoundModel round);

    Optional<ScoreCardModel> findByTeamNumberAndRound(String teamNumber, RoundModel round);

}
