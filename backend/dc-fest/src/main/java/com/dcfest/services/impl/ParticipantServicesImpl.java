package com.dcfest.services.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import javax.imageio.ImageIO;

import com.dcfest.constants.*;
import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.dtos.PromotedRoundDto;
import com.dcfest.exceptions.OTSESlotsException;
import com.dcfest.exceptions.RegisteredSlotsAvailableException;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import com.dcfest.services.ParticipantAttendanceServices;
import org.bouncycastle.est.ESTSourceConnectionListener;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;

import com.dcfest.dtos.ParticipantDto;
import com.dcfest.dtos.UserDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.services.ParticipantServices;
import com.dcfest.utils.PageResponse;

@Service
public class ParticipantServicesImpl implements ParticipantServices {

    private static final int PAGE_SIZE = 100;

    private static final String ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int RANDOM_PART_LENGTH = 16; // Length of the random alphanumeric part

    @Autowired
    private ParticipantAttendanceServices participantAttendanceServices;

    @Autowired
    private PromotedRoundRepository promotedRoundRepository;

    @Autowired
    private EventRuleTemplateRepository eventRuleTemplateRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeParticipationRepository collegeParticipationRepository;



    @Autowired
    private EventRuleRepository eventRuleRepository;

    @Override
    public List<ParticipantDto> createParticipants(List<ParticipantDto> participantDtos) {
        CollegeModel collegeModel = this.collegeRepository.findById(participantDtos.get(0).getCollegeId()).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid college id")
        );

        EventModel eventModel = this.eventRepository.findById(participantDtos.get(0).getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id"));
        eventModel.setId(participantDtos.get(0).getEventIds().get(0));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid `AVAILABLE_EVENT` id provided: " + eventModel.getAvailableEvent().getId()));

        if (availableEventModel.isCloseRegistration()) {
            throw new IllegalArgumentException("Registrations are now closed. Please contact the host college!");
        }

        eventModel.setAvailableEvent(availableEventModel);


        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(availableEventModel);

        // Retrieve the REGISTERED_SLOTS_AVAILABLE
        EventRuleModel eventRuleModel = eventRuleModels.stream().filter(ele -> ele.getEventRuleTemplate().getId().equals(6L)).findAny().orElse(null);
        if (eventRuleModel == null) {
            throw new RegisteredSlotsAvailableException("Unable to get the Maximum slots available");
        }
        // Retrieve the OTSE_SLOTS
        EventRuleModel otseSlotsEventRule = eventRuleModels.stream().filter(ele -> ele.getEventRuleTemplate().getName().equalsIgnoreCase("OTSE_SLOTS")).findAny().orElse(null);
        if (otseSlotsEventRule == null) {
            throw new IllegalArgumentException("Unable to get the OTSE slots available rule");
        }


        // Check for enrollment
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        CollegeParticipationModel existingCollegeParticipation = collegeParticipationModels.stream().filter(cp -> cp.getCollege().getId().equals(participantDtos.get(0).getCollegeId())).findAny().orElse(null);
        if (collegeParticipationModels.isEmpty() || existingCollegeParticipation == null) {
            this.collegeParticipationRepository.save(new CollegeParticipationModel(
                    null,
                    new CollegeModel(participantDtos.get(0).getCollegeId()),
                    availableEventModel,
                    null
            ));
        }

        // Check the unique college
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(participantDtos.get(0).getEventIds().get(0), participantDtos.get(0).getCollegeId());
        if (participantModels.isEmpty()) { // Unique (New) College participant

            int maxSlotsAvailable = Integer.parseInt(eventRuleModel.getValue());

            int slotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventModel.getId()).intValue();
            System.out.println("Slots occupied: " + slotsOccupied);

            if (slotsOccupied + 1 > maxSlotsAvailable) {
//                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM, yyyy"); // Define the date format
//                LocalDate comparisonDate = LocalDate.parse("10 Dec, 2024", formatter);
// LocalDate.now().isAfter(comparisonDate)
                if (participantDtos.get(0).getEntryType().equals(EntryType.NORMAL)) {
                    throw new RegisteredSlotsAvailableException("Maximum available slots for this event has been filled. Please contact us at dean.office@thebges.edu.in for assistance.");
                }
                int otseSlotsAvailable = Integer.parseInt(otseSlotsEventRule.getValue());
                if (otseSlotsAvailable == 0) {
                    throw new OTSESlotsException("No OTSE slots available");
                }

                // Grab the unique colleges
                List<ParticipantModel> allParticipantModels = this.participantRepository.findByEvents_Id(participantDtos.get(0).getEventIds().get(0));
                List<ParticipantModel> fiteredParticipantsByType = allParticipantModels.stream().filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();
                List<Long> collegesIds = new ArrayList<>();
                for (ParticipantModel participantModel : fiteredParticipantsByType) {
                    if (collegesIds.contains(participantModel.getCollege().getId())) {
                        continue;
                    }
                    collegesIds.add(participantModel.getCollege().getId());
                }


                int otseSlotsOccupied = collegesIds.size();
                if (otseSlotsOccupied + 1 > otseSlotsAvailable) {
                    throw new OTSESlotsException("Maximum OTSE slots for this event has been filled.");
                }

            }
        }

