package com.dcfest.services.impl;

import com.dcfest.dtos.ScoreParameterDto;
import com.dcfest.models.ScoreCardModel;
import com.dcfest.models.ScoreParameterModel;
import com.dcfest.repositories.ScoreCardRepository;
import com.dcfest.repositories.ScoreParameterRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScoreParameterServicesImpl implements com.dcfest.services.impl.ScoreParameterServices {

    @Autowired
    private ScoreParameterRepository scoreParameterRepository;

    @Autowired
    private ScoreCardRepository scoreCardRepository;

    @Override
    public ScoreParameterDto createScoreParameter(ScoreParameterDto scoreParameterDto) {
        ScoreParameterModel scoreParameter = new ScoreParameterModel();
        scoreParameter.setName(scoreParameterDto.getName());

        String points = scoreParameterDto.getPoints(); // Get the points from DTO for validation

        // Validate points
        if (points != null && !points.isEmpty() && !points.equalsIgnoreCase("D")) {
            try {
                int numericPoints = Integer.parseInt(points);
                if (numericPoints < 0 || numericPoints > 25) {
                    throw new IllegalArgumentException("Points must be either 'D', empty, or within the range 0-25.");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Points must be either 'D', empty, or a valid number within the range 0-25.");
            }
        }

        // Set points to 'D' if null, empty, or equals "d"
        if (points != null &&( points.isEmpty() || points.equalsIgnoreCase("D"))) {
            scoreParameter.setPoints("D");
        } else {
            scoreParameter.setPoints(points);
        }

        // Associate the scorecard
        scoreParameter.setScoreCard(new ScoreCardModel(scoreParameterDto.getScoreCardId()));

        // Save the entity
        scoreParameter = this.scoreParameterRepository.save(scoreParameter);

        // Map to DTO and return
        return mapToDto(scoreParameter);
    }


    @Override
    public ScoreParameterDto updateScoreParameter(Long id, ScoreParameterDto scoreParameterDto) {
        ScoreParameterModel scoreParameter = this.scoreParameterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Score Parameter not found for id: " + id));

        scoreParameter.setName(scoreParameterDto.getName());
        scoreParameter.setPoints(scoreParameterDto.getPoints());

        scoreParameter = this.scoreParameterRepository.save(scoreParameter);

        return mapToDto(scoreParameter);
    }

    @Override
    public ScoreParameterDto getScoreParameterById(Long id) {
        ScoreParameterModel scoreParameter = this.scoreParameterRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Score Parameter not found for id: " + id)
        );

        return mapToDto(scoreParameter);
    }

    @Override
    public List<ScoreParameterDto> getAllScoreParameters() {
        List<ScoreParameterModel> scoreParameters = this.scoreParameterRepository.findAll();
        return scoreParameters.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<ScoreParameterDto> getScoreParametersByScoreCardId(Long scoreCardId) {
        List<ScoreParameterModel> scoreParameters = this.scoreParameterRepository.findByScoreCard(new ScoreCardModel(scoreCardId));
        return scoreParameters.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public boolean deleteScoreParameter(Long id) {
        ScoreParameterModel scoreParameter = this.scoreParameterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Score Parameter not found for id: " + id));
        this.scoreParameterRepository.delete(scoreParameter);

        return true;
    }

    private ScoreParameterDto mapToDto(ScoreParameterModel scoreParameter) {
        ScoreParameterDto dto = new ScoreParameterDto();
        dto.setId(scoreParameter.getId());
        dto.setName(scoreParameter.getName());
        dto.setPoints(scoreParameter.getPoints());
        dto.setScoreCardId(scoreParameter.getScoreCard().getId());
        return dto;
    }
}
