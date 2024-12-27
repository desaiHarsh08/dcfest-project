package com.dcfest.services.impl;

import com.dcfest.constants.RoundType;
import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.dtos.PromotedRoundDto;
import com.dcfest.dtos.ScoreCardDto;
import com.dcfest.dtos.ScoreParameterDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.*;
import com.dcfest.repositories.*;

import com.dcfest.services.ScoreCardServices;
import com.dcfest.utils.PdfGenerator;
import com.dcfest.utils.PdfService;
import com.dcfest.utils.ScoreCardTeamDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScoreCardServicesImpl implements ScoreCardServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private ScoreParameterRepository scoreParameterRepository;

    @Autowired
    private PromotedRoundRepository promotedRoundRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private ScoreCardRepository scoreCardRepository;

    @Autowired
    private com.dcfest.services.impl.ScoreParameterServices scoreParameterServices;

    @Autowired
    private CollegeParticipationRepository collegeParticipationRepository;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantAttendanceRepository participantAttendanceRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventCategoryRepository eventCategoryRepository;

    @Override
    public List<ScoreCardDto> getScoresForCollegeParticipations(Long availableEventId, Long roundId) {
        RoundModel roundModel = this.roundRepository.findById(roundId).orElseThrow(
                () -> new IllegalArgumentException("Please provide a valid round_id")
        );
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new IllegalArgumentException("Please provide a valid available_event_id")
        );

        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        if (collegeParticipationModels.isEmpty()) {
            return new ArrayList<>();
        }
        List<ScoreCardDto> scoreCardDtos = new ArrayList<>();

        List<CollegeParticipationModel> filteredCollegeParticipations = new ArrayList<>();
        for (CollegeParticipationModel collegeParticipationModel:collegeParticipationModels) {
            List<ScoreCardModel> scoreCardModels = this.scoreCardRepository.findByCollegeParticipationAndRound(collegeParticipationModel, roundModel);
            if (scoreCardModels == null) {
                continue;
            }
            for (ScoreCardModel scoreCardModel: scoreCardModels) {
                scoreCardDtos.add(this.mapToDto(scoreCardModel));
            }
        }
        System.out.println("finished, filteredCollegeParticipations: " + filteredCollegeParticipations.size());

        return scoreCardDtos;
    }

    @Override
    public List<ScoreCardDto> getScoreCardsByRoundId(Long roundId) {
        List<ScoreCardModel> scoreCardModels = this.scoreCardRepository.findByRound(new RoundModel(roundId));
        if (scoreCardModels.isEmpty()) {
            return new ArrayList<>();
        }

        return scoreCardModels.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ScoreCardDto createScoreCard(ScoreCardDto scoreCardDto) {
        if (scoreCardDto.getTeamNumber() == null) {
            throw new IllegalArgumentException("Unable to create score card");
        }
        ScoreCardModel scoreCard = new ScoreCardModel(
                null,
                new CollegeParticipationModel(scoreCardDto.getCollegeParticipationId()),
                new RoundModel(scoreCardDto.getRoundId()),
                scoreCardDto.getTeamNumber(),
                null,
                null,
                scoreCardDto.getSlot(),
                null
        );

        scoreCard = scoreCardRepository.save(scoreCard);

        for (ScoreParameterDto scoreParameterDto: scoreCardDto.getScoreParameters()) {
            scoreParameterDto.setScoreCardId(scoreCard.getId());
            this.scoreParameterServices.createScoreParameter(scoreParameterDto);
        }

        return mapToDto(scoreCard);
    }

    private CollegeParticipationDto collegeParticipationModelToDto(
            CollegeParticipationModel collegeParticipationModel) {
        if (collegeParticipationModel == null) {
            return null;
        }
        CollegeParticipationDto collegeParticipationDto = this.modelMapper.map(collegeParticipationModel,
                CollegeParticipationDto.class);
        collegeParticipationDto.setCollegeId(collegeParticipationModel.getCollege().getId());
        collegeParticipationDto.setAvailableEventId(collegeParticipationModel.getAvailableEvent().getId());

        return collegeParticipationDto;
    }


    public InputStreamSource getScoreCardSheet(Long availableEventId, Long roundId) {
        RoundModel roundModel = this.roundRepository.findById(roundId).orElseThrow(
                () -> new IllegalArgumentException("Please provide a valid round_id")
        );
        AvailableEventModel availableEventModel = this.availableEventRepository.findById(availableEventId).orElseThrow(
                () -> new IllegalArgumentException("Please provide a valid available_event_id")
        );
        EventModel eventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElseThrow(
                () -> new ResourceNotFoundException("Please provide the valid event")
        );

        List<CollegeParticipationModel> collegeParticipationModels = this.collegeParticipationRepository.findByAvailableEvent(availableEventModel);
        if (collegeParticipationModels.isEmpty()) {
            return null;
        }
        List<ScoreCardTeamDto> scoreCardTeamDtos = new ArrayList<>();
        for (CollegeParticipationModel collegeParticipationModel:collegeParticipationModels) {
            List<ParticipantAttendanceModel> participantAttendanceModels = this.participantAttendanceRepository.findParticipantAttendanceByRoundIdAndCollegeId(roundId, collegeParticipationModel.getCollege().getId());
            if (participantAttendanceModels.isEmpty()) {
                continue;
            }
            List<ParticipantModel> participantModels = this.participantRepository.findByEvent_IdAndCollegeId(eventModel.getId(), collegeParticipationModel.getCollege().getId());
            List<String> groups = new ArrayList<>();
            for (ParticipantModel participantModel: participantModels) {
                if (groups.contains(participantModel.getGroup())) {
                    continue;
                }
                groups.add(participantModel.getGroup());
            }

            System.out.println(groups);

            List<ScoreCardDto> scoreCardDtos = this.getScoreCardByCollegeParticipationIdAndRoundId(collegeParticipationModel.getId(), roundId);
            scoreCardDtos = this.sortScoreCardsBySlot(scoreCardDtos);
            System.out.println(scoreCardDtos.size());
            for (ScoreCardDto scoreCardDto: scoreCardDtos) {
                ScoreCardTeamDto scoreCardTeamDto = new ScoreCardTeamDto();
                scoreCardTeamDto.setParam1(scoreCardDto.getScoreParameters().get(0).getName());
                scoreCardTeamDto.setParam2(scoreCardDto.getScoreParameters().get(1).getName());
                scoreCardTeamDto.setParam3(scoreCardDto.getScoreParameters().get(2).getName());
                scoreCardTeamDto.setParam4(scoreCardDto.getScoreParameters().get(3).getName());


                scoreCardTeamDto.setP1(scoreCardDto.getScoreParameters().get(0).getPoints());
                scoreCardTeamDto.setP2(scoreCardDto.getScoreParameters().get(1).getPoints());
                scoreCardTeamDto.setP3(scoreCardDto.getScoreParameters().get(2).getPoints());
                scoreCardTeamDto.setP4(scoreCardDto.getScoreParameters().get(3).getPoints());

                int p1 = 0, p2 = 0, p3 = 0, p4 = 0;
                if (scoreCardTeamDto.getP1() != null && !scoreCardTeamDto.getP1().equals("D")) {
                    p1 = Integer.parseInt(scoreCardTeamDto.getP1());
                }
                if (scoreCardTeamDto.getP2() != null && !scoreCardTeamDto.getP2().equals("D")) {
                    p2 = Integer.parseInt(scoreCardTeamDto.getP2());
                }
                if (scoreCardTeamDto.getP3() != null && !scoreCardTeamDto.getP3().equals("D")) {
                    p3 = Integer.parseInt(scoreCardTeamDto.getP3());
                }
                if (scoreCardTeamDto.getP4() != null && !scoreCardTeamDto.getP4().equals("D")) {
                    p4 = Integer.parseInt(scoreCardTeamDto.getP4());
                }

                int total = p1 + p2 + p3 + p4;

                scoreCardTeamDto.setTotalPoints(String.valueOf(total == 0 ? "" : total));
                scoreCardTeamDto.setRank("");

                List<ParticipantModel> tmpParticipants = participantModels.stream().filter(p -> p.getCollege().getId().equals(collegeParticipationModel.getCollege().getId())).collect(Collectors.toList());

                scoreCardTeamDto.setTeamNumber(scoreCardDto.getTeamNumber());

                scoreCardTeamDtos.add(scoreCardTeamDto);
            }


        }



        EventCategoryModel eventCategoryModel = this.eventCategoryRepository.findById(availableEventModel.getEventCategory().getId()).orElseThrow(
                () -> new IllegalArgumentException("Unable to find category: " + availableEventModel.getEventCategory().getId())
        );

        // Format the LocalDateTime to the required format without milliseconds
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a");
        String formattedDateTime = roundModel.getStartTime().format(formatter);


        Map<String, Object> templateData = new HashMap<>();
        templateData.put("categoryName", eventCategoryModel.getName());
        templateData.put("eventTitle", availableEventModel.getTitle());
        templateData.put("venue", roundModel.getVenue());
        templateData.put("eventDate", formattedDateTime);

        if (scoreCardTeamDtos.size() > 0) {
            templateData.put("param1", scoreCardTeamDtos.get(0).getParam1());
            templateData.put("param2", scoreCardTeamDtos.get(0).getParam2());
            templateData.put("param3", scoreCardTeamDtos.get(0).getParam3());
            templateData.put("param4", scoreCardTeamDtos.get(0).getParam4());
        }

        templateData.put("teams", scoreCardTeamDtos);

        // Render the HTML template
        String htmlContent = pdfService.renderHtmlTemplate("score_sheet_template", templateData);


        // Generate the PDF
        byte[] pdfBytes = PdfGenerator.generatePdf(htmlContent);


        return new ByteArrayResource(pdfBytes);
    }

    public List<ScoreCardDto> sortScoreCardsBySlot(List<ScoreCardDto> scoreCards) {
        // Sort the list based on the slot field in ascending order
        Collections.sort(scoreCards, Comparator.comparing(ScoreCardDto::getSlot));
        return scoreCards;
    }

    public List<ScoreCardDto> getScoreCardByCollegeParticipationIdAndRoundId(Long collegeParticipationId, Long roundId) {
        List<ScoreCardModel> scoreCardModels = this.scoreCardRepository.findByCollegeParticipationAndRound(new CollegeParticipationModel(collegeParticipationId), new RoundModel(roundId));
        if (scoreCardModels.isEmpty()) {
            return new ArrayList<>();
        }
        return scoreCardModels.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ScoreCardDto updateScoreCard(Long id, ScoreCardDto scoreCardDto) {
        ScoreCardModel scoreCard = scoreCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ScoreCard not found for id: " + id));

        // Update the fields
        if (scoreCardDto.getPromotedRoundId() != null) {
            scoreCard.setPromotedRound(new RoundModel(scoreCardDto.getPromotedRoundId()));
        }
        scoreCard.setRank(scoreCardDto.getRank());
        scoreCard.setSlot(scoreCardDto.getSlot());

        // Save the changes
        scoreCard = scoreCardRepository.save(scoreCard);

        // Update the score_parameters
        for (ScoreParameterDto scoreParameterDto: scoreCardDto.getScoreParameters()) {
            this.scoreParameterServices.updateScoreParameter(scoreParameterDto.getId(), scoreParameterDto);
        }

        return mapToDto(scoreCard);
    }

    @Override
    public ScoreCardDto getScoreCardById(Long id) {
        ScoreCardModel scoreCard = scoreCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ScoreCard not found for id: " + id));
        return mapToDto(scoreCard);
    }

    @Override
    public List<ScoreCardDto> getAllScoreCards() {
        List<ScoreCardModel> scoreCards = scoreCardRepository.findAll();
        return scoreCards.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public boolean deleteScoreCard(Long id) {
        ScoreCardDto foundScoreCard = this.getScoreCardById(id);
        // Delete all the score-parameters
        for (ScoreParameterDto scoreParameterDto: foundScoreCard.getScoreParameters()) {
            if (!this.scoreParameterServices.deleteScoreParameter(scoreParameterDto.getId())) {
                throw new IllegalArgumentException("unable to delete the score_parameter for id: " + scoreParameterDto.getId());
            }
        }

        // Delete the scorecard
        this.scoreCardRepository.deleteById(id);

        return true;
    }

    @Override
    public ScoreCardDto getScoreCardByTeamNumberAndRoundId(String teamNumber, Long roundId) {
        ScoreCardModel scoreCardModel = this.scoreCardRepository.findByTeamNumberAndRound(teamNumber, new RoundModel(roundId)).orElse(null);
        System.out.println(scoreCardModel);
        return this.mapToDto(scoreCardModel);
    }

    @Override
    public ScoreCardDto handlePromoteTeam(ScoreCardDto scoreCardDto) {

        ScoreCardModel scoreCardModel = this.scoreCardRepository.findById(scoreCardDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No scorecard exist for id: " + scoreCardDto.getId())
        );
        CollegeParticipationModel collegeParticipationModel = this.collegeParticipationRepository.findById(scoreCardModel.getCollegeParticipation().getId()).orElseThrow(
                () -> new ResourceNotFoundException("No collegeParticipation exist for id: " + scoreCardModel.getCollegeParticipation())
        );
        scoreCardModel.setCollegeParticipation(collegeParticipationModel);
        CollegeModel collegeModel = this.collegeRepository.findById(collegeParticipationModel.getCollege().getId()).orElseThrow(
                () -> new ResourceNotFoundException("No college exist for id: " + collegeParticipationModel.getCollege().getId())
        );

        RoundModel roundModel;
        if (scoreCardDto.getPromotedRoundId() == null) {
            roundModel = this.roundRepository.findById(scoreCardModel.getRound().getId()).orElse(null);
            System.out.println("in promoted round id is null, roundModel: " + roundModel);
        }
        else {
            roundModel = this.roundRepository.findById(scoreCardDto.getPromotedRoundId()).orElse(null);
        }

        AvailableEventModel availableEventModel = this.availableEventRepository.findById(roundModel.getAvailableEvent().getId()).orElseThrow(
                () -> new IllegalArgumentException("Unable to load the available_event")
        );
        EventModel eventModel = this.eventRepository.findByAvailableEvent(availableEventModel).orElseThrow(
                () -> new IllegalArgumentException("Unable to load the event")
        );
        List<ParticipantModel> participantModels =  this.participantRepository.findByEvent_IdAndCollegeIdAndGroup(
                eventModel.getId(),
                collegeParticipationModel.getCollege().getId(),
                scoreCardModel.getTeamNumber()
        );
        System.out.println(scoreCardModel.getTeamNumber());
        for (ParticipantModel participantModel: participantModels) {
            if (scoreCardDto.getPromotedRoundId() != null) {
                if (this.promotedRoundRepository.findByParticipantAndRound(participantModel, roundModel).isPresent()) {
                    continue;
                }
                PromotedRoundModel promotedRoundModel = new PromotedRoundModel();
                promotedRoundModel.setParticipant(participantModel);
                promotedRoundModel.setRound(roundModel);

                System.out.println(promotedRoundModel);

                this.promotedRoundRepository.save(promotedRoundModel);
            }
            else {
                PromotedRoundModel existingPromotedRoundModel = this.promotedRoundRepository.findByParticipantAndRound(participantModel, roundModel).orElse(null);
                if (existingPromotedRoundModel != null) {
                    this.promotedRoundRepository.delete(existingPromotedRoundModel);
                }
            }

        }
        System.out.println("loop completed");

        if (scoreCardModel.getTeamNumber() == null) {
            throw new IllegalArgumentException("Invalid team");
        }

        if (scoreCardModel.getPoints() == null) {
            System.out.println("in if of points");
            Integer totalPoints = 0;
            // If Normal team, add points: 2
            if (!scoreCardModel.getTeamNumber().contains(collegeModel.getIcCode() + "_OTSE")) {
                totalPoints += 2;
            }

            if (scoreCardDto.getRank() != null) {
                switch (scoreCardDto.getRank()) {
                    case 1:
                        totalPoints += 20;
                        break;
                    case 2:
                        totalPoints += 15;
                        break;
                    case 3:
                        totalPoints += 10;
                }

                scoreCardModel.setRank(scoreCardDto.getRank());
            }
            else {
                scoreCardModel.setRank(null);
            }

            if (collegeModel.getPoints() == null) {
                collegeModel.setPoints(Long.valueOf(totalPoints));
            }
            else {
                collegeModel.setPoints(collegeModel.getPoints() + Long.valueOf(totalPoints));
            }
            collegeModel.setPoints(Long.valueOf(totalPoints));
            scoreCardModel.setPoints(totalPoints);

            System.out.println("totalPoints: " + totalPoints);
            System.out.println("points: " + scoreCardModel.getPoints());
        }




        scoreCardModel.setTeamNumber(participantModels.get(0).getGroup());
        if (scoreCardDto.getPromotedRoundId() != null) {
            scoreCardModel.setPromotedRound(roundModel);
        }

        this.scoreCardRepository.save(scoreCardModel);

        this.collegeRepository.save(collegeModel);

        return this.mapToDto(scoreCardModel);
    }

    private ScoreCardDto mapToDto(ScoreCardModel scoreCard) {
        if (scoreCard == null) {
            return null;
        }

        ScoreCardDto dto = new ScoreCardDto();

        dto.setId(scoreCard.getId());
        dto.setCollegeParticipationId(scoreCard.getCollegeParticipation().getId());
        dto.setRoundId(scoreCard.getRound().getId());
        dto.setTeamNumber(scoreCard.getTeamNumber());
        dto.setScoreParameters(this.scoreParameterServices.getScoreParametersByScoreCardId(scoreCard.getId()));
        if (scoreCard.getPromotedRound() != null) {
            dto.setPromotedRoundId(scoreCard.getPromotedRound().getId());
        }
        dto.setRank(scoreCard.getRank());
        dto.setSlot(scoreCard.getSlot());
        dto.setPoints(scoreCard.getPoints());

        return dto;
    }

}
