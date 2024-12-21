package com.dcfest.dtos;

import com.dcfest.models.ParticipantModel;
import com.dcfest.models.RoundModel;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
public class PromotedRoundDto {

    private Long id;

    private Long participantId;

    private Long roundId;

}
