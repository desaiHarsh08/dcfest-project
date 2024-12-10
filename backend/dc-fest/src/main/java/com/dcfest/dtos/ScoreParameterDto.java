package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreParameterDto {

    private Long id;

    private String name;

    private String points;

    private Long scoreCardId;

}
