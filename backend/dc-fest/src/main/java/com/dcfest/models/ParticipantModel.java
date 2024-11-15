package com.dcfest.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "participants")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(nullable = false, unique = true)
    private String qrcode;

    @ManyToOne(targetEntity = CollegeModel.class)
    @JoinColumn(name = "college_id_fk", nullable = false)
    private CollegeModel college;

    @ManyToMany(mappedBy = "participants")
    @JsonBackReference
    private List<EventModel> events =  new ArrayList<>();

    public ParticipantModel(Long id) {
        this.id = id;
    }

}
