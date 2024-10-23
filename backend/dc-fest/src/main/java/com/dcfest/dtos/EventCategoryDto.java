package com.dcfest.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EventCategoryDto {

    private Long id;

    private String name;

    private String slug;
    
    private List<AvailableEventDto> availableEvents = new ArrayList<>();

}
