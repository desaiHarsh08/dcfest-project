package com.dcfest.notifications.email;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @Value("${dev.email:#{null}}")
    private String devEmailOverride;

    private final RestTemplate restTemplate;

    public ZeptoMailService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent, null);
    }

    public void sendEmail(String to, String subject, String htmlContent, List<Attachment> attachments) {
        try {
            // DEV MODE: Redirect all emails to developer
            if (devEmailOverride != null && !devEmailOverride.trim().isEmpty()) {
                System.out.println("DEVELOPMENT MODE ACTIVE");
                System.out.println("   Original recipient: " + to);
                System.out.println("   Redirected to developer: " + devEmailOverride);
                System.out.println("   Subject: " + subject);
                to = devEmailOverride.trim();
            }

            // Ensure URL is properly formatted with protocol
            String baseUrl = zeptoUrl;
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new IllegalStateException("zepto.url is not configured in application properties");
            }
            // Remove trailing slash if present, then add it back
            baseUrl = baseUrl.trim();
            if (!baseUrl.endsWith("/")) {
                baseUrl = baseUrl + "/";
            }
            // Ensure URL has protocol
            if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
                baseUrl = "https://" + baseUrl;
            }
            String url = baseUrl + "v1.1/email";

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Zoho-enczapikey " + zeptoToken);

            System.out.println("ZeptoMail Configuration:");
            System.out.println("URL: " + zeptoUrl);
            System.out.println("From: " + zeptoFrom);
            System.out.println("Token length: " + (zeptoToken != null ? zeptoToken.length() : 0));
            System.out.println("Token starts with: "
                    + (zeptoToken != null && zeptoToken.length() > 10 ? zeptoToken.substring(0, 10) + "..." : "N/A"));
            System.out.println("Full URL: " + url);

            // Prepare email data
            Map<String, Object> emailData = new HashMap<>();

            // From address
            Map<String, String> from = new HashMap<>();
            from.put("address", zeptoFrom);
            from.put("name", "Umang 2025");
            emailData.put("from", from);

            // To addresses - ZeptoMail API format
            List<Map<String, Object>> toList = new ArrayList<>();
            Map<String, Object> toAddress = new HashMap<>();
            toAddress.put("email_address", Map.of("address", to, "name", ""));
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

        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            System.err.println("==========================================");
            System.err.println("ZeptoMail 401 Unauthorized Error");
            System.err.println("==========================================");
            System.err.println("Error sending email to: " + to);
            System.err.println("URL: " + zeptoUrl + "v1.1/email");
            System.err.println("From address: " + zeptoFrom);
            System.err.println("Token configured: "
                    + (zeptoToken != null && !zeptoToken.isEmpty() ? "Yes (length: " + zeptoToken.length() + ")"
                            : "No"));
            System.err.println("Response status: " + e.getStatusCode());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            System.err.println("Response headers: " + e.getResponseHeaders());

            System.err.println("\nPossible causes:");
            System.err.println("1. Token is expired or invalid - Check ZeptoMail dashboard");
            System.err.println("2. IP restrictions - Add production server IP to ZeptoMail whitelist");
            System.err.println("3. Token mismatch - Verify token in ZeptoMail Mail Agent Setup");
            System.err
                    .println("4. From email not verified - Ensure donotreply@thebges.edu.in is verified in ZeptoMail");
            System.err.println("==========================================");

            e.printStackTrace();
            throw new RuntimeException(
                    "Failed to send email: ZeptoMail API authentication failed. Please verify the API token and IP restrictions in ZeptoMail dashboard.",
                    e);
        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    public static class Attachment {
        private String content;
        private String name;
        @JsonProperty("mime_type")
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
