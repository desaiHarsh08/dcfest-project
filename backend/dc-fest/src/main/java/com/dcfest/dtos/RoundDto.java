package com.dcfest.dtos;

import com.dcfest.constants.RoundType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RoundDto {

    private Long id;
    
    private String name;
    
    private String roundType = RoundType.PRELIMINARY.name();
    
    private int qualifyNumber;

    private String status;

    private String note;

    private Long availableEventId;

}
