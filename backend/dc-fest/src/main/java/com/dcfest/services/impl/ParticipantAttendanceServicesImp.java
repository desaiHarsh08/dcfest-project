package com.dcfest.services.impl;

import com.dcfest.constants.EntryType;
import com.dcfest.constants.RoundType;
import com.dcfest.dtos.*;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.*;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.*;
import com.dcfest.services.*;
import com.dcfest.utils.PdfGenerator;
import com.dcfest.utils.PdfService;
import com.dcfest.utils.ScannedQrcodeResponse;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ParticipantAttendanceServicesImp implements ParticipantAttendanceServices {

    private static final String ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int RANDOM_PART_LENGTH = 16; // Length of the random alphanumeric part

    @Autowired
    private EventRuleServices eventRuleServices;

    @Autowired
    private RoundServices roundServices;

    @Autowired
    private JudgeServices judgeServices;

    @Autowired
    private ScoreCardRepository scoreCardRepository;

    @Autowired
    private ParticipantAttendanceRepository participantAttendanceRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeRepresentativeRepository collegeRepresentativeRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private ScoreCardServices scoreCardServices;

    @Autowired
    private CollegeParticipationRepository collegeParticipationRepository;

    @Override
    public List<ParticipantAttendanceDto> createAttendance(String qrcodeData, List<ParticipantModel> participantModels, RoundModel roundModel, String group, String teamNumber) {
        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findByGroupAndRound(group, roundModel);
        if (participantAttendanceModels.isEmpty()) {
            for (ParticipantModel participantModel: participantModels) {
                ParticipantAttendanceModel attendanceModel = new ParticipantAttendanceModel(
                        null,
                        participantModel,
                        qrcodeData,
                        false,
                        roundModel,
                        group,
                        teamNumber
                );
                participantAttendanceModels.add(
                        this.participantAttendanceRepository.save(attendanceModel)
                );
            }
            System.out.println("List: " + participantAttendanceModels.size());
        }

        return participantAttendanceModels.stream().map(this::participantAttendanceModelToDto).collect(Collectors.toList());
    }

    @Override
    public ParticipantAttendanceDto getAttendanceById(Long id) {
        ParticipantAttendanceModel foundParticipantAttendanceModel = this.participantAttendanceRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No attendance found for id: " + id)
        );

        return this.participantAttendanceModelToDto(foundParticipantAttendanceModel);
    }

    @Override
    public InputStreamSource getPop(Long roundId, Long collegeId, Long availableEventId, String group) {
        CollegeModel collegeModel = this.collegeRepository.findById(collegeId).orElseThrow(
                () -> new ResourceNotFoundException("No college exist for id: " + collegeId)
        );
        List<CollegeRepresentativeModel> collegeRepresentativeModels = this.collegeRepresentativeRepository.findByCollege(collegeModel);

        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId)
        );

        EventModel eventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElseThrow(
                () -> new ResourceNotFoundException("No event exist for available event: " + availableEventId)
        );

        List<RoundModel> roundModels = this.roundRepository.findByAvailableEvent(availableEventModel);
        RoundModel roundModel = roundModels.stream().filter(r -> r.getId().equals(roundId)).findAny().orElseThrow(
                () -> new ResourceNotFoundException("No round exist for id: " + roundId)
        );
        roundModel.setAvailableEvent(availableEventModel);

        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(eventModel.getId(), collegeId);

        System.out.println(participantModels);


        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findByGroupAndRound(group, new RoundModel(roundId));
        System.out.println(participantModels    );
        participantModels = participantModels.stream().filter(p -> p.getGroup().equals(group)).collect(Collectors.toList());

        if (participantAttendanceModels.isEmpty()) {
            return null;
        }

        // Generate qrcode
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = generateQRCodeImage(participantAttendanceModels.get(0).getQrcode(), 200, 200);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            e.printStackTrace(); // This logs the exception
            throw new RuntimeException("Failed to generate QR code", e);
        }


        String teamNumber = participantModels.get(0).getTeamNumber();
        for (ParticipantModel participantModel: participantModels) {
            System.out.println(participantModel.getTeamNumber());
        }

        // Create the pop
        // Format the LocalDateTime to the required format without milliseconds
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a");
        String formattedDateTime = roundModel.getStartTime().format(formatter);

        // 1. Prepare data for the template
        String roundName = roundModel.getRoundType().equals(RoundType.SEMI_FINAL) ? "PRELIMS" : roundModel.getRoundType().name();
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("college", collegeModel.getName());
        templateData.put("eventTitle", availableEventModel.getTitle());
        templateData.put("venueName", roundModel.getVenue());
        templateData.put("dateTime", formattedDateTime);
        templateData.put("roundName", roundName);
        templateData.put("groupNumber", group); // Example
        templateData.put("teamNumber", teamNumber); // Example
        templateData.put("eventMaster", availableEventModel.getEventMaster());
        templateData.put("eventMasterPhone", availableEventModel.getEventMasterPhone());
