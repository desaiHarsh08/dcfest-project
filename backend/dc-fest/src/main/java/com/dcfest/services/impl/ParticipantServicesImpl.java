package com.dcfest.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;
import java.security.SecureRandom;
import javax.imageio.ImageIO;

import com.dcfest.constants.RoundStatus;
import com.dcfest.constants.RoundType;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
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
    private VenueRepository venueRepository;

    @Autowired
    private EmailServices emailServices;

    @Override
    public ParticipantDto createParticipant(ParticipantDto participantDto) {
        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(participantDto.getCollegeId());
        EventModel eventModel = this.eventRepository.findById(participantDto.getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id"));
        eventModel.setId(participantDto.getEventIds().get(0));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid `AVAILABLE_EVENT` id provided: " + eventModel.getAvailableEvent().getId()));
        eventModel.setAvailableEvent(availableEventModel);

        // Create the participant
        ParticipantModel participantModel = this.modelMapper.map(participantDto, ParticipantModel.class);
        participantModel.setCollege(collegeModel);
        participantModel.getEvents().add(eventModel);

        String qrData = this.generateAlphanumericUUID();
        participantModel.setQrcode(qrData);

        // Save the participant
        participantModel = this.participantRepository.save(participantModel);
        // Save the events
        eventModel.getParticipants().add(participantModel);
        this.eventRepository.save(eventModel);

        
        
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = generateQRCodeImage(qrData, 200, 200);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            e.printStackTrace(); // This logs the exception
            throw new RuntimeException("Failed to generate QR code", e);
        }

        // Notify the participant
        String subject = "Confirmation of your participation in " + eventModel.getAvailableEvent().getTitle()
                + " - Umang DCFest 2024";
        String body = this.generateMailBody(participantModel, eventModel);
        if (body != null) {
            this.emailServices.sendSimpleMessageWithAttachment(participantModel.getEmail(),
                    subject,
                    body,
                    qrCodeImage,
                    "QRCode_Participant_" + participantModel.getId() + ".png");
        }

        return this.participantModelToDto(participantModel);
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

        List<VenueModel> venueModels = new ArrayList<>();
        for (RoundModel roundModel: roundModels) {
            if (roundModel.getRoundType().equals(RoundType.PRELIMINARY) && roundModel.getStatus().equals(RoundStatus.NOT_STARTED)) {
                venueModels = this.venueRepository.findByRound(roundModel);
                break;
            }
        }

        if (venueModels.isEmpty()) {
            return null;
        }

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
        for (VenueModel venueModel : venueModels) {
            emailBody.append("<li><strong>Venue:</strong> ").append(venueModel.getName()).append("</li>")
                    .append("<li><strong>Date & Time:</strong> ")
                    .append(venueModel.getStart().toLocalDate()).append(" at ")
                    .append(venueModel.getStart().toLocalTime()).append(" to ")
                    .append(venueModel.getEnd().toLocalTime()).append("</li>");
        }

        emailBody.append("</ul>")
                .append("<p>We look forward to your participation. Please feel free to contact us if you have any questions.</p>")
                .append("<p>Best regards,<br>The Umang DCFest Team</p>");

        return emailBody.toString();
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
    public PageResponse<ParticipantDto> getParticipantByCollegeId(int pageNumber, Long collegeId) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);
        CollegeModel collegeModel = new CollegeModel();
        collegeModel.setId(collegeId);
        Page<ParticipantModel> pageParticipant = this.participantRepository.findByCollege(pageable, collegeModel);

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
    public PageResponse<ParticipantDto> getParticipantByEventId(int pageNumber, Long eventId) {
        // if (pageNumber < 1) {
        // throw new IllegalArgumentException("Page no. should always be greater than
        // 0.");
        // }

        // Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);

        // EventModel eventModel = new EventModel();
        // eventModel.setId(eventId);

        // Page<ParticipantModel> pageParticipant =
        // this.participantRepository.findBy(pageable, collegeModel);

        // List<ParticipantModel> participantModels = pageParticipant.getContent();

        // List<ParticipantDto> participantDtos =
        // participantModels.stream().map(this::participantModelToDto)
        // .collect(Collectors.toList());

        // return new PageResponse<>(
        // pageNumber,
        // PAGE_SIZE,
        // pageParticipant.getTotalPages(),
        // pageParticipant.getTotalElements(),
        // participantDtos);

        return null;
    }

    @Override
    public ParticipantDto updateParticipant(ParticipantDto participantDto) {
        ParticipantModel foundParticipantModel = this.participantRepository.findById(participantDto.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "No `PARTICIPANT` exist for id: " + participantDto.getId()));
        // Update the fields
        foundParticipantModel.setPoints(participantDto.getPoints());





        // Save the changes
        foundParticipantModel = this.participantRepository.save(foundParticipantModel);

        return this.participantModelToDto(foundParticipantModel);
    }

    @Override
    public boolean deleteParticipant(Long id) {
        this.getParticipantById(id);
        this.participantRepository.deleteById(id);

        return true;
    }

    @Override
    public void deleteParticipantsByEventId(Long eventId) {
        // this.participantRepository.dele(collegeId);
    }

    @Override
    public void deleteParticipantsByCollegesId(Long collegeId) {
        this.participantRepository.deleteByCollegeId(collegeId);
    }

    private ParticipantDto participantModelToDto(ParticipantModel participantModel) {
        if (participantModel == null) {
            return null;
        }
        ParticipantDto participantDto = this.modelMapper.map(participantModel, ParticipantDto.class);
        participantDto.setCollegeId(participantModel.getCollege().getId());

        // Convert the list of EventModel to a list of event IDs
        List<Long> eventIds = participantModel.getEvents().stream().map(EventModel::getId).collect(Collectors.toList());
        participantDto.setEventIds(eventIds);

        return participantDto;
    }

    private UserDto userModelToDto(UserModel userModel) {
        if (userModel == null) {
            return null;
        }
        UserDto userDto = this.modelMapper.map(userModel, UserDto.class);

        return userDto;
    }

}
