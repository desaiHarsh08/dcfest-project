package com.dcfest.notifications.email;

import com.dcfest.constants.RoundType;
import com.dcfest.models.AvailableEventModel;
import com.dcfest.models.RoundModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@Service
public class EmailServices {

    @Autowired
    private ZeptoMailService zeptoMailService;

    @Autowired
    private TemplateEngine templateEngine;

    @Async
    public void sendCollegeRegistrationEmail(String to, String collegeName) {
        String subject = "Confirmation of Participation for Umang DCFest 2024";

        try {
            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", collegeName);

            String htmlContent = templateEngine.process("collegeRegistration", context);

            // Send email using ZeptoMail
            zeptoMailService.sendEmail(to, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Async
    public void senOTP(String to, String username, Long otp) {
        String subject = "Verify your account for Umang DCFest 2024";

        try {
            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", username);
            context.setVariable("otp", otp);

            String htmlContent = templateEngine.process("sendOtp", context);

            // Send email using ZeptoMail
            zeptoMailService.sendEmail(to, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // @Async
    // public void sendParticipantRegistrationEmail(String to, String name,
    // List<VenueModel> venueModels, EventModel eventModel) {
    // String subject = "Confirmation of your participation in " +
    // eventModel.getAvailableEvent().getTitle() + " - Umang DCFest 2024";
    //
    // try {
    // MimeMessage message = emailSender.createMimeMessage();
    // MimeMessageHelper helper = new MimeMessageHelper(message, true);
    // helper.setTo(to);
    // helper.setSubject(subject);
    //
    // // Create the HTML content using Thymeleaf template
    // Context context = new Context();
    // context.setVariable("name", name);
    // context.setVariable("eventModel", eventModel);
    // context.setVariable("venueModels", venueModels);
    //
    // String htmlContent = templateEngine.process("participantRegistration",
    // context);
    // helper.setText(htmlContent, true); // Enable HTML content
    //
    // this.emailSender.send(message);
    // } catch (MessagingException e) {
    // e.printStackTrace();
    // }
    // }

    @Async
    public void sendResetPasswordEmail(String to, String name, String iccode, String password, String institutionName) {
        String subject = "Reset Password Success - (Umang 2024)";

        try {
            // Create the HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("iccode", iccode);
            context.setVariable("password", password);
            context.setVariable("institutionName", institutionName);

            String htmlContent = templateEngine.process("resetPasswordEmail", context);

            // Send email using ZeptoMail
            zeptoMailService.sendEmail(to, subject, htmlContent);
        } catch (Exception e) {
            // Log the exception for better error tracking
            e.printStackTrace();
        }
    }

    // Send simple HTML email
    public void sendSimpleMessage(String to, String subject, String body) {
        System.out.println("in sendSimpleMessage()");
        try {
            // Send email using ZeptoMail
            zeptoMailService.sendEmail(to, subject, body);
        } catch (Exception e) {
            // Handle the exception or log it
            e.printStackTrace();
        }
    }

    // Send an email with an attachment (e.g., QR code or other files)
    public void sendSimpleMessageWithAttachment(String to, String subject, String body, byte[] attachmentData,
            String attachmentName) {
        try {
            // Convert attachment data to base64
            String base64Attachment = Base64.getEncoder().encodeToString(attachmentData);

            // Determine content type based on file extension
            String contentType = getContentType(attachmentName);

            // Create attachment object
            ZeptoMailService.Attachment attachment = new ZeptoMailService.Attachment(
                    base64Attachment,
                    attachmentName,
                    contentType);

            // Send email with attachment using ZeptoMail
            zeptoMailService.sendEmail(to, subject, body, List.of(attachment));
        } catch (Exception e) {
            // Handle the exception or log it
            e.printStackTrace();
        }
    }

    private String getContentType(String fileName) {
        String extension = fileName.toLowerCase();
        if (extension.endsWith(".pdf")) {
            return "application/pdf";
        } else if (extension.endsWith(".jpg") || extension.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (extension.endsWith(".png")) {
            return "image/png";
        } else if (extension.endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }

    @Async
    public void sendEventProofEmail(String to, String subject, byte[] pdfData, String attachmentName,
            AvailableEventModel availableEventModel, RoundModel roundModel) {
        try {
            // Format the LocalDateTime to the required format without milliseconds
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a");
            String formattedDateTime = roundModel.getStartTime().format(formatter);

            // Create the HTML content using Thymeleaf template
            String roundName = roundModel.getRoundType().equals(RoundType.SEMI_FINAL) ? "PRELIMS"
                    : roundModel.getRoundType().name();
            Context context = new Context();
            context.setVariable("eventName", availableEventModel.getTitle());
            context.setVariable("eventDateTime", formattedDateTime);
            context.setVariable("venue", roundModel.getVenue());
            context.setVariable("round", roundName);
            context.setVariable("slug", availableEventModel.getSlug());

            String htmlContent = templateEngine.process("confirmEventParticipation", context);

            // Convert PDF data to base64
            String base64Pdf = Base64.getEncoder().encodeToString(pdfData);

            // Create attachment object
            ZeptoMailService.Attachment attachment = new ZeptoMailService.Attachment(
                    base64Pdf,
                    attachmentName,
                    "application/pdf");

            // Send email with PDF attachment using ZeptoMail
            zeptoMailService.sendEmail(to, subject, htmlContent, List.of(attachment));
        } catch (Exception e) {
            // Log the exception for better error tracking
            e.printStackTrace();
        }
    }

}