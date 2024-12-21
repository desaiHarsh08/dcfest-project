package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promoted_rounds")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PromotedRoundModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = ParticipantModel.class)
    @JoinColumn(name = "participant_id_fk")
    private ParticipantModel participant;

    @ManyToOne(targetEntity = RoundModel.class)
    @JoinColumn(name = "round_id_fk")
    private RoundModel round;

}