//        System.out.println("img: " + Base64.getEncoder().encodeToString(qrCodeImage));
        templateData.put("qrcodeImage", "data:image/png;base64," + Base64.getEncoder().encodeToString(qrCodeImage));
        templateData.put("participants", participantModels);

        // Render the HTML template
        String htmlContent = pdfService.renderHtmlTemplate("pop_template", templateData);
        System.out.println("Rendered HTML: " + htmlContent);

//        System.out.println("Rendered HTML: " + htmlContent);
// Or save to a file
        try (FileWriter writer = new FileWriter("output.html")) {
            writer.write(htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Generate the PDF
        byte[] pdfBytes = PdfGenerator.generatePdf(htmlContent);

        InputStreamSource attachmentSource = new ByteArrayResource(pdfBytes);

        return attachmentSource;

    }

    @Override
    public  List<ParticipantAttendanceDto> getParticipantAttendancesByParticipantId(Long participantId) {
        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findByParticipant(new ParticipantModel(participantId));
        if (participantAttendanceModels.isEmpty()) {
            return new ArrayList<>();
        }

        return participantAttendanceModels.stream().map(this::participantAttendanceModelToDto).collect(Collectors.toList());
    }

    @Override
    public InputStreamSource generateQrcode(Long collegeId, Long availableEventId, Long roundId, String group) {
//        System.out.println("in generate qrcode");
//        System.out.println(collegeId);
//        System.out.println(availableEventId);
//        System.out.println(eventId);
//        System.out.println(roundId);

        CollegeModel collegeModel = this.collegeRepository.findById(collegeId).orElseThrow(
                () -> new ResourceNotFoundException("No college exist for id: " + collegeId)
        );
        List<CollegeRepresentativeModel> collegeRepresentativeModels = this.collegeRepresentativeRepository.findByCollege(collegeModel);

        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + availableEventId)
        );

        EventModel eventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElseThrow(
                () -> new ResourceNotFoundException("No event exist for availableEventModel: " + availableEventModel.getId())
        );

        List<RoundModel> roundModels = this.roundRepository.findByAvailableEvent(availableEventModel);
        RoundModel roundModel = roundModels.stream().filter(r -> r.getId().equals(roundId)).findAny().orElseThrow(
                () -> new ResourceNotFoundException("No round exist for id: " + roundId)
        );
        roundModel.setAvailableEvent(availableEventModel);

        List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(eventModel.getId(), collegeId);
        participantModels = participantModels.stream().filter(p -> p.getGroup().equals(group)).collect(Collectors.toList());
        System.out.println(participantModels);


        // Generate qrcode
        String qrData = this.generateRandomAlphanumeric();
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = generateQRCodeImage(qrData, 200, 200);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            e.printStackTrace(); // This logs the exception
            throw new RuntimeException("Failed to generate QR code", e);
        }

        CollegeParticipationModel existingCollegeParticipationModel = new CollegeParticipationModel();
        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        int collegeParticipationIndex = 0;
        for (CollegeParticipationModel collegeParticipationModel: collegeParticipationModels) {
            if (collegeParticipationModel.getCollege().getId().equals(collegeId)) {
                existingCollegeParticipationModel = collegeParticipationModel;
                break;
            }
            collegeParticipationIndex += 1;
        }




