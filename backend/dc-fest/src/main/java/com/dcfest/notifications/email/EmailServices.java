package com.dcfest.notifications.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;

@Service
public class EmailServices {

    @Autowired
    private JavaMailSender emailSender;

    private static final String HOST_EMAIL = "otp-noreply@thebges.edu.in";

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

}
