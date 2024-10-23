package com.dcfest.services.impl;

import java.util.List;
import java.util.ArrayList;
import java.util.Collection;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.CollegeDto;
import com.dcfest.dtos.CollegeParticipationDto;
import com.dcfest.dtos.ParticipantDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.CollegeParticipationModel;
import com.dcfest.models.ParticipantModel;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.CollegeRepository;
import com.dcfest.repositories.ParticipantRepository;
import com.dcfest.repositories.UserRepository;
import com.dcfest.services.CollegeParticipationService;
import com.dcfest.services.CollegeServices;
import com.dcfest.services.ParticipantServices;
import com.dcfest.utils.PageResponse;

@Service
public class CollegeServicesImpl implements CollegeServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ParticipantServices participantServices;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private CollegeParticipationService collegeParticipationService;

    @Override
    public CollegeDto createCollege(CollegeDto collegeDto) {
        // Create the college
        CollegeModel collegeModel = this.modelMapper.map(collegeDto, CollegeModel.class);
        // Encrypt the raw password
        collegeModel.setPassword(this.bCryptPasswordEncoder.encode(collegeDto.getPassword()));
        // Save the college
        collegeModel = this.collegeRepository.save(collegeModel);
        // TODO: Notify the college
        String subject = "Confirmation of Participation for Umang DCFest 2024";
        String body = getMailBody(collegeDto); // Generate the mail body

        // Send email to the college
        if (collegeDto.getEmail() != null) {
            this.emailServices.sendSimpleMessage(collegeDto.getEmail(), subject, body);
        }

        return this.collegeModelToDto(collegeModel);
    }

    private String getMailBody(CollegeDto collegeDto) {
        // Generate a customized email body
        return "Dear " + collegeDto.getName() + ",\n\n" +
                "We are pleased to inform you that your participation in the Umang DCFest 2024 has been successfully registered. "
                +
                "We look forward to seeing you at the event.\n\n" +
                "If you have any questions, feel free to reach out to us.\n\n" +
                "Best regards,\nThe Umang DCFest Team";
    }

    @Override
    public List<CollegeDto> getAllColleges() {
        List<CollegeModel> collegeModels = this.collegeRepository.findAll();

        if (collegeModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeModels.stream().map(this::collegeModelToDto).collect(Collectors.toList());
    }

    @Override
    public CollegeDto getCollegeById(Long id) {
        CollegeModel foundCollege = this.collegeRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `COLLEGE` exist for id: " + id));

        return this.collegeModelToDto(foundCollege);
    }

    @Override
    public CollegeDto getCollegeByEmail(String email) {
        CollegeModel foundCollege = this.collegeRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("No `COLLEGE` exist for email: " + email));

        return this.collegeModelToDto(foundCollege);
    }

    @Override
    public CollegeDto getCollegeByName(String name) {
        CollegeModel foundCollege = this.collegeRepository.findByName(name).orElseThrow(
                () -> new ResourceNotFoundException("No `COLLEGE` exist for name: " + name));

        return this.collegeModelToDto(foundCollege);
    }

    @Override
    public CollegeDto getCollegeByIcCode(String icCode) {
        CollegeModel foundCollege = this.collegeRepository.findByIcCode(icCode).orElseThrow(
                () -> new ResourceNotFoundException("No `COLLEGE` exist for iccode: " + icCode));

        return this.collegeModelToDto(foundCollege);
    }

    @Override
    public List<CollegeDto> getCollegeRankings() {
        List<CollegeModel> collegeModels = this.collegeRepository.findAllOrderByPointsDesc();

        if (collegeModels.isEmpty()) {
            return new ArrayList<>();
        }

        return collegeModels.stream().map(this::collegeModelToDto).collect(Collectors.toList());
    }

    @Override
    public CollegeDto updateCollege(CollegeDto collegeDto) {
        CollegeModel foundCollege = this.collegeRepository.findById(collegeDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No `COLLEGE` exist for id: " + collegeDto.getId()));
        // Update the fields
        foundCollege.setDetailsUploaded(true);
        foundCollege.setName(collegeDto.getName());
        foundCollege.setEmail(collegeDto.getEmail());
        foundCollege.setIcCode(collegeDto.getIcCode());
        foundCollege.setPhone(collegeDto.getPhone());
        foundCollege.setPoints(collegeDto.getPoints());
        // Save the changes
        foundCollege = this.collegeRepository.save(foundCollege);

        return this.collegeModelToDto(foundCollege);
    }

    @Override
    public boolean deleteCollege(Long id) {
        this.getCollegeById(id);
        // Delete the participants
        PageResponse<ParticipantDto> participantDtoResponse = this.participantServices.getParticipantByCollegeId(1, id);
        this.deleteParticipants(participantDtoResponse.getContent());
        int totalPages = participantDtoResponse.getTotalPages();
        for (int i = 2; i <= totalPages; i++) {
            participantDtoResponse = this.participantServices.getParticipantByCollegeId(i, id);
            this.deleteParticipants(participantDtoResponse.getContent());
        }
        // Delete the colleges participated
        List<CollegeParticipationDto> collegeParticipationDtos = this.collegeParticipationService.getByCollege(id);
        for (CollegeParticipationDto collegeParticipationDto : collegeParticipationDtos) {
            this.collegeParticipationService.deleteParticipation(collegeParticipationDto.getId());
        }
        // Delete the users
        this.userRepository.deleteByCollegeId(id);

        this.collegeRepository.deleteById(id);

        return true;
    }

    private void deleteParticipants(Collection<ParticipantDto> collection) {
        for (ParticipantDto participantDto : collection) {
            this.participantServices.deleteParticipant(participantDto.getId());
        }
    }

    private CollegeDto collegeModelToDto(CollegeModel collegeModel) {
        if (collegeModel == null) {
            return null;
        }
        CollegeDto collegeDto = this.modelMapper.map(collegeModel, CollegeDto.class);
        collegeDto.setParticipations(this.collegeParticipationService.getByCollege(collegeModel.getId()));

        return collegeDto;
    }

}
