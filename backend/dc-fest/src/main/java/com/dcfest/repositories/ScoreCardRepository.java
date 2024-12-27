package com.dcfest.repositories;

import com.dcfest.models.CollegeParticipationModel;
import com.dcfest.models.RoundModel;
import com.dcfest.models.ScoreCardModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreCardRepository extends JpaRepository<ScoreCardModel, Long> {

    List<ScoreCardModel> findByCollegeParticipationAndRound(CollegeParticipationModel collegeParticipation, RoundModel round);

    List<ScoreCardModel> findByCollegeParticipationAndRoundAndTeamNumber(CollegeParticipationModel collegeParticipation, RoundModel round, String teamNumber);

    List<ScoreCardModel> findByRound(RoundModel round);

    Optional<ScoreCardModel> findByTeamNumberAndRound(String teamNumber, RoundModel round);

}
