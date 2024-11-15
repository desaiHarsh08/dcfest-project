package com.dcfest.repositories;

import java.util.List;

import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.ParticipantModel;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dcfest.models.NotificationLogModel;

public interface NotificationLogRepository extends JpaRepository<NotificationLogModel, Long> {
    NotificationLogModel findByAvailableEventAndParticipant(AvailableEventModel availableEventModel, ParticipantModel participant);

    List<NotificationLogModel> findByParticipant(ParticipantModel participant);

    List<NotificationLogModel> findByAvailableEvent(AvailableEventModel availableEvent);

}
