package com.dcfest.repositories;

import com.dcfest.models.ScoreCardModel;
import com.dcfest.models.ScoreParameterModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreParameterRepository extends JpaRepository<ScoreParameterModel, Long> {

    List<ScoreParameterModel> findByScoreCard(ScoreCardModel scoreCardModel);

}
