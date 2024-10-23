package com.dcfest.dtos;

import java.util.List;
import java.util.ArrayList;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class JudgeDto {

    private Long id;

    private UserDto user;

    private List<Long> eventIds = new ArrayList<>();

}
