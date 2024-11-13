package com.dcfest.models;

import com.dcfest.constants.ConditionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.EnumSet;

@Entity
@Table(name = "event_rule_templates")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EventRuleTemplateModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String valueType;

    @Enumerated(EnumType.STRING)
    private ConditionType conditionType = ConditionType.NONE;

    public void setConditionType(ConditionType conditionType) {
        if (!EnumSet.allOf(ConditionType.class).contains(conditionType)) {
            throw new IllegalArgumentException("Please provide the valid condition!");
        }
        this.conditionType = conditionType;
    }

    public EventRuleTemplateModel(Long id) {
        this.id = id;
    }

}
