package com.dcfest.services;

import com.dcfest.dtos.CollegeRankingDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Emit quota update event for a specific event
     * This will notify all connected clients about quota changes
     */
    public void emitQuotaUpdate(Long availableEventId, Long slotsOccupied, Long waitingListSlotsOccupied) {
        Map<String, Object> data = new HashMap<>();
        data.put("availableEventId", availableEventId);
        data.put("slotsOccupied", slotsOccupied);
        data.put("waitingListSlotsOccupied", waitingListSlotsOccupied);
        data.put("timestamp", System.currentTimeMillis());

        // Send to all clients subscribed to this event's topic
        messagingTemplate.convertAndSend("/topic/event/" + availableEventId + "/quota-update", data);
        System.out.println("Emitted quota-update for event " + availableEventId + " via WebSocket");
    }

    /**
     * Emit participant added event
     */
    public void emitParticipantAdded(Long availableEventId, Long eventId) {
        Map<String, Object> data = new HashMap<>();
        data.put("availableEventId", availableEventId);
        data.put("eventId", eventId);
        data.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/event/" + availableEventId + "/participant-added", data);
        System.out.println("Emitted participant-added for event " + availableEventId + " via WebSocket");
    }

    /**
     * Emit participant removed event
     */
    public void emitParticipantRemoved(Long availableEventId, Long eventId) {
        Map<String, Object> data = new HashMap<>();
        data.put("availableEventId", availableEventId);
        data.put("eventId", eventId);
        data.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/event/" + availableEventId + "/participant-removed", data);
        System.out.println("Emitted participant-removed for event " + availableEventId + " via WebSocket");
    }

    /**
     * Emit waiting list promotion event
     */
    public void emitWaitingListPromotion(Long availableEventId) {
        Map<String, Object> data = new HashMap<>();
        data.put("availableEventId", availableEventId);
        data.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/event/" + availableEventId + "/waiting-list-promotion", data);
        System.out.println("Emitted waiting-list-promotion for event " + availableEventId + " via WebSocket");
    }

    /**
     * Emit registration status update
     * This notifies all clients when the registration deadline status changes
     */
    public void emitRegistrationStatusUpdate(boolean isRegistrationOpen) {
        Map<String, Object> data = new HashMap<>();
        data.put("isRegistrationOpen", isRegistrationOpen);
        data.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/registration-status", data);
        System.out.println("Emitted registration-status update: isRegistrationOpen=" + isRegistrationOpen + " via WebSocket");
    }

    public void emitCollegeRankings(List<CollegeRankingDto> rankings) {
        messagingTemplate.convertAndSend(
                "/topic/college-rankings",
                rankings
        );
    }

}

