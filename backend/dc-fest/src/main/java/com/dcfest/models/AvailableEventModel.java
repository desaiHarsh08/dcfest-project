package com.dcfest.models;

import com.dcfest.constants.EventType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.EnumSet;

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

    @Column(nullable = false)
    private String title;

    private String oneLiner;

    private String description;

    @Enumerated(EnumType.STRING)
    private EventType type = EventType.INDIVIDUAL;

    @ManyToOne(targetEntity = EventCategoryModel.class)
    @JoinColumn(name = "event_category_id_fk", nullable = false)
    private EventCategoryModel eventCategory;

    private String slug;

    private boolean closeRegistration;

    private String code;

    private String eventMaster;

    private String eventMasterPhone;

    public AvailableEventModel(Long id) {
        this.id = id;
    }

    public void setType(EventType type) {
        if (!EnumSet.allOf(EventType.class).contains(type)) {
            throw new IllegalArgumentException("Please provide the valid event type!");
        }
        this.type = type;
    }

    @Override
    public String toString() {
        return "AvailableEventModel{" +
                "id=" + id +
                ", eventTitle='" + this.getTitle() + "'" +
                // Do not add references to EventModel here
                '}';
    }


}
