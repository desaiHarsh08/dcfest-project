package com.dcfest.notifications.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ZeptoMailService {

    @Value("${zepto.url}")
    private String zeptoUrl;

    @Value("${zepto.from}")
    private String zeptoFrom;

    @Value("${zepto.token}")
    private String zeptoToken;

    private final RestTemplate restTemplate;

    public ZeptoMailService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent, null);
    }

    public void sendEmail(String to, String subject, String htmlContent, List<Attachment> attachments) {
        try {
            String url = zeptoUrl + "v1.1/email";

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Zoho-enczapikey " + zeptoToken);

            // Prepare email data
            Map<String, Object> emailData = new HashMap<>();

            // From address
            Map<String, String> from = new HashMap<>();
            from.put("address", zeptoFrom);
            from.put("name", "Umang DCFest 2024");
            emailData.put("from", from);

            // To addresses
            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> toAddress = new HashMap<>();
            toAddress.put("address", to);
            toList.add(toAddress);
            emailData.put("to", toList);

            // Subject and content
            emailData.put("subject", subject);
            emailData.put("htmlbody", htmlContent);

            // Add attachments if provided
            if (attachments != null && !attachments.isEmpty()) {
                emailData.put("attachments", attachments);
            }

            // Create request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(emailData, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("Email sent successfully to: " + to);
            } else {
                System.err.println("Failed to send email. Status: " + response.getStatusCode());
                System.err.println("Response: " + response.getBody());
            }

        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static class Attachment {
        private String content;
        private String name;
        private String type;

        public Attachment() {
        }

        public Attachment(String content, String name, String type) {
            this.content = content;
            this.name = name;
            this.type = type;
        }

        // Getters and setters
        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}
