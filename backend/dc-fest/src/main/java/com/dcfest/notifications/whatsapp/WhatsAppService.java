package com.dcfest.notifications.whatsapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    private final RestTemplate restTemplate;

    @Value("${interakt.api.key}")
    private String interaktApiKey;

    @Value("${interakt.base.url}")
    private String interaktBaseUrl;

    @Value("${dev.whatsapp:#{null}}")
    private String devWhatsAppOverride;

    public WhatsAppService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> sendWhatsAppMessage(String to, List<String> messageArr, String templateName,
            String filePath) {
        try {
            // DEV MODE: Redirect all whatsapp to developer
            if (devWhatsAppOverride != null && !devWhatsAppOverride.trim().isEmpty()) {
                System.out.println("DEVELOPMENT MODE ACTIVE");
                System.out.println("   Original recipient: " + to);
                System.out.println("   Redirected to developer: " + devWhatsAppOverride);
                to = devWhatsAppOverride.trim();
            }

            // Build request body in exact order as frontend
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("countryCode", "+91");
            requestBody.put("phoneNumber", to); // Keep as string like frontend
            requestBody.put("type", "Template");

            Map<String, Object> template = new LinkedHashMap<>();
            template.put("name", templateName);
            template.put("languageCode", "en");
            if (filePath == null) {
                template.put("headerValues", List.of("Alert"));
            } else {
                template.put("headerValues", List.of(filePath));
            }
            template.put("bodyValues", messageArr);

            requestBody.put("template", template);

            Map<String, String> data = new LinkedHashMap<>();
            data.put("message", "");
            requestBody.put("data", data);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + interaktApiKey);
            headers.set("Accept", "*/*");
            headers.set("User-Agent", "Java/Spring-RestTemplate");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            System.out.println("=== WhatsApp API Request ===");
            System.out.println("URL: " + interaktBaseUrl);
            System.out.println("Headers: " + headers);
            System.out.println("Request Body (Map): " + requestBody);

            // Print exact JSON that will be sent
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String jsonBody = mapper.writeValueAsString(requestBody);
                System.out.println("Request Body (JSON): " + jsonBody);
            } catch (Exception e) {
                System.err.println("Failed to serialize to JSON: " + e.getMessage());
            }
            System.out.println("===========================");

            // Use HttpURLConnection instead of RestTemplate to match fetch() behavior
            URL url = new URL(interaktBaseUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Basic " + interaktApiKey);
            conn.setRequestProperty("Accept", "*/*");
            conn.setDoOutput(true);

            // Write JSON body
            ObjectMapper mapper = new ObjectMapper();
            String jsonBody = mapper.writeValueAsString(requestBody);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            System.out.println("=== WhatsApp API Response ===");
            System.out.println("Status: " + responseCode);
            System.out.println("============================");

            if (responseCode >= 200 && responseCode < 300) {
                // Success - read response
                java.io.BufferedReader br = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                System.out.println("Response Body: " + response.toString());
                return mapper.readValue(response.toString(), Map.class);
            } else {
                // Error - read error stream
                java.io.BufferedReader br = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
                StringBuilder error = new StringBuilder();
                String errorLine;
                while ((errorLine = br.readLine()) != null) {
                    error.append(errorLine.trim());
                }
                System.err.println("=== WhatsApp API Error ===");
                System.err.println("Status: " + responseCode);
                System.err.println("Response: " + error.toString());
                System.err.println("=========================");
                throw new RuntimeException("HTTP error! Status: " + responseCode + ", Response: " + error.toString());
            }
        } catch (Exception e) {
            System.err.println("=== WhatsApp Exception ===");
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            System.err.println("=========================");
            e.printStackTrace();
            throw new RuntimeException("Error sending WhatsApp message: " + e.getMessage(), e);
        }
    }

}
