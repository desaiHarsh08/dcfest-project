package com.dcfest.models;

import com.dcfest.constants.RoundStatus;
import com.dcfest.constants.RoundType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;

@Entity
@Table(name = "rounds")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RoundModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RoundType roundType = RoundType.PRELIMINARY;

    @Column(nullable = false)
    private int qualifyNumber;

    @Enumerated(EnumType.STRING)
    private RoundStatus status = RoundStatus.NOT_STARTED;

    private String note;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

    private boolean disableNotifications;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String venue;

    public RoundModel(Long id) {
        this.id = id;
    }

    public void setRoundType(RoundType roundType) {
        if (!EnumSet.allOf(RoundType.class).contains(roundType)) {
            throw new IllegalArgumentException("Please provide the valid round_type!");
        }

        this.roundType = roundType;
    }

    public void setStatus(RoundStatus status) {
        if (!EnumSet.allOf(RoundStatus.class).contains(status)) {
            throw new IllegalArgumentException("Please provide the valid round_type!");
        }

        this.status = status;
    }

}
