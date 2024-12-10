package com.dcfest.models;

import java.util.List;
import java.util.ArrayList;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "judges")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class JudgeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String phone;

    @ManyToOne(targetEntity = AvailableEventModel.class)
    private AvailableEventModel availableEvent;

}
