package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "score_parameters")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ScoreParameterModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String points;

    @ManyToOne(targetEntity = ScoreCardModel.class)
    @JoinColumn(name = "score_card_id_fk")
    private ScoreCardModel scoreCard;

}
