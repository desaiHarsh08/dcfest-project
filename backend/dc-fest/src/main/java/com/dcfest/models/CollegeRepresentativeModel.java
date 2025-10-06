package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "college_representatives")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("is_archived=false")
public class CollegeRepresentativeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = CollegeModel.class)
    @JoinColumn(name = "college_id_fk", nullable = false)
    private CollegeModel college;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String whatsappNumber;

    @Column(name = "is_archived")
    private boolean isArchived = false;

}
