package com.dcfest.dtos;

import com.dcfest.constants.RuleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EventRuleDto {

    private Long id;

    private String type = RuleType.MIN_PARTICIPANTS.name();

    private String value;

    private String description;

    private Long availableEventId;

}