        List<String> groups = new ArrayList<>();

        if (participantDtos.get(0).getEntryType().equals(EntryType.OTSE)) {
            int otseSlotsAvailable = Integer.parseInt(otseSlotsEventRule.getValue());
            if (otseSlotsAvailable == 0) {
                throw new OTSESlotsException("No OTSE slots available");
            }

            // Grab the unique colleges
            List<ParticipantModel> allParticipantModels = this.participantRepository.findByEvents_Id(participantDtos.get(0).getEventIds().get(0));
            List<ParticipantModel> fiteredParticipantsByType = allParticipantModels.stream().filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();



            for (ParticipantModel participantModel : fiteredParticipantsByType) {
                if (groups.contains(participantModel.getGroup())) {
                    continue;
                }
                groups.add(participantModel.getGroup());
            }

            System.out.println(groups);

            int otseSlotsOccupied = groups.size();
            if (otseSlotsOccupied + 1 > otseSlotsAvailable) {
                throw new OTSESlotsException("Maximum OTSE slots for this event has been filled.");
            }

        }

        String group;

        long count = 0;
        if (participantDtos.get(0).getEntryType().equals(EntryType.NORMAL)) {
            System.out.println("in normal");
            group = collegeModel.getIcCode() + "_" + String.format("%02d", 1);
        }
        else {
            System.out.println("in otse, groups: " + groups);
            count = groups.stream().filter(grp -> grp.contains("_OTSE")).toList().size();
            group = collegeModel.getIcCode() + "_OTSE_" + String.format("%02d", count + 1);
        }

        // Create the participants
        List<ParticipantModel> savedParticipantModels = new ArrayList<>();
        for (ParticipantDto participantDto: participantDtos) {
            ParticipantModel participantModel = this.modelMapper.map(participantDto, ParticipantModel.class);
            participantModel.setCollege(collegeModel);
            participantModel.setEntryType(participantModel.getEntryType());
            participantModel.getEvents().add(eventModel);
            participantModel.setHandPreference(participantDto.getHandPreference());
            participantModel.setGroup(group);

            // Save the participant
            participantModel = this.participantRepository.save(participantModel);

            // Save the events
            eventModel.getParticipants().add(participantModel);
            this.eventRepository.save(eventModel);

            savedParticipantModels.add(participantModel);
        }

