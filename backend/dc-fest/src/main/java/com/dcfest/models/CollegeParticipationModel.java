package com.dcfest.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "college_participations", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id_fk", "available_event_id_fk" })
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("is_archived=false")
public class CollegeParticipationModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = CollegeModel.class)
    @JoinColumn(name = "college_id_fk", nullable = false)
    private CollegeModel college;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_event_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

    private String teamNumber;

    @jakarta.persistence.Column(name = "is_archived")
    private boolean isArchived = false;

    public CollegeParticipationModel(Long id) {
        this.id = id;
    }

}
