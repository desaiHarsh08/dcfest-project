package com.dcfest.services.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dcfest.dtos.JudgeDto;
import com.dcfest.dtos.UserDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.EventModel;
import com.dcfest.models.JudgeModel;
import com.dcfest.models.UserModel;
import com.dcfest.models.VenueModel;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.AvailableEventRepository;
import com.dcfest.repositories.EventRepository;
import com.dcfest.repositories.JudgeRepository;
import com.dcfest.repositories.UserRepository;
import com.dcfest.repositories.VenueRepository;
import com.dcfest.services.JudgeServices;

@Service
public class JudgeServicesImpl implements JudgeServices {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private JudgeRepository judgeRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private VenueRepository venueRepository;

    @Override
    public JudgeDto createJudge(JudgeDto judgeDto) {
        UserModel userModel = this.getUserModel(judgeDto.getUser());

        EventModel eventModel = this.eventRepository.findById(judgeDto.getEventIds().get(0)).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid event_id..."));

        AvailableEventModel availableEventModel = this.availableEventRepository
                .findById(eventModel.getAvailableEvent().getId()).orElseThrow(
                        () -> new IllegalArgumentException("Please provide the valid available_event_id..."));
        eventModel.setAvailableEvent(availableEventModel);

        // Create the judge
        JudgeModel judgeModel = new JudgeModel();
        judgeModel.setUser(userModel);
        judgeModel.getEvents().add(eventModel);
        // Save the judge
        judgeModel = this.judgeRepository.save(judgeModel);
        // Save the event
        this.eventRepository.save(eventModel);

        // Notify the user
        String subject = "todo";
        String body = this.generateJudgeEmailBody(userModel, eventModel);

        this.emailServices.sendSimpleMessage(userModel.getEmail(), subject, body);

        return this.judgeModelToDto(judgeModel);
    }

    private String generateJudgeEmailBody(UserModel userModel, EventModel eventModel) {
        // Fetch venue details for the event
        List<VenueModel> venueModels = this.venueRepository.findByAvailableEvent(eventModel.getAvailableEvent());

        // Start constructing the email body
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("<p>Dear ").append(userModel.getName()).append(",</p>")
                .append("<p>We are pleased to inform you that you have been appointed as a judge for the event <strong>")
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
                .append("<p>We look forward to your valuable participation. Please feel free to contact us if you have any questions.</p>")
                .append("<p>Best regards,<br>The Umang DCFest Team</p>");

        return emailBody.toString();
    }

    private UserModel getUserModel(UserDto userDto) {
        UserModel userModel = this.userRepository.findById(userDto.getId()).orElse(null);
        if (userModel != null) {
            return userModel;
        }
        CollegeModel collegeModel = new CollegeModel();
        if (userDto.getCollegeId() != null) {
            collegeModel.setId(userDto.getCollegeId());
        } else {
            collegeModel = null;
        }
        // Create the user
        userModel = this.modelMapper.map(userDto, UserModel.class);
        userModel.setCollege(collegeModel);
        // Save the user
        return this.userRepository.save(userModel);
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
    public JudgeDto getJudgeByUserId(Long userId) {
        UserModel userModel = new UserModel();
        userModel.setId(userId);

        JudgeModel foundJudgeModel = this.judgeRepository.findByUser(userModel).orElseThrow(
                () -> new ResourceNotFoundException("No `JUDGE` exist for userid: " + userId));

        return this.judgeModelToDto(foundJudgeModel);
    }

    @Override
    public List<JudgeDto> getJudgesByEventId(Long eventId) {
        List<JudgeModel> judgeModels = this.judgeRepository.findByEventId(eventId);

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
    public boolean deleteJudge(Long id) {
        this.getJudgeById(id);
        // Delete the judge
        this.judgeRepository.deleteById(id);

        return true;
    }

    private JudgeDto judgeModelToDto(JudgeModel judgeModel) {
        if (judgeModel == null) {
            return null;
        }
        JudgeDto judgeDto = new JudgeDto();
        judgeDto.setId(judgeModel.getId());
        // Convert the list of EventModel to a list of event IDs
        List<Long> eventIds = judgeModel.getEvents().stream().map(EventModel::getId).collect(Collectors.toList());
        judgeDto.setEventIds(eventIds);
        judgeDto.setUser(this.userModelToDto(judgeModel.getUser()));

        return judgeDto;
    }

    private UserDto userModelToDto(UserModel userModel) {
        if (userModel == null) {
            return null;
        }
        UserDto userDto = this.modelMapper.map(userModel, UserDto.class);
        if (userModel.getCollege() != null) {
            userDto.setCollegeId(userModel.getCollege().getId());
        }

        return userDto;
    }

}
