package com.dcfest.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "college_representatives")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CollegeRepresentativeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(targetEntity = CollegeModel.class)
    @JoinColumn(name = "college_id_fk", nullable = false)
    private CollegeModel college;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String whatsappNumber;

}
