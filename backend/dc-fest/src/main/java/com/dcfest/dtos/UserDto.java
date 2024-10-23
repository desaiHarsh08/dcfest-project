package com.dcfest.dtos;

import com.dcfest.constants.UserType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    
    private String name;

    private String email;
    
    private String password;

    private String phone;

    private String type = UserType.PARTICIPANT.name();

    private boolean isDisabled;

    private Long collegeId;

}
