package com.dcfest.models;

import com.dcfest.constants.RoundType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String roundType = RoundType.PRELIMINARY.name();

    @Column(nullable = false)
    private int qualifyNumber;

    @Column(nullable = true)
    private String status;

    @Column(nullable = true)
    private String note;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

}
