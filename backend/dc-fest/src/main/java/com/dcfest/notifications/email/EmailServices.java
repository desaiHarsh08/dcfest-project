package com.dcfest.notifications.email;

import com.dcfest.constants.RoundType;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.EventModel;
import com.dcfest.models.RoundModel;
import com.dcfest.models.UserModel;
import com.dcfest.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;
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
    public void senOTP(String to, String username, Long otp) {
        String subject = "Verify your account for Umang DCFest 2024";

        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", username);
            context.setVariable("otp", otp);

            String htmlContent = templateEngine.process("sendOtp", context);
            helper.setText(htmlContent, true); // Enable HTML content

            this.emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

//    @Async
//    public void sendParticipantRegistrationEmail(String to, String name, List<VenueModel> venueModels, EventModel eventModel) {
//        String subject = "Confirmation of your participation in " + eventModel.getAvailableEvent().getTitle() + " - Umang DCFest 2024";
//
//        try {
//            MimeMessage message = emailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true);
//            helper.setTo(to);
//            helper.setSubject(subject);
//
//            // Create the HTML content using Thymeleaf template
//            Context context = new Context();
//            context.setVariable("name", name);
//            context.setVariable("eventModel", eventModel);
//            context.setVariable("venueModels", venueModels);
//
//            String htmlContent = templateEngine.process("participantRegistration", context);
//            helper.setText(htmlContent, true); // Enable HTML content
//
//            this.emailSender.send(message);
//        } catch (MessagingException e) {
//            e.printStackTrace();
//        }
//    }

    @Async
    public void sendResetPasswordEmail(String to, String name, String iccode, String password, String institutionName) {
        String subject = "Reset Password Success - (Umang 2024)";

        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("iccode", iccode);
            context.setVariable("password", password);
            context.setVariable("institutionName", institutionName);

            String htmlContent = templateEngine.process("resetPasswordEmail", context);
            helper.setText(htmlContent, true); // Enable HTML content

            emailSender.send(message);
        } catch (MessagingException e) {
            // Log the exception for better error tracking
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


    @Async
    public void sendEventProofEmail(String to, String subject, byte[] pdfData, String attachmentName, AvailableEventModel availableEventModel, RoundModel roundModel) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Format the LocalDateTime to the required format without milliseconds
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a");
            String formattedDateTime = roundModel.getStartTime().format(formatter);


            // Add the PDF as an attachment
            InputStreamSource attachmentSource = new ByteArrayResource(pdfData);
            helper.addAttachment(attachmentName, attachmentSource);

            // Create the HTML content using Thymeleaf template
            String roundName = roundModel.getRoundType().equals(RoundType.SEMI_FINAL) ? "PRELIMS" : roundModel.getRoundType().name();
            Context context = new Context();
            context.setVariable("eventName", availableEventModel.getTitle());

            context.setVariable("eventDateTime", formattedDateTime);
            context.setVariable("venue", roundModel.getVenue());
            context.setVariable("round", roundName);
            context.setVariable("slug", availableEventModel.getSlug());


            String htmlContent = templateEngine.process("confirmEventParticipation", context);
            helper.setText(htmlContent, true); // Enable HTML content

            emailSender.send(message);
        } catch (MessagingException e) {
            // Log the exception for better error tracking
            e.printStackTrace();
        }
    }


    private UserModel getUser(Long id) {
        return this.userRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Please provide the valid user!")
        );
    }

}