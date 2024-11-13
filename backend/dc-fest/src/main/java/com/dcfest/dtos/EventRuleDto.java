package com.dcfest.dtos;

import com.dcfest.constants.RuleType;

import com.dcfest.models.EventRuleTemplateModel;
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

    private String value;

    private EventRuleTemplateModel eventRuleTemplate;

    private Long availableEventId;

}
