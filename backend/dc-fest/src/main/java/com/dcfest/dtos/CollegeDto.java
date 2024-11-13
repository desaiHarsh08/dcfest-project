package com.dcfest.dtos;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;
import java.util.ArrayList;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CollegeDto {

    private Long id;

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

    private List<CollegeRepresentativeDto> representatives = new ArrayList<>();

}
