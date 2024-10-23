package com.dcfest.models;

import java.util.List;
import java.util.ArrayList;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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

    @OneToOne(targetEntity = UserModel.class)
    @JoinColumn(name = "user_id_fk", nullable = false)
    private UserModel user;

    @ManyToMany(mappedBy = "judges")
    private List<EventModel> events = new ArrayList<>();

}
