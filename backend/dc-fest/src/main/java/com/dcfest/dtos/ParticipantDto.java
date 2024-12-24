package com.dcfest.dtos;

import com.dcfest.constants.EntryType;
import com.dcfest.constants.HandPreferenceType;
import com.dcfest.constants.ParticipantType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
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
    private String teamNumber;
    private String qrcode;
    private Long collegeId;         // College ID as a simple field
    private List<Long> eventIds;    // Event IDs as a list of Longs (no JPA annotations)
    private ParticipantType type = ParticipantType.PERFORMER;
    private EntryType entryType = EntryType.NORMAL;
    private HandPreferenceType handPreference = HandPreferenceType.RIGHT_HANDED;
    private List<PromotedRoundDto> promotedRoundDtos = new ArrayList<>();
    private Boolean disableParticipation;
}
