package com.dcfest.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
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
@Table(name = "notification_logs")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLogModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(nullable = false)
    private AvailableEventModel availableEvent;

    @ManyToOne(targetEntity = UserModel.class)
    @JoinColumn(nullable = false)
    private UserModel user;

    @Column(nullable = false)
    String message;

}
