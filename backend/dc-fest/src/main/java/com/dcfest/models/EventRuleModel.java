package com.dcfest.models;

import jakarta.persistence.*;
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

    @Column(columnDefinition = "TEXT")
    private String value;

    @ManyToOne(targetEntity = EventRuleTemplateModel.class)
    @JoinColumn(name = "event_rule_template_id_fk", nullable = false)
    private EventRuleTemplateModel eventRuleTemplate;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_event_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

}
