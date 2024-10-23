package com.dcfest.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class VenueDto {

    private Long id;

    private String name;

    private Long availableEventId;

    private LocalDateTime start;

    private LocalDateTime end;

}
