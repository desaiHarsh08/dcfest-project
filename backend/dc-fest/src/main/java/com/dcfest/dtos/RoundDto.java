package com.dcfest.dtos;

import com.dcfest.constants.RoundStatus;
import com.dcfest.constants.RoundType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RoundDto {

    private Long id;

    private RoundType roundType = RoundType.PRELIMINARY;
    
    private int qualifyNumber;

    private RoundStatus status;

    private String note;

    private Long availableEventId;

    private boolean disableNotifications;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String venue;

}
