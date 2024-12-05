package com.dcfest.utils;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;

public class PdfGenerator {

    public static byte[] generatePdf(String htmlContent) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

//    public static byte[] generatePdf(String htmlContent) {
//        System.out.println("here");
//
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            System.out.println("in try catch");
//            HtmlConverter.convertToPdf(htmlContent, outputStream);
//            System.out.println(outputStream);
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to generate PDF", e);
//        }
//    }


}

