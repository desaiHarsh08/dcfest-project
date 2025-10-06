package com.dcfest.controllers;

import com.dcfest.utils.CertificateServices;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;

@Getter
@Setter
class CertificateRequest {
    private String name;
    private String collegeName;
    private String eventName;
}

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    @Autowired
    private CertificateServices certificateServices;

    @PostMapping(value = "/generate", produces = "application/pdf")
    public ResponseEntity<InputStreamResource> generateCertificate(@RequestBody CertificateRequest certificateRequest) throws Exception {
        File pdfFile = certificateServices.generateCertificate(
                certificateRequest.getName(),
                certificateRequest.getCollegeName(),
                certificateRequest.getEventName()
        );

        // Serve the file as a downloadable response
        InputStreamResource resource = new InputStreamResource(new FileInputStream(pdfFile));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate.pdf")
                .body(resource);
    }
}
