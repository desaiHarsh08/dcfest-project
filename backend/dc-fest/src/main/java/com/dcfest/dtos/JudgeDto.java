package com.dcfest.dtos;

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

    private String name;

    private String phone;

    private Long availableEventId;

}