        return savedParticipantModels.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }


    @Override
    public ParticipantDto addParticipant(ParticipantDto participantDto) {
        CollegeModel collegeModel = this.collegeRepository.findById(participantDto.getCollegeId()).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid college id")
        );

        EventModel eventModel = this.eventRepository.findById(participantDto.getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id"));
        eventModel.setId(participantDto.getEventIds().get(0));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid `AVAILABLE_EVENT` id provided: " + eventModel.getAvailableEvent().getId()));
        eventModel.setAvailableEvent(availableEventModel);

        List<EventRuleModel> eventRuleModels = this.eventRuleRepository.findByAvailableEvent(availableEventModel);
//        for (EventRuleModel eventRuleModel: eventRuleModels) {
//            EventRuleTemplateModel eventRuleTemplateModel = this.eventRuleTemplateRepository.findById(eventRuleModel.getEventRuleTemplate().getId()).orElseThrow(
//                    () ->new IllegalArgumentException("Unable to load the checks")
//            );
//            eventRuleModel.setEventRuleTemplate(eventRuleTemplateModel);
//        }

        // Retrieve the REGISTERED_SLOTS_AVAILABLE
        EventRuleModel maxSlotsEventRule = eventRuleModels.stream().filter(ele -> ele.getEventRuleTemplate().getId().equals(6L)).findAny().orElse(null);
        if (maxSlotsEventRule == null) {
            throw new RegisteredSlotsAvailableException("Unable to get the Maximum slots available");
        }

        // Check for enrollment
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        CollegeParticipationModel existingCollegeParticipation = collegeParticipationModels.stream().filter(cp -> cp.getCollege().getId().equals(participantDto.getCollegeId())).findAny().orElse(null);
        if (collegeParticipationModels.isEmpty() || existingCollegeParticipation == null) {
            this.collegeParticipationRepository.save(new CollegeParticipationModel(
                    null,
                    new CollegeModel(participantDto.getCollegeId()),
                    availableEventModel,
                    null
            ));
        }



        // Fetch the participant
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeIdAndGroup(participantDto.getEventIds().get(0), participantDto.getCollegeId(), participantDto.getGroup());

        // Check for max_slots
        if (participantDto.getType().equals(ParticipantType.PERFORMER)) {
            EventRuleModel performerRule = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getId().equals(10L)).findAny().orElse(null);
            System.out.println("max_slots:" + Integer.parseInt(performerRule.getValue()));
            System.out.println("con: " + participantModels.stream().filter(p -> p.getType().equals(ParticipantType.PERFORMER) && p.getGroup().equals(participantDto.getGroup())).count());
            if (participantModels.stream().filter(p -> p.getType().equals(ParticipantType.PERFORMER) && p.getGroup().equals(participantDto.getGroup())).count() + 1 > Integer.parseInt(performerRule.getValue())) {
                throw new IllegalArgumentException("Performer can't be added now!");
            }
        }

        // Check for accompanist
        if (participantDto.getType().equals(ParticipantType.ACCOMPANIST)) {
            System.out.println(eventRuleModels);
            System.out.println("in accompanist: -");
            for (EventRuleModel eventRuleModel: eventRuleModels) {
                System.out.println(eventRuleModel.getAvailableEvent() + "\t" + eventRuleModel.getEventRuleTemplate());
            }
            EventRuleModel accompanistRule = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getId().equals(3L)).findAny().orElse(null);
            if (accompanistRule == null) {
                throw new IllegalArgumentException("Accompanist can't be added!");
            }
            if (accompanistRule != null) {
                if (participantModels.stream().filter(p -> p.getType().equals(ParticipantType.ACCOMPANIST)  && p.getGroup().equals(participantDto.getGroup())).count() + 1 > Integer.parseInt(accompanistRule.getValue())) {
                    throw new IllegalArgumentException("Accompanist can't be added now!");
                }
            }

        }

        // Check for gender
        if (participantDto.isMale()) {

            EventRuleModel maleRule = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getId().equals(11L)).findAny().orElse(null);
            if (maleRule != null) {
                if (participantModels.stream().filter(p -> p.isMale() && p.getGroup().equals(participantDto.getGroup())).count() + 1 > Integer.parseInt(maleRule.getValue())) {
                    throw new IllegalArgumentException("MALE_PARTICIPANT can't be added now!");
                }
            }

        }
        else {
            EventRuleModel femaleRule = eventRuleModels.stream().filter(e -> e.getEventRuleTemplate().getId().equals(12L)).findAny().orElse(null);
            if (femaleRule != null) {
                if (participantModels.stream().filter(p -> !p.isMale() && p.getGroup().equals(participantDto.getGroup())).count() + 1 > Integer.parseInt(femaleRule.getValue())) {
                    throw new IllegalArgumentException("FEMALE_PARTICIPANT can't be added now!");
                }
            }

        }


        // Create the participant
        ParticipantModel participantModel = this.modelMapper.map(participantDto, ParticipantModel.class);
        participantModel.setCollege(collegeModel);
        participantModel.setEntryType(participantModel.getEntryType());
        participantModel.getEvents().add(eventModel);
        participantModel.setHandPreference(participantDto.getHandPreference());
        participantModel.setGroup(participantDto.getGroup());

        // Save the participant
        participantModel = this.participantRepository.save(participantModel);
        // Save the events
        eventModel.getParticipants().add(participantModel);
        this.eventRepository.save(eventModel);


        return this.participantModelToDto(participantModel);
    }

    @Override
    public  Long slotsOccupied(Long eventId) {
        System.out.println("eventId: " + eventId);
        Long tmpSlotsOccupied = this.participantRepository.countDistinctCollegesForEvent(eventId);
        System.out.println(tmpSlotsOccupied);
        return tmpSlotsOccupied;
    }

    private String generateAlphanumericUUID() {
        // Get the current timestamp in milliseconds
        long timestamp = System.currentTimeMillis();

        // Generate a random alphanumeric string
        String randomPart = generateRandomAlphanumeric(RANDOM_PART_LENGTH);

        // Combine the random part with the timestamp
        String alphanumericUUID = randomPart + Long.toHexString(timestamp);

        return alphanumericUUID.toUpperCase(); // Convert to uppercase for alphanumeric format
    }

    private String generateRandomAlphanumeric(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(ALPHANUMERIC_CHARS.length());
            sb.append(ALPHANUMERIC_CHARS.charAt(index));
        }

        return sb.toString();
    }

    private UserModel getUserModel(UserDto userDto) {
        UserModel userModel = this.userRepository.findByEmail(userDto.getEmail()).orElse(null);
        if (userModel != null) {
            return userModel;
        }

        // Create the user
        userModel = this.modelMapper.map(userDto, UserModel.class);

        // Save the user
        return this.userRepository.save(userModel);
    }


    private String generateMailBody(ParticipantModel participantModel, EventModel eventModel) {
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                () -> new IllegalArgumentException("Unable to get the available_event for id: " + eventModel.getAvailableEvent().getId())
        );
        List<RoundModel> roundModels = this.roundRepository.findByAvailableEvent(availableEventModel);

