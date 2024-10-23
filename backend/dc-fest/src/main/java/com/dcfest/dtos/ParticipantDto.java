package com.dcfest.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {

    private Long id;

    private String type;

    private boolean isPresent;

    private Long points;

    private String qrcode;
    
    private UserDto user;

    private Long collegeId;

    private List<Long> eventIds;

}