//        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findParticipantAttendanceByRoundIdAndCollegeId(roundId, collegeId);

        String teamNumber;
        int countTeam = this.participantAttendanceRepository.countTeam(roundId);

//        if (participantModels.stream().anyMatch(p -> p.getEntryType().equals(EntryType.NORMAL))) {
//            countTeam = (int) participantAttendanceModels.stream().filter(pa -> !pa.getTeamNumber().contains(EntryType.OTSE.name())).count();
//        }
//        else {
//            countTeam = (int) participantAttendanceModels.stream().filter(pa -> pa.getTeamNumber().contains(EntryType.OTSE.name())).count();
//        }


        if (availableEventModel.getCode() != null) {
            teamNumber = availableEventModel.getCode() + "_" + String.format("%02d", (++countTeam));
        }
        else {
            teamNumber = "N/A" + "_" + String.format("%02d", ++countTeam);
        }





        existingCollegeParticipationModel.setTeamNumber(teamNumber);
        this.collegeParticipationRepository.save(existingCollegeParticipationModel);

        for (ParticipantModel participantModel: participantModels) {
            participantModel.setTeamNumber(teamNumber);
            this.participantRepository.save(participantModel);
        }

        // Create the attendance for the participants
        List<ParticipantAttendanceDto> participantAttendanceDtos = this.createAttendance(qrData, participantModels, roundModel, group, teamNumber);

        // Create the pop
        // Format the LocalDateTime to the required format without milliseconds
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a");
        String formattedDateTime = roundModel.getStartTime().format(formatter);

        // 1. Prepare data for the template
        String roundName = roundModel.getRoundType().equals(RoundType.SEMI_FINAL) ? "PRELIMS" : roundModel.getRoundType().name();
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("college", collegeModel.getName());
        templateData.put("eventTitle", availableEventModel.getTitle());
        templateData.put("venueName", roundModel.getVenue());
        templateData.put("dateTime", formattedDateTime);
        templateData.put("roundName", roundName);
        templateData.put("groupNumber", group); // Example
        templateData.put("teamNumber", teamNumber); // Example
        System.out.println("in p-a-s-i" + availableEventModel.getEventMaster());
        System.out.println("in p-a-s-i" + availableEventModel.getEventMasterPhone());
        templateData.put("eventMaster", availableEventModel.getEventMaster()); // Example
        templateData.put("eventMasterPhone", availableEventModel.getEventMasterPhone()); // Example
//        System.out.println("img: " + Base64.getEncoder().encodeToString(qrCodeImage));
        templateData.put("qrcodeImage", "data:image/png;base64," + Base64.getEncoder().encodeToString(qrCodeImage));
        templateData.put("participants", participantModels);

        // Render the HTML template
        String htmlContent = pdfService.renderHtmlTemplate("pop_template", templateData);
        System.out.println("Rendered HTML: " + htmlContent);