//        List<VenueModel> venueModels = new ArrayList<>();
//        for (RoundModel roundModel: roundModels) {
//            if (roundModel.getRoundType().equals(RoundType.PRELIMINARY) && roundModel.getStatus().equals(RoundStatus.NOT_STARTED)) {
//                venueModels = this.venueRepository.findByRound(roundModel);
//                break;
//            }
//        }

//        if (venueModels.isEmpty()) {
//            return null;
//        }

//        this.emailServices.sendParticipantRegistrationEmail(ve);

        // Start constructing the email body
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("<p>Dear ").append(participantModel.getName()).append(",</p>")
                .append("<p>We are pleased to confirm your participation in the event <strong>")
                .append(eventModel.getAvailableEvent().getTitle()).append("</strong> as part of Umang DCFest 2024.</p>")
                .append("<p><strong>Event Details:</strong></p>")
                .append("<ul>")
                .append("<li><strong>Event Name:</strong> ").append(eventModel.getAvailableEvent().getTitle())
                .append("</li>");

        // Add venue details for each venue
//        for (VenueModel venueModel : venueModels) {
//            emailBody.append("<li><strong>Venue:</strong> ").append(venueModel.getName()).append("</li>")
//                    .append("<li><strong>Date & Time:</strong> ")
//                    .append(venueModel.getStart().toLocalDate()).append(" at ")
//                    .append(venueModel.getStart().toLocalTime()).append(" to ")
//                    .append(venueModel.getEnd().toLocalTime()).append("</li>");
//        }
//
//        emailBody.append("</ul>")
//                .append("<p>We look forward to your participation. Please feel free to contact us if you have any questions.</p>")
//                .append("<p>Best regards,<br>The Umang DCFest Team</p>");

