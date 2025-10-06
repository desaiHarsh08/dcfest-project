package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.JudgeDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.JudgeModel;
import com.dcfest.repositories.JudgeRepository;
import com.dcfest.services.JudgeServices;

@Service
public class JudgeServicesImpl implements JudgeServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private JudgeRepository judgeRepository;

    @Override
    public JudgeDto createJudge(JudgeDto judgeDto) {
        // Create the judge
        JudgeModel judgeModel = new JudgeModel(
                null,
                judgeDto.getName(),
                judgeDto.getPhone(),
                new AvailableEventModel(judgeDto.getAvailableEventId()));
        // Save the judge
        judgeModel = this.judgeRepository.save(judgeModel);

        return this.judgeModelToDto(judgeModel);
    }

    @Override
    public List<JudgeDto> getAllJudges() {
        List<JudgeModel> judgeModels = this.judgeRepository.findAll();
        if (judgeModels.isEmpty()) {
            return new ArrayList<>();
        }

        return judgeModels.stream().map(this::judgeModelToDto).collect(Collectors.toList());
    }

    @Override
    public List<JudgeDto> getJudgesByAvailableEventId(Long availableEventId) {
        List<JudgeModel> judgeModels = this.judgeRepository
                .findByAvailableEvent(new AvailableEventModel(availableEventId));
        if (judgeModels.isEmpty()) {
            return new ArrayList<>();
        }

        return judgeModels.stream().map(this::judgeModelToDto).collect(Collectors.toList());
    }

    @Override
    public JudgeDto getJudgeById(Long id) {
        JudgeModel foundJudgeModel = this.judgeRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `JUDGE` exist for id: " + id));

        return this.judgeModelToDto(foundJudgeModel);
    }

    @Override
    public JudgeDto updateJudge(JudgeDto judgeDto) {
        JudgeModel foundJudgeModel = this.judgeRepository.findById(judgeDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No judge exist for id: " + judgeDto.getId()));
        foundJudgeModel.setName(judgeDto.getName());
        foundJudgeModel.setPhone(judgeDto.getPhone());

        foundJudgeModel = this.judgeRepository.save(foundJudgeModel);

        return this.judgeModelToDto(foundJudgeModel);
    }

    @Override
    public boolean deleteJudge(Long id) {
        this.getJudgeById(id);
        this.judgeRepository.deleteById(id);

        return true;
    }

    private JudgeDto judgeModelToDto(JudgeModel judgeModel) {
        if (judgeModel == null) {
            return null;
        }
        JudgeDto judgeDto = this.modelMapper.map(judgeModel, JudgeDto.class);
        judgeDto.setAvailableEventId(judgeModel.getAvailableEvent().getId());

        return judgeDto;
    }

}
