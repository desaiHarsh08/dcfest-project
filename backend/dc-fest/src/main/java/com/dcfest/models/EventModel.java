package com.dcfest.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(targetEntity = AvailableEventModel.class)
    @JoinColumn(name = "available_event_id_fk", nullable = false)
    private AvailableEventModel availableEvent;

    @ManyToMany
    @JoinTable(name = "event_participant", joinColumns = @JoinColumn(name = "event_id"), inverseJoinColumns = @JoinColumn(name = "participant_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            "event_id", "participant_id" }))
    @JsonManagedReference
    private List<ParticipantModel> participants = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "event_judge", joinColumns = @JoinColumn(name = "event_id"), inverseJoinColumns = @JoinColumn(name = "judge_id"))
    private List<JudgeModel> judges = new ArrayList<>();

    @Override
    public String toString() {
        return "EventModel{" +
                "id=" + id +
                ", eventName='" + this.id + "'" +
                // Avoid adding large object references here
                '}';
    }

    public EventModel(Long id) {
        this.id = id;
    }

}