//        System.out.println("Rendered HTML: " + htmlContent);
// Or save to a file
        try (FileWriter writer = new FileWriter("output.html")) {
            writer.write(htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
        }


        // Generate the PDF
        byte[] pdfBytes = PdfGenerator.generatePdf(htmlContent);

        System.out.println(pdfBytes);

        // Notify the reps
        for (CollegeRepresentativeModel collegeRepresentativeModel: collegeRepresentativeModels) {
            this.emailServices.sendEventProofEmail(
                    collegeRepresentativeModel.getEmail(),
                    "Confirmed Participation for the event - " + availableEventModel.getTitle(),
                    pdfBytes,
                    "POP_" + teamNumber + ".pdf",
                    availableEventModel,
                    roundModel
            );
        }

        InputStreamSource attachmentSource = new ByteArrayResource(pdfBytes);

        return attachmentSource;
    }

    private String generateRandomAlphanumeric() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(RANDOM_PART_LENGTH);
        boolean isUnique = false;
        do {
            sb.setLength(0);
            for (int i = 0; i < RANDOM_PART_LENGTH; i++) {
                int index = random.nextInt(ALPHANUMERIC_CHARS.length());
                sb.append(ALPHANUMERIC_CHARS.charAt(index));
            }
            if (this.participantAttendanceRepository.findByQrcode(sb.toString()).isEmpty())  {
                isUnique = true;
            }
        } while (!isUnique);

        return sb.toString();
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
    public List<ParticipantAttendanceDto> getAllAttendances() {
        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findAll();
        if (participantAttendanceModels.isEmpty()) {
            return new ArrayList<>();
        }

        return participantAttendanceModels.stream().map(this::participantAttendanceModelToDto).collect(Collectors.toList());
    }

    @Override
    public ScannedQrcodeResponse scanQrcode(String qrData) {
        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findByQrcode(qrData);

        if (participantAttendanceModels.isEmpty()) {
            return null;
        }
        List<ParticipantDto> participantDtos = new ArrayList<>();
        for (ParticipantAttendanceModel participantAttendanceModel: participantAttendanceModels) {
            ParticipantModel participantModel = this.participantRepository.findById(participantAttendanceModel.getParticipant().getId()).orElse(null);
            if (participantModel != null) {
                participantDtos.add(this.participantModelToDto(participantModel));
            }
        }

        RoundModel roundModel = this.roundRepository.findById(participantAttendanceModels.get(0).getRound().getId()).orElseThrow(
                () -> new ResourceNotFoundException("No round exist for id: " + participantAttendanceModels.get(0).getRound().getId())
        );
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(roundModel.getAvailableEvent().getId()).orElseThrow(
                () -> new ResourceNotFoundException("No available_event exist for id: " + roundModel.getAvailableEvent().getId())
        );

        ScannedQrcodeResponse scannedQrcodeResponse = new ScannedQrcodeResponse();
        scannedQrcodeResponse.setAvailableEvent(this.availableEventModelToDto(availableEventModel));
        scannedQrcodeResponse.setRoundId(roundModel.getId());
        scannedQrcodeResponse.setParticipants(participantDtos);

        return scannedQrcodeResponse;
    }


    @Override
    public ParticipantAttendanceDto markAttendance(Long roundId, Long collegeId, Long participantId, boolean status) {
        // Fetch RoundModel and AvailableEventModel
        RoundModel roundModel = this.roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid round_id: " + roundId));

        AvailableEventModel availableEventModel = this.availableEventRepository.findById(roundModel.getAvailableEvent().getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid available_event_id for round: " + roundId));

        // Fetch CollegeParticipationModel
        CollegeParticipationModel collegeParticipationModel = this.collegeParticipationRepository
                .findByCollegeAndAvailableEvent(new CollegeModel(collegeId), availableEventModel)
                .orElseThrow(() -> new IllegalArgumentException("Invalid college_id or available_event_id"));

        // Attempt to find the specific ParticipantAttendanceModel for the given participantId
        Optional<ParticipantAttendanceModel> participantAttendanceOptional = this.participantAttendanceRepository
                .findParticipantAttendanceByRoundIdAndCollegeId(roundId, collegeId)
                .stream()
                .filter(attendance -> attendance.getParticipant().getId().equals(participantId))
                .findFirst();

        ParticipantModel participantModel = this.participantRepository.findById(participantId).orElseThrow(
                () -> new IllegalArgumentException("No participant found for id: " + participantId)
        );
        System.out.println("fetched participantModel:" + participantModel);

        // If the attendance record is found
        if (participantAttendanceOptional.isPresent()) {
            ParticipantAttendanceModel participantAttendanceModel = participantAttendanceOptional.get();
            System.out.println("in db: " + participantAttendanceModel.isPresent());
            participantAttendanceModel.setPresent(status);
            System.out.println("after change: " + participantAttendanceModel.isPresent());
            participantModel.setPresent(participantAttendanceModel.isPresent());



            // Save the updated attendance record
            participantAttendanceModel = this.participantAttendanceRepository.save(participantAttendanceModel);
            System.out.println("in db participant-atte after save:" + participantAttendanceModel);
            participantModel = this.participantRepository.save(participantModel);
            System.out.println("in db participant after save:" + participantModel);


            // Generate the scorecard
            String team = participantModel.getGroup();
            System.out.println("team: " + team);
            List<ScoreCardModel> scoreCardModels = this.scoreCardRepository.findByCollegeParticipationAndRoundAndTeamNumber(collegeParticipationModel, roundModel, team);
            if (scoreCardModels.isEmpty()) {
                ScoreCardDto scoreCardDto = new ScoreCardDto();
                scoreCardDto.setCollegeParticipationId(collegeParticipationModel.getId());
                scoreCardDto.setRoundId(roundModel.getId());
                scoreCardDto.setTeamNumber(team);

                // Initialize score parameters with meaningful values (consider updating them later)
                List<ScoreParameterDto> scoreParameterDtos = new ArrayList<>();
                for (int i = 0; i < 4; i++) {
                    ScoreParameterDto scoreParameterDto = new ScoreParameterDto(null, "", null, null);
                    scoreParameterDtos.add(scoreParameterDto);
                }
                scoreCardDto.setScoreParameters(scoreParameterDtos);
                // Create the scorecard
                this.scoreCardServices.createScoreCard(scoreCardDto);
            }
            else {
                for (ScoreCardModel scoreCardModel: scoreCardModels) {
                    scoreCardModel.setTeamNumber(team);
                    this.scoreCardRepository.save(scoreCardModel);
                }
            }
            // Return the DTO representation of the updated participant attendance
            return this.participantAttendanceModelToDto(participantAttendanceModel);
        }

        // If no attendance record is found for the participant, return null
        return null;
    }

    @Override
    public boolean deleteAttendance(Long id) {
        ParticipantAttendanceDto foundParticipantAttendanceDto = this.getAttendanceById(id);
        this.participantAttendanceRepository.deleteById(id);
        return true;
    }

    private ParticipantAttendanceDto participantAttendanceModelToDto(ParticipantAttendanceModel participantAttendanceModel) {
        if (participantAttendanceModel == null) {
            return null;
        }

        ParticipantAttendanceDto participantAttendanceDto = this.modelMapper.map(participantAttendanceModel, ParticipantAttendanceDto.class);
        participantAttendanceDto.setParticipantId(participantAttendanceModel.getParticipant().getId());
        participantAttendanceDto.setRoundId(participantAttendanceModel.getRound().getId());

        return participantAttendanceDto;
    }

    private ParticipantDto participantModelToDto(ParticipantModel participantModel) {
        if (participantModel == null) {
            return null;
        }
        ParticipantDto participantDto = this.modelMapper.map(participantModel, ParticipantDto.class);
        participantDto.setCollegeId(participantModel.getCollege().getId());
        // participantDto.setEvents(new ArrayList<>());
        participantDto.setEntryType(participantModel.getEntryType());

        // Convert the list of EventModel to a list of event IDs
        List<Long> eventIds = participantModel.getEvents().stream().map(EventModel::getId).collect(Collectors.toList());
        participantDto.setEventIds(eventIds);

        return participantDto;
    }

    private AvailableEventDto availableEventModelToDto(AvailableEventModel availableEventModel) {
        if (availableEventModel == null) {
            return null;
        }
        AvailableEventDto availableEventDto = this.modelMapper.map(availableEventModel, AvailableEventDto.class);
        availableEventDto.setEventCategoryId(availableEventModel.getEventCategory().getId());
        availableEventDto.setEventRules(this.eventRuleServices.getEventRulesByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setRounds(this.roundServices.getRoundsByAvailableEventId(availableEventModel.getId()));
        availableEventDto.setJudges(this.judgeServices.getJudgesByAvailableEventId(availableEventModel.getId()));

        return availableEventDto;
    }

}
