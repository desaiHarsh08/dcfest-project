package com.dcfest.utils;

import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class CertificateServices {

    public File generateCertificate(String name, String collegeName, String eventName) throws Exception {
        // Load the template from resources/templates using ClassPathResource
        ClassPathResource resource = new ClassPathResource("templates/participation_certificate_template.pdf");
        File tempFile = File.createTempFile("certificate", ".pdf"); // Temporary file to hold the PDF

        try (InputStream templateInputStream = resource.getInputStream();
             ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             PdfWriter writer = new PdfWriter(byteArrayOutputStream);
             PdfDocument pdfDoc = new PdfDocument(new PdfReader(templateInputStream), writer)) {

            PdfCanvas canvas = new PdfCanvas(pdfDoc.getFirstPage());

            // Set font and size
            canvas.beginText()
                    .setFontAndSize(PdfFontFactory.createFont("Helvetica-Bold"), 15)
                    .moveText(475, 335) // Set coordinates (X, Y)
                    .showText(name.toUpperCase()) // Add the name
                    .endText();

            canvas.beginText()
                    .setFontAndSize(PdfFontFactory.createFont("Helvetica-Bold"), 15)
                    .moveText(130, 296) // Set coordinates for course
                    .showText(collegeName.toUpperCase()) // Add the course name
                    .endText();
//
            canvas.beginText()
                    .setFontAndSize(PdfFontFactory.createFont("Helvetica-Bold"), 15)
                    .moveText(290, 260) // Set coordinates for date
                    .showText(eventName.toUpperCase()) // Add the date
                    .endText();

            pdfDoc.close(); // Close the document after modifications

            // Write byte array to the temporary file
            try (FileOutputStream fileOutputStream = new FileOutputStream(tempFile)) {
                byteArrayOutputStream.writeTo(fileOutputStream);
            }

        } catch (IOException e) {
            throw new Exception("Error generating certificate PDF", e);
        }

        return tempFile; // Return the temporary file
    }
}
