package com.dcfest.services.impl;

import java.util.List;
import java.util.ArrayList;
import java.util.Collection;
import java.util.stream.Collectors;

import com.dcfest.dtos.*;
import com.dcfest.models.*;
import com.dcfest.services.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.CollegeRepository;
import com.dcfest.repositories.ParticipantRepository;
import com.dcfest.repositories.UserRepository;
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
    private UserServices userServices;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private CollegeParticipationService collegeParticipationService;

    @Autowired
    private CollegeRepresentativeService collegeRepresentativeService;

    @Override
    public CollegeDto createCollege(CollegeDto collegeDto) {
        // Create the college
        CollegeModel collegeModel = this.modelMapper.map(collegeDto, CollegeModel.class);
        // Encrypt the raw password
        collegeModel.setPassword(this.bCryptPasswordEncoder.encode(collegeDto.getPassword()));
        // Save the college
        collegeModel = this.collegeRepository.save(collegeModel);
        // Create the college representative
        for (CollegeRepresentativeDto collegeRepresentativeDto: collegeDto.getRepresentatives()) {
            collegeRepresentativeDto.setCollegeId(collegeModel.getId());
            this.collegeRepresentativeService.createRepresentative(collegeRepresentativeDto);
        }

        // Send email to the college
        if (collegeDto.getEmail() != null) {
            this.emailServices.sendCollegeRegistrationEmail(collegeDto.getEmail(), collegeDto.getName());
        }

        return this.collegeModelToDto(collegeModel);
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
    public CollegeDto resetCollegePassword(CollegeDto collegeDto) {
        CollegeModel foundCollegeModel = this.collegeRepository.findById(collegeDto.getId()).orElseThrow(
            () -> new ResourceNotFoundException("No `COLLEGE` exist for id: " + collegeDto.getId())
        );
        // Encrypt the raw password
        String encryptedPassword = this.bCryptPasswordEncoder.encode(collegeDto.getPassword());
        // Update the password
        foundCollegeModel.setPassword(encryptedPassword);
        // Save the changes
        foundCollegeModel = this.collegeRepository.save(foundCollegeModel);

        // Notify the college and their representative
        List<CollegeRepresentativeModel> collegeRepresentativeModels = new ArrayList<>();
        for (CollegeRepresentativeModel collegeRepresentativeModel: collegeRepresentativeModels) {
            this.emailServices.sendResetPasswordEmail(
                    collegeRepresentativeModel.getEmail(),
                    collegeRepresentativeModel.getName(),
                    foundCollegeModel.getIcCode(),
                    collegeDto.getPassword(),
                    foundCollegeModel.getName()
            );
        }
        // Notify the college
        String collegeEmail = foundCollegeModel.getEmail();
        if (!collegeRepresentativeModels.stream().anyMatch(c -> c.getEmail().equalsIgnoreCase(collegeEmail))) {
            this.emailServices.sendResetPasswordEmail(
                    collegeEmail,
                    foundCollegeModel.getName(),
                    foundCollegeModel.getIcCode(),
                    collegeDto.getPassword(),
                    foundCollegeModel.getName()
            );
        }


        return this.collegeModelToDto(foundCollegeModel);
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
        // Delete the representative
        List<CollegeRepresentativeDto> collegeRepresentativeDtos = this.collegeRepresentativeService.getRepresentativesByCollege(id);
        for (CollegeRepresentativeDto collegeRepresentativeDto: collegeRepresentativeDtos) {
            this.collegeRepresentativeService.deleteRepresentative(collegeRepresentativeDto.getId());
        }

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
        collegeDto.setRepresentatives(this.collegeRepresentativeService.getRepresentativesByCollege(collegeModel.getId()));

        return collegeDto;
    }

}