//        return emailBody.toString();
        return null;
    }

    public byte[] generateQRCodeImage(String data, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1); // Adjust margin as necessary

        BitMatrix bitMatrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, width, height, hints);
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                image.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF); // Black and White QR code
            }
        }

        // Convert image to byte array
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }

    @Override
    public PageResponse<ParticipantDto> getAllParticipants(int pageNumber) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<ParticipantModel> pageParticipant = this.participantRepository.findAll(pageable);

        List<ParticipantModel> participantModels = pageParticipant.getContent();

        List<ParticipantDto> participantDtos = participantModels.stream().map(this::participantModelToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageParticipant.getTotalPages(),
                pageParticipant.getTotalElements(),
                participantDtos);
    }

    @Override
    public ParticipantDto getParticipantById(Long id) {
        ParticipantModel foundParticipantModel = this.participantRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `PARTICIPANT` exist for id: " + id));




        return this.participantModelToDto(foundParticipantModel);
    }

    @Override
    public List<ParticipantDto> getParticipantByCollegeId(Long collegeId) {
        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(collegeId);
        List<ParticipantModel> participantModels = this.participantRepository.findByCollege(collegeModel);

       if (participantModels.isEmpty()) {
           return new ArrayList<>();
       }

        return participantModels.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public PageResponse<ParticipantDto> getParticipantByIsPresent(int pageNumber, boolean isPresent) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<ParticipantModel> pageParticipant = this.participantRepository.findByIsPresent(pageable, isPresent);

        List<ParticipantModel> participantModels = pageParticipant.getContent();

        List<ParticipantDto> participantDtos = participantModels.stream().map(this::participantModelToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageParticipant.getTotalPages(),
                pageParticipant.getTotalElements(),
                participantDtos);
    }

    @Override
    public List<ParticipantDto> getParticipantByEventId(Long eventId) {
         EventModel eventModel = new EventModel();
         eventModel.setId(eventId);
        System.out.println(eventId);
         List<ParticipantModel> participants = this.participantRepository.findByEvents_Id(eventId);
         if (participants.isEmpty()) {
             return new ArrayList<>();
         }
         return participants.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public List<ParticipantDto> getParticipantsByEventIdandCollegeId(Long eventId, Long collegeId) {
        EventModel eventModel = new EventModel();
        eventModel.setId(eventId);
        System.out.println(eventId);
        List<ParticipantModel> participants = this.participantRepository.findByEvent_IdAndCollegeId(eventId, collegeId);
        if (participants.isEmpty()) {
            return new ArrayList<>();
        }
        return participants.stream().map(this::participantModelToDto).collect(Collectors.toList());
    }

    @Override
    public ParticipantDto updateParticipant(ParticipantDto participantDto) {
        ParticipantModel foundParticipantModel = this.participantRepository.findById(participantDto.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "No `PARTICIPANT` exist for id: " + participantDto.getId()));
        // Update the fields
        foundParticipantModel.setName(participantDto.getName());
        foundParticipantModel.setEmail(participantDto.getEmail());
        foundParticipantModel.setPresent(participantDto.isPresent());
        foundParticipantModel.setWhatsappNumber(participantDto.getWhatsappNumber());
        foundParticipantModel.setMale(participantDto.isMale());
        foundParticipantModel.setHandPreference(participantDto.getHandPreference());

        // Save the changes
        foundParticipantModel = this.participantRepository.save(foundParticipantModel);

        return this.participantModelToDto(foundParticipantModel);
    }

    @Override
    public boolean markPoints(Long points, String group) {
        List<ParticipantModel> participantModels = this.participantRepository.findByGroup(group);
        if (participantModels.isEmpty()) {
            throw new ResourceNotFoundException("No participant(s) found for identifier: " + group);
        }
        for (ParticipantModel participantModel: participantModels) {
            participantModel.setPoints(points);
            this.participantRepository.save(participantModel);
        }

        return true;
    }

    @Override
    public boolean deleteParticipant(Long id) {
        // Fetch the participant by ID
        ParticipantModel participant = this.participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found with ID: " + id));

        // Remove the participant from each event's participants list
        for (EventModel event : participant.getEvents()) {
            event.getParticipants().remove(participant);
            this.eventRepository.save(event);  // Save each event after removing the participant
        }

        // Remove participant attendance
        List<ParticipantAttendanceDto> participantAttendanceDtos = this.participantAttendanceServices.getParticipantAttendancesByParticipantId(id);
        for (ParticipantAttendanceDto participantAttendanceDto: participantAttendanceDtos) {
            this.participantAttendanceServices.deleteAttendance(participantAttendanceDto.getId());
        }

        // Clear the events list in the participant itself to complete the cleanup
        participant.getEvents().clear();
        this.participantRepository.save(participant);

        // Now delete the participant
        this.participantRepository.deleteById(id);

        return true;
    }

    @Override
    public void deleteParticipantsByEventId(Long eventId) {
         List<ParticipantModel> participantModels = this.participantRepository.findByEvents_Id(eventId);
         for (ParticipantModel participantModel: participantModels) {
             this.deleteParticipant(participantModel.getId());
         }
    }

    @Override
    public void deleteParticipantsByCollegesId(Long collegeId) {
        List<ParticipantModel> participantModels = this.participantRepository.findByCollege(new CollegeModel(collegeId));
        for (ParticipantModel participantModel: participantModels) {
            this.deleteParticipant(participantModel.getId());
        }
    }

    @Override
    public boolean correctGroupNameForParticipants() {
        List<CollegeModel> collegeModels = this.collegeRepository.findAll();
        List<CollegeModel> filteredColleges = new ArrayList<>();
        for (CollegeModel collegeModel: collegeModels) {
            if (collegeModel.isDetailsUploaded()) {
                filteredColleges.add(collegeModel);
            }
        }

        List<AvailableEventModel> availableEventModels = this.availableEventRepository.findAll();

        List<EventModel> eventModels = this.eventRepository.findAll();

        System.out.println("Total events: " + eventModels.size());
        int eventCount = 0;
        for (EventModel eventModel: eventModels) {
//            System.out.println("doing event: " + (++eventCount) + "/" + eventModels.size());

            AvailableEventModel availableEventModel = availableEventModels.stream().filter(a -> a.getId().equals(eventModel.getAvailableEvent().getId())).findFirst().orElse(null);
            if (availableEventModel == null) {
                continue;
            }
            eventModel.setAvailableEvent(availableEventModel);
            List<CollegeModel> participatedCollege =  this.getParticipatedCollegesByEvent(eventModel, filteredColleges);
            for (int i = 0, c = 0; i < participatedCollege.size(); i++) {
                CollegeModel collegeModel = participatedCollege.get(i);

                List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(eventModel.getId(), collegeModel.getId());
                if (participantModels.isEmpty()) {
                    continue;
                }

                List<ParticipantModel> normalParticipants = participantModels.stream().filter(p -> p.getEntryType().equals(EntryType.NORMAL)).toList();
                for (ParticipantModel participantModel: normalParticipants) {
                    participantModel.setGroup(
                            collegeModel.getIcCode() + "_" + String.format("%02d", 1)
                    );
                    participantModel = this.participantRepository.save(participantModel);
                    System.out.println(participantModel.getGroup());
                }

                List<ParticipantModel> otseParticipants = participantModels.stream().filter(p -> p.getEntryType().equals(EntryType.OTSE)).toList();
                for (ParticipantModel participantModel : otseParticipants) {
                    String group = participantModel.getGroup();
                    int count = 0;

//                    System.out.println(participantModel.getGroup());

                    if (participantModel.getGroup().contains(collegeModel.getIcCode() + "_" + 'T')) {
                        System.out.println("iccode_T: " + participantModel.getGroup());
                    }

                    try {
                        if (group.contains("_OTSE_")) {
                            // Safely extract substring and parse to integer
                            if (group.length() > 12) {
                                count = 1;
                            } else {
//                                System.out.println(participantModel.getGroup());
                                throw new IllegalArgumentException("Invalid group format: " + group);
                            }
                        } else {
                            // Safely extract substring and parse to integer
                            if (group.length() > 7) {
                                count = Integer.parseInt(group.substring(7));
                            }
                            else if (group.length() == 7) {
                                count = Integer.parseInt(String.valueOf(group.charAt(6)));
                            }
                            else {

                                throw new IllegalArgumentException("Invalid group format: " + group);
                            }
                        }

                        // Set the modified group
                        participantModel.setGroup(collegeModel.getIcCode() + "_OTSE_" + String.format("%02d", count));
                        participantModel = this.participantRepository.save(participantModel);
//                        System.out.println(participantModel.getGroup());

                    } catch (Exception e) {
                        // Handle invalid group format or parsing errors
                        System.err.println("Error processing group: " + group + ". " + e.getMessage());
                    }
                }

//                for (ParticipantModel participantModel: participantModels) {
//                    if (participantModel.getEntryType().equals(EntryType.NORMAL)) {
//                        // Extract the count from the group (IC000_count)
//                        int count = Integer.parseInt(participantModel.getGroup().substring(7));
//                        participantModel.setGroup(
//                                collegeModel.getIcCode() + "_" + String.format("%02d", count)
//                        );
//                    }
//                    else {
//
//                    }
//                    participantModel.setGroup(group);
//
//
//                    p
//                    this.participantRepository.save(participantModel);
//
//                    System.out.println("College: " + (i + 1) + "/" + participatedCollege.size() + ", participants size: " + participantModels.size());
//                }


//                System.out.println("done college: " + (i + 1));
            }


        }

        return true;
    }

    private List<CollegeModel> getParticipatedCollegesByEvent(EventModel eventModel, List<CollegeModel> givenCollegeModels) {
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(eventModel.getAvailableEvent());
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }

        List<CollegeModel> collegeModels = new ArrayList<>();
        for (CollegeParticipationModel collegeParticipationModel: collegeParticipationModels) {
            CollegeModel collegeModel = givenCollegeModels.stream().filter(c -> c.getId().equals(collegeParticipationModel.getCollege().getId())).findFirst().orElse(null);
            if (collegeModel == null) {
                continue;
            }
            collegeModels.add(collegeModel);
        }

        return collegeModels;
    }

    private ParticipantDto participantModelToDto(ParticipantModel participantModel) {
        if (participantModel == null) {
            return null;
        }

        ParticipantDto participantDto = this.modelMapper.map(participantModel, ParticipantDto.class);
        participantDto.setCollegeId(participantModel.getCollege().getId());
        // participantDto.setEvents(new ArrayList<>());
        participantDto.setEntryType(participantModel.getEntryType());
        List<PromotedRoundModel> promotedRoundModels = this.promotedRoundRepository.findByParticipant(participantModel);
        for (PromotedRoundModel promotedRoundModel: promotedRoundModels) {
            PromotedRoundDto promotedRoundDto = new PromotedRoundDto();
            promotedRoundDto.setId(promotedRoundDto.getId());
            promotedRoundDto.setParticipantId(participantDto.getId());
            promotedRoundDto.setRoundId(promotedRoundModel.getRound().getId());

            participantDto.getPromotedRoundDtos().add(promotedRoundDto);
        }


        // Convert the list of EventModel to a list of event IDs
        List<Long> eventIds = participantModel.getEvents().stream().map(EventModel::getId).collect(Collectors.toList());
        participantDto.setEventIds(eventIds);

        return participantDto;
    }

    public boolean disableParticipation(String group, Long eventId, boolean status) {
        System.out.println("event id: " + eventId);
        System.out.println("status: " + status);
        System.out.println("group: " + group);
        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndGroup(eventId, group);
        for (ParticipantModel participantModel: participantModels) {
            System.out.println(participantModel.getEvents());
            participantModel.setDisableParticipation(status);
            System.out.println("saving participant: " + participantModel.getDisableParticipation());
            this.participantRepository.save(participantModel);
        }

        return true;
    }

    private UserDto userModelToDto(UserModel userModel) {
        if (userModel == null) {
            return null;
        }
        UserDto userDto = this.modelMapper.map(userModel, UserDto.class);

        return userDto;
    }

}
