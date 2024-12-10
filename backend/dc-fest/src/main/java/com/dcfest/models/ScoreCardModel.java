package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "score_cards", uniqueConstraints = {@UniqueConstraint(columnNames = {"college_participation_id_fk", "round_id_fk"})})
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

    public ScoreCardModel(Long id) {
        this.id = id;
    }

}
