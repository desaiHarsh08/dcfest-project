package com.dcfest.services.impl;

import com.dcfest.constants.RoundType;
import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.dtos.ParticipantDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.*;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.*;
import com.dcfest.services.ParticipantAttendanceServices;
import com.dcfest.utils.PdfGenerator;
import com.dcfest.utils.PdfService;
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
    private CollegeParticipationRepository collegeParticipationRepository;

    @Override
    public List<ParticipantAttendanceDto> createAttendance(String qrcodeData, List<ParticipantModel> participantModels, RoundModel roundModel) {
        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findParticipantAttendanceByRoundIdAndCollegeId(roundModel.getId(), participantModels.get(0).getCollege().getId());
        if (participantAttendanceModels.isEmpty()) {
            for (ParticipantModel participantModel: participantModels) {
                ParticipantAttendanceModel attendanceModel = new ParticipantAttendanceModel(
                        null,
                        participantModel,
                        qrcodeData,
                        false,
                        roundModel
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
    public InputStreamSource getPop(Long roundId, Long collegeId, Long availableEventId) {
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


        List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findParticipantAttendanceByRoundIdAndCollegeId(
                roundId, collegeId
        );

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

        String groupNumber = participantModels.get(0).getGroup();
        String teamNumber = participantModels.get(0).getTeamNumber();

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
        templateData.put("groupNumber", groupNumber); // Example
        templateData.put("teamNumber", teamNumber); // Example
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
    public InputStreamSource generateQrcode(Long collegeId, Long availableEventId, Long roundId) {
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

        // Create the attendance for the participants
        List<ParticipantAttendanceDto> participantAttendanceDtos = this.createAttendance(qrData, participantModels, roundModel);


        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        int collegeParticipationIndex = 0;
        for (CollegeParticipationModel collegeParticipationModel: collegeParticipationModels) {
            if (collegeParticipationModel.getCollege().getId().equals(collegeId)) {
                break;
            }
            collegeParticipationIndex += 1;
        }

        int countTeam = this.participantAttendanceRepository.countTeam(roundId);

        String groupNumber = collegeModel.getIcCode() + "_" + String.format("%03d", collegeParticipationIndex + 1);
        String teamNumber;
        if (availableEventModel.getCode() != null) {
            teamNumber = availableEventModel.getCode() + "_" + String.format("%03d", countTeam);
        }
        else {
            teamNumber = "N/A" + "_" + String.format("%03d", countTeam);
        }


        for (ParticipantModel participantModel: participantModels) {
            participantModel.setTeamNumber(teamNumber);
            participantModel.setGroup(groupNumber);
            this.participantRepository.save(participantModel);
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
        templateData.put("groupNumber", groupNumber); // Example
        templateData.put("teamNumber", teamNumber); // Example
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

        for (int i = 0; i < RANDOM_PART_LENGTH; i++) {
            int index = random.nextInt(ALPHANUMERIC_CHARS.length());
            sb.append(ALPHANUMERIC_CHARS.charAt(index));
        }

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
    public ParticipantAttendanceDto updateAttendance(ParticipantAttendanceDto participantAttendanceDto) {
        ParticipantAttendanceModel foundParticipantAttendanceModel = this.participantAttendanceRepository.findById(participantAttendanceDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No attendance found for id: " + participantAttendanceDto.getId())
        );

        foundParticipantAttendanceModel.setPresent(participantAttendanceDto.isPresent());

        return null;
    }

    // TODO
    @Override
    public boolean deleteAttendance(Long id) {
        return false;
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
}
