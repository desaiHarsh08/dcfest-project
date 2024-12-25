package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dcfest.constants.UserType;
import com.dcfest.dtos.UserDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.UserModel;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.UserRepository;
import com.dcfest.services.UserServices;
import com.dcfest.utils.PageResponse;

@Service
public class UserServicesImpl implements UserServices {

    private static final int PAGE_SIZE = 100;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public UserDto creatUser(UserDto userDto) {
        CollegeModel collegeModel = new CollegeModel();

        // Create the user
        UserModel userModel = this.modelMapper.map(userDto, UserModel.class);
        // Encrypt the raw password
        userModel.setPassword(this.bCryptPasswordEncoder.encode(userDto.getPassword()));
        // Save the user
        userModel = this.userRepository.save(userModel);

        // Get the college name
        String collegeName = (collegeModel != null && collegeModel.getName() != null) ? collegeModel.getName()
                : "Your College";

        // Handle email based on user type
        String subject = "Welcome to Umang DCFest 2024!";
        String body = "Dear " + userModel.getName() + ",\n\nThank you for registering with us.";

        if (userModel.getType().equals(UserType.REGISTRATION_DESK.name())) {
            subject = "You Are Now Part of the Registration Desk for Umang DCFest 2024!";
            body = "Dear " + userModel.getName() + ",\n\n" +
                    "We are pleased to inform you that you are now part of the Registration Desk team for Umang DCFest 2024.\n\n"
                    +
                    "As a Registration Desk representative, you will be responsible for assisting in the participant registrations, handling queries, and ensuring smooth registration processes.\n\n"
                    +
                    "Thank you for your contribution to the event! We look forward to working with you.\n\nBest regards,\nThe Umang DCFest Team";
        } else if (userModel.getType().equals(UserType.COLLEGE_REPRESENTATIVE.name())) {
            subject = "You Are Now a College Representative for Umang DCFest 2024!";
            body = "Dear " + userModel.getName() + ",\n\n" +
                    "We are pleased to inform you that you have been appointed as the College Representative for Umang DCFest 2024 from "
                    + collegeName + ".\n\n" +
                    "As a College Representative, you will act as the liaison between " + collegeName
                    + " and the event, ensuring that your college's participants are well-informed and supported.\n\n" +
                    "Thank you for taking up this important role, and we look forward to working with you during the event.\n\nBest regards,\nThe Umang DCFest Team";
        }

        // Send the email
        this.emailServices.sendSimpleMessage(userModel.getEmail(), subject, body);

        return this.userModelToDto(userModel);
    }

    @Override
    public PageResponse<UserDto> getAllUsers(int pageNumber) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<UserModel> pageUser = this.userRepository.findAll(pageable);

        List<UserModel> userModels = pageUser.getContent();

        List<UserDto> userDtos = userModels.stream().map(this::userModelToDto).collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageUser.getTotalPages(),
                pageUser.getTotalElements(),
                userDtos);

    }

    @Override
    public PageResponse<UserDto> getUsersByType(int pageNumber, String type) {
        if (pageNumber < 1) {
            throw new IllegalArgumentException("Page no. should always be greater than 0.");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, PAGE_SIZE);

        Page<UserModel> pageUser = this.userRepository.findByType(pageable, type);

        List<UserModel> userModels = pageUser.getContent();

        List<UserDto> userDtos = userModels.stream().map(this::userModelToDto).collect(Collectors.toList());

        return new PageResponse<>(
                pageNumber,
                PAGE_SIZE,
                pageUser.getTotalPages(),
                pageUser.getTotalElements(),
                userDtos);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        UserModel foundUserModel = this.userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("No `USER` exist for email: " + email));

        return this.userModelToDto(foundUserModel);
    }

    @Override
    public UserDto getUserById(Long id) {
        UserModel foundUserModel = this.userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("No `USER` exist for id: " + id));

        return this.userModelToDto(foundUserModel);
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        UserModel foundUserModel = this.userRepository.findById(userDto.getId()).orElseThrow(
                () -> new ResourceNotFoundException("No `USER` exist for id: " + userDto.getId()));
        // Update the fields
        foundUserModel.setName(userDto.getName());
        foundUserModel.setDisabled(userDto.isDisabled());
        foundUserModel.setEmail(userDto.getEmail());
        foundUserModel.setPhone(userDto.getPhone());
        foundUserModel.setType(userDto.getType());
        foundUserModel.setWhatsappNumber(userDto.getWhatsappNumber());
        foundUserModel.setPassword(this.bCryptPasswordEncoder.encode(userDto.getPassword()));
        // Save the changes
        foundUserModel = this.userRepository.save(foundUserModel);

        return this.userModelToDto(foundUserModel);
    }

    @Override
    public boolean resetPassword(String email, String rawPassword) {
        // UserModel userModel = this.userRepository.findByEmail(email).orElseThrow(
        // () -> new ResourceNotFoundException("No `USER` exist for email: " + email));
        // TODO: Encrypt the password

        // TODO: Save the password

        return false;
    }


    private UserDto userModelToDto(UserModel userModel) {
        if (userModel == null) {
            return null;
        }
        UserDto userDto = this.modelMapper.map(userModel, UserDto.class);


        return userDto;
    }

}
