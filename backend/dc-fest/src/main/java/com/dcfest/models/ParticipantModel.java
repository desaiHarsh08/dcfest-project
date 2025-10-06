package com.dcfest.models;

import java.util.ArrayList;
import java.util.List;

import com.dcfest.constants.EntryType;
import com.dcfest.constants.HandPreferenceType;
import com.dcfest.constants.ParticipantType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLRestriction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("is_archived=false")
public class ParticipantModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean isPresent;

    private Long points;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private boolean isMale;

    @Column(nullable = false)
    private String whatsappNumber;

    @Column(name = "group_type")
    private String group;

    private String teamNumber;

    @Column(nullable = false, unique = true)
    private String qrcode;

    @ManyToOne(targetEntity = CollegeModel.class)
    @JoinColumn(name = "college_id_fk", nullable = false)
    private CollegeModel college;

    @ManyToMany(mappedBy = "participants")
    @JsonBackReference
    private List<EventModel> events = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ParticipantType type = ParticipantType.PERFORMER;

    @Enumerated(EnumType.STRING)
    private EntryType entryType = EntryType.NORMAL;

    @Enumerated(EnumType.STRING)
    private HandPreferenceType handPreference = HandPreferenceType.RIGHT_HANDED;

    private Boolean disableParticipation;

    @Column(name = "is_archived")
    private boolean isArchived = false;

    public ParticipantModel(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "ParticipantModel{" +
                "id=" + id +
                ", name='" + name + "'" +
                // Avoid adding references to EventModel here
                '}';
    }

}
