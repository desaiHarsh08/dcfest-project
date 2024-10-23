package com.dcfest.models;

import com.dcfest.constants.EventType;

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
@Table(name = "available_events")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AvailableEventModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String oneLiner;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String type = EventType.INDIVIDUAL.name();

    @Column(nullable = false)
    private String image;

    @ManyToOne(targetEntity = EventCategoryModel.class)
    @JoinColumn(name = "event_category_id_fk", nullable = false)
    private EventCategoryModel eventCategory;

    @Column(nullable = false, unique = true)
    private String slug;

}
