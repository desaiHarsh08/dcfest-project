package com.dcfest.repositories;

import java.util.List;

import com.dcfest.models.EventRuleTemplateModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventRuleModel;

@Repository
public interface EventRuleRepository extends JpaRepository<EventRuleModel, Long> {

    List<EventRuleModel> findByAvailableEvent(AvailableEventModel availableEvent);

    List<EventRuleModel> findByEventRuleTemplate(EventRuleTemplateModel eventRuleTemplate);

}
