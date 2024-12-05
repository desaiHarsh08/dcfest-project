package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "participant_attendances", uniqueConstraints = {@UniqueConstraint(columnNames = {"participant_id_fk", "round_id_fk" })})
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantAttendanceModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = ParticipantModel.class)
    @JoinColumn(name = "participant_id_fk")
    private ParticipantModel participant;

    private String qrcode;

    private boolean isPresent;

    @ManyToOne(targetEntity = RoundModel.class)
    @JoinColumn(name = "round_id_fk")
    private RoundModel round;

}
