package com.dcfest.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "event_rules")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EventRuleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String value;

    @ManyToOne(targetEntity = EventRuleTemplateModel.class)
    @JoinColumn(name = "event_rule_template_id_fk", nullable = false)
    private EventRuleTemplateModel eventRuleTemplate;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_event_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

}
