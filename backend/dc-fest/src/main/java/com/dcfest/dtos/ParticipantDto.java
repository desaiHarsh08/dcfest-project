package com.dcfest.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    private Long id;
    private boolean isPresent;
    private Long points;
    private String name;
    private String email;
    private String whatsappNumber;
    private boolean isMale;
    private String group;
    private String qrcode;
    private Long collegeId;         // College ID as a simple field
    private List<Long> eventIds;    // Event IDs as a list of Longs (no JPA annotations)
}
