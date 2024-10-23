package com.dcfest.models;

import java.time.LocalDateTime;

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
@Table(name = "venues")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class VenueModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_event_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

    private LocalDateTime start;

    private LocalDateTime end;

}
