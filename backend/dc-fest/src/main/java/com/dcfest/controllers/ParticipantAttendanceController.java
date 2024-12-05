package com.dcfest.controllers;

import com.dcfest.dtos.ParticipantAttendanceDto;
import com.dcfest.services.ParticipantAttendanceServices;
import com.dcfest.utils.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class ParticipantAttendanceController {

    private final ParticipantAttendanceServices participantAttendanceServices;
    private final PdfService pdfService;

    @Autowired
    public ParticipantAttendanceController(ParticipantAttendanceServices participantAttendanceServices, PdfService pdfService) {
        this.participantAttendanceServices = participantAttendanceServices;
        this.pdfService = pdfService;
    }

    // Get Attendance by ID
    @GetMapping("/{id}")
    public ResponseEntity<ParticipantAttendanceDto> getAttendanceById(@PathVariable Long id) {
        try {
            ParticipantAttendanceDto attendanceDto = participantAttendanceServices.getAttendanceById(id);
            return new ResponseEntity<>(attendanceDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Get all Attendance
    @GetMapping("/all")
    public ResponseEntity<List<ParticipantAttendanceDto>> getAllAttendances() {
        try {
            List<ParticipantAttendanceDto> attendanceDtos = participantAttendanceServices.getAllAttendances();
            return new ResponseEntity<>(attendanceDtos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Generate QR Code
    @GetMapping("/generate-qrcode")
    public ResponseEntity<InputStreamResource> generateQrcode(
            @RequestParam Long collegeId,
            @RequestParam Long availableEventId,
            @RequestParam Long roundId
    ) {
        System.out.println(collegeId);
        System.out.println(availableEventId);
        System.out.println(roundId);

        try {
            // Generate the PDF byte array from the service method
            InputStreamSource pdf = participantAttendanceServices.generateQrcode(collegeId, availableEventId, roundId);

            // Prepare the PDF byte array to be returned as InputStreamResource
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(((ByteArrayResource) pdf).getByteArray());

            // Create the response with the correct headers
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=pop_participants.pdf"); // Inline opens in browser
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");

            return new ResponseEntity<>(new InputStreamResource(byteArrayInputStream), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-pop")
    public ResponseEntity<InputStreamResource> getPop(
            @RequestParam Long collegeId,
            @RequestParam Long availableEventId,
            @RequestParam Long roundId
    ) {
        System.out.println(collegeId);
        System.out.println(availableEventId);
        System.out.println(roundId);

        try {
            // Generate the PDF byte array from the service method
            InputStreamSource pdf = participantAttendanceServices.getPop(roundId, collegeId, availableEventId);

            // Prepare the PDF byte array to be returned as InputStreamResource
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(((ByteArrayResource) pdf).getByteArray());

            // Create the response with the correct headers
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=pop_participants.pdf"); // Inline opens in browser
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");

            return new ResponseEntity<>(new InputStreamResource(byteArrayInputStream), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Update Attendance
    @PutMapping("/update")
    public ResponseEntity<ParticipantAttendanceDto> updateAttendance(@RequestBody ParticipantAttendanceDto participantAttendanceDto) {
        try {
            ParticipantAttendanceDto updatedDto = participantAttendanceServices.updateAttendance(participantAttendanceDto);
            return new ResponseEntity<>(updatedDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Delete Attendance (if implemented)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAttendance(@PathVariable Long id) {
        try {
            boolean deleted = participantAttendanceServices.deleteAttendance(id);
            if (deleted) {
                return new ResponseEntity<>("Attendance deleted successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Attendance not found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting attendance", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
