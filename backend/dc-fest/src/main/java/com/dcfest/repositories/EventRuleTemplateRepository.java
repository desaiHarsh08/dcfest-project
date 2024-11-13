package com.dcfest.repositories;

import com.dcfest.models.EventRuleTemplateModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRuleTemplateRepository extends JpaRepository<EventRuleTemplateModel, Long> {

}
