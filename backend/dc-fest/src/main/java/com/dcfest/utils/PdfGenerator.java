//package com.dcfest.utils;
//
//import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
//import java.io.ByteArrayOutputStream;
//
//public class PdfGenerator {
//
//    public static byte[] generatePdf(String htmlContent) {
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//
//            // Inject custom CSS to remove margins and padding
//            String updatedHtmlContent = injectCustomCSS(htmlContent);
//
//            builder.withHtmlContent(updatedHtmlContent, null)
//                    .useInitialPageNumber(1);
//            builder.toStream(outputStream);
//
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to generate PDF", e);
//        }
//    }
//
//    // Method to inject custom CSS to remove margins and padding
//    private static String injectCustomCSS(String htmlContent) {
//        String customCSS = "<style>"
//                + "html, body { margin: 0; padding: 0; width: 100%; height: 100%; }"
//                + "@page { margin: 0; }"
//                + "</style>";
//        // Inject the custom CSS inside the <head> section of the HTML content
//        int headEndIndex = htmlContent.indexOf("</head>");
//        if (headEndIndex != -1) {
//            return htmlContent.substring(0, headEndIndex) + customCSS + htmlContent.substring(headEndIndex);
//        }
//        // If no <head> tag exists, just append the CSS before the closing </html> tag
//        return htmlContent + customCSS;
//    }
//
////    public static byte[] generatePdf(String htmlContent) {
////        System.out.println("here");
////
////        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
////            System.out.println("in try catch");
////            HtmlConverter.convertToPdf(htmlContent, outputStream);
////            System.out.println(outputStream);
////            return outputStream.toByteArray();
////        } catch (Exception e) {
////            throw new RuntimeException("Failed to generate PDF", e);
////        }
////    }
//
//
//}
//

















package com.dcfest.utils;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;  // Importing the required font class

import java.io.ByteArrayOutputStream;

public class PdfGenerator {

    public static byte[] generatePdf(String htmlContent) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // Inject custom CSS to remove margins, padding, and add page numbers
            String updatedHtmlContent = injectCustomCSS(htmlContent);

            builder.withHtmlContent(updatedHtmlContent, null)
                    .useInitialPageNumber(1)
                    .usePageSupplier((doc, pageWidth, pageHeight, pageNumber, shadowPageNumber) -> {
                        PDPage page;
                        if (pageNumber == 0) {
                            // First page uses the header from the HTML content
                            String header = getHtmlHeader(htmlContent);
                            page = new PDPage();  // Create a new PDPage
                            doc.addPage(page);    // Add the page to the document
                            addHeaderToPage(doc, page, header);
                        } else {
                            page = new PDPage();  // Create a new PDPage for subsequent pages
                            doc.addPage(page);    // Add the page to the document
                            String header = getHtmlHeader(htmlContent);
                            addHeaderToPage(doc, page, header);
                        }
                        addPageNumber(doc, page, pageWidth, pageHeight, pageNumber);
                        return page;
                    });

            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    // Method to inject custom CSS to remove margins, padding, and add page number positioning
    private static String injectCustomCSS(String htmlContent) {
        String customCSS = "<style>"
//                + "html, body { margin: 0; padding: 0; width: 100%; height: 100%; }"
                + "@page { margin: 0; size: A4 portrait; }"
                + "body { font-family: Arial, sans-serif; }"
                + ".h-33 { height: 33%; }"
                + "footer { position: fixed; bottom: 0; right: 0; text-align: right; width: 100%; font-size: 12px; }"
                + "@page { margin-bottom: 10px; margin-top: 70px; margin-left: 17px; margin-right: 14px; }"  // For space for page number
                + "</style>";

        // Inject the custom CSS inside the <head> section of the HTML content
        int headEndIndex = htmlContent.indexOf("</head>");
        if (headEndIndex != -1) {
            return htmlContent.substring(0, headEndIndex) + customCSS + htmlContent.substring(headEndIndex);
        }
        // If no <head> tag exists, just append the CSS before the closing </html> tag
        return htmlContent + customCSS;
    }

    // Method to extract the header from the HTML content
    private static String getHtmlHeader(String htmlContent) {
        // Assuming the header is within a <header> tag or similar, adjust if needed
        String header = "";
        int headerStartIndex = htmlContent.indexOf("<header>");
        int headerEndIndex = htmlContent.indexOf("</header>");
        if (headerStartIndex != -1 && headerEndIndex != -1) {
            header = htmlContent.substring(headerStartIndex + "<header>".length(), headerEndIndex);
        }
        return header;
    }

    // Method to add the header to each page
    private static void addHeaderToPage(PDDocument doc, PDPage page, String headerContent) {
        try {
            PDPageContentStream contentStream = new PDPageContentStream(doc, page);
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);  // Use the correct font class
            contentStream.newLineAtOffset(20, page.getMediaBox().getHeight() - 30);  // Top-left corner
            contentStream.showText(headerContent); // Add header text
            contentStream.endText();
            contentStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Method to add the page number to the bottom-right of each page
    private static void addPageNumber(PDDocument doc, PDPage page, float pageWidth, float pageHeight, int pageNumber) {
        try {
            PDPageContentStream contentStream = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true);
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.newLineAtOffset(pageWidth - 50, 30);  // Bottom-right corner
            contentStream.showText("Page " + (++pageNumber));
            contentStream.endText();
            contentStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
