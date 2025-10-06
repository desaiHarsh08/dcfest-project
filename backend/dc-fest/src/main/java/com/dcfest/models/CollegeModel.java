package com.dcfest.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("is_archived=false")
public class CollegeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String address;

    @Column(nullable = false, unique = true)
    private String icCode;

    @Column(nullable = false)
    private String password;

    private boolean isDetailsUploaded = false;

    private String phone;

    private Long points;

    @Column(name = "is_archived")
    private boolean isArchived = false;

    public CollegeModel(Long id) {
        this.id = id;
    }

}
