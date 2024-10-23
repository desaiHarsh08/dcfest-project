package com.dcfest.dtos;

import java.util.ArrayList;
import java.util.List;

import com.dcfest.constants.EventType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AvailableEventDto {

    private Long id;

    private String title;

    private String oneLiner;

    private String description;

    private String type = EventType.INDIVIDUAL.name();
    
    private String image;

    private Long eventCategoryId;

    private List<EventRuleDto> eventRules = new ArrayList<>();

    private String slug;

    private List<VenueDto> venues = new ArrayList<>();

    private List<RoundDto> rounds = new ArrayList<>();

}
