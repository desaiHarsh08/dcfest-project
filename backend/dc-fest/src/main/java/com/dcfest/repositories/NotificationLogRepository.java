package com.dcfest.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dcfest.models.NotificationLogModel;

public interface NotificationLogRepository extends JpaRepository<NotificationLogModel, Long> {
    NotificationLogModel findByAvailableEventIdAndUserId(Long eventId, Long userId);

    List<NotificationLogModel> findByAvailableEventId(Long eventId);

    List<NotificationLogModel> findByUserId(Long userId);
}
