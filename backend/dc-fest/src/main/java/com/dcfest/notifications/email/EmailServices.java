package com.dcfest.notifications.email;

import com.dcfest.models.EventModel;
import com.dcfest.models.UserModel;
import com.dcfest.models.VenueModel;
import com.dcfest.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.List;

@Service
public class EmailServices {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private UserRepository userRepository;


    @Async
    public void sendCollegeRegistrationEmail(String to, String collegeName) {
        String subject = "Confirmation of Participation for Umang DCFest 2024";

        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", collegeName);

            String htmlContent = templateEngine.process("collegeRegistration", context);
            helper.setText(htmlContent, true); // Enable HTML content

            this.emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    @Async
    public void sendParticipantRegistrationEmail(String to, String name, List<VenueModel> venueModels, EventModel eventModel) {
        String subject = "Confirmation of your participation in " + eventModel.getAvailableEvent().getTitle() + " - Umang DCFest 2024";

        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("eventModel", eventModel);
            context.setVariable("venueModels", venueModels);

            String htmlContent = templateEngine.process("participantRegistration", context);
            helper.setText(htmlContent, true); // Enable HTML content

            this.emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }


    // Send simple HTML email
    public void sendSimpleMessage(String to, String subject, String body) {
        System.out.println("in sendSimpleMessage()");
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // 'true' enables HTML content

            emailSender.send(message);
        } catch (MessagingException e) {
            // Handle the exception or log it
            e.printStackTrace();
        }
    }

    // Send an email with an attachment (e.g., QR code or other files)
    public void sendSimpleMessageWithAttachment(String to, String subject, String body, byte[] attachmentData,
                                                String attachmentName) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // 'true' enables HTML content

            // Add the QR code image as an attachment
            InputStreamSource attachmentSource = new ByteArrayResource(attachmentData);
            helper.addAttachment(attachmentName, attachmentSource);

            emailSender.send(message);
        } catch (MessagingException e) {
            // Handle the exception or log it
            e.printStackTrace();
        }
    }


    private UserModel getUser(Long id) {
        return this.userRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid user!")
        );
    }

}