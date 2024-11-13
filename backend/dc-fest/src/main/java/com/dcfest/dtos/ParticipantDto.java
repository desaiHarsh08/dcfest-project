package com.dcfest.dtos;

import java.util.ArrayList;
import java.util.List;

import com.dcfest.models.CollegeModel;
import com.dcfest.models.EventModel;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {

    private Long id;

    private boolean isPresent;

    private Long points;

    private String name;

    private String email;

    private String whatsappNumber;

    private String group;

    private String qrcode;

    private Long collegeId;

    @ManyToMany(mappedBy = "participants")
    private List<EventModel> events =  new ArrayList<>();

    private List<Long> eventIds;

}
