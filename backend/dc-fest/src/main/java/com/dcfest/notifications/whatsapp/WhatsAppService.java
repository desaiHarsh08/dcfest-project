package com.dcfest.notifications.whatsapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    private final RestTemplate restTemplate;

    @Value("${interakt.api.key}")
    private String interaktApiKey;

    @Value("${interakt.base.url}")
    private String interaktBaseUrl;

    public WhatsAppService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> sendWhatsAppMessage(String to, List<String> messageArr, String templateName) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("countryCode", "+91");
            requestBody.put("phoneNumber", to);
            requestBody.put("type", "Template");

            Map<String, Object> template = new HashMap<>();
            template.put("name", templateName);
            template.put("languageCode", "en");
            template.put("headerValues", List.of("Alert"));
            template.put("bodyValues", messageArr);

            requestBody.put("template", template);
            requestBody.put("data", Map.of("message", ""));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic RGY2dkVyZThGQUJ4enhXN2pRSkxJaXEzMlJaN3V3REpDQTRFbWFpMWs1WTo=");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            System.out.println("interaktApiKey: " + interaktApiKey);
            System.out.println("interaktBaseUrl: " + interaktBaseUrl);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    interaktBaseUrl,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                throw new RuntimeException("HTTP error! Status: " + response.getStatusCode() + ", Response: " + response.getBody());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error sending WhatsApp message: " + e.getMessage(), e);
        }
    }

}
