package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CollegeRepresentativeDto {

    private Long id;

    private Long collegeId;

    private String name;

    private String email;

    private String phone;

    private String whatsappNumber;

}
