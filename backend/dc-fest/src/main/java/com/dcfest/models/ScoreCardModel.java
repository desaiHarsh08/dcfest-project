package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "score_cards")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ScoreCardModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = CollegeParticipationModel.class)
    @JoinColumn(name = "college_participation_id_fk")
    private CollegeParticipationModel collegeParticipation;

    @ManyToOne(targetEntity = RoundModel.class)
    @JoinColumn(name = "round_id_fk")
    private RoundModel round;

    private String teamNumber;

    @ManyToOne(targetEntity = RoundModel.class)
    @JoinColumn(name = "promoted_round_id_fk")
    private RoundModel promotedRound;

    @Column(name = "rank_number")
    private Integer rank;

    private Integer slot;

    private Integer points;

    public ScoreCardModel(Long id) {
        this.id = id;
    }

}
