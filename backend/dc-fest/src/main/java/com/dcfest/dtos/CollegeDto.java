package com.dcfest.dtos;

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

    private String icCode;

    private String phone;

    private Long points;

    private String password;

    private String rp;

    private String address;

    private boolean isDetailsUploaded = false;

    private List<CollegeParticipationDto> participations = new ArrayList<>();

}
