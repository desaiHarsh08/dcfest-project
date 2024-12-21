package com.dcfest.repositories;

import com.dcfest.dtos.PromotedRoundDto;
import com.dcfest.models.ParticipantModel;
import com.dcfest.models.PromotedRoundModel;
import com.dcfest.models.RoundModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotedRoundRepository extends JpaRepository<PromotedRoundModel, Long> {

    List<PromotedRoundModel> findByParticipant(ParticipantModel participant);

    Optional<PromotedRoundModel> findByParticipantAndRound(ParticipantModel participant, RoundModel round);

}
