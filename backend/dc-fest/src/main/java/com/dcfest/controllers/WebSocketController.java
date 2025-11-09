package com.dcfest.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketController {

    /**
     * Handle join event room request
     * Clients can send a message to /app/join-event-room to join a specific event's room
     */
    @MessageMapping("/join-event-room")
    @SendTo("/topic/event-room-joined")
    public Map<String, Object> joinEventRoom(Map<String, Object> data) {
        System.out.println("Client joined event room: " + data.get("availableEventId"));
        return data;
    }

    /**
     * Handle leave event room request
     */
    @MessageMapping("/leave-event-room")
    @SendTo("/topic/event-room-left")
    public Map<String, Object> leaveEventRoom(Map<String, Object> data) {
        System.out.println("Client left event room: " + data.get("availableEventId"));
        return data;
    }
}

