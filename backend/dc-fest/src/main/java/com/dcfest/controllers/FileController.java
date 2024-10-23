package com.dcfest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dcfest.utils.FileService;

import java.io.IOException;

@RestController
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("/get-file")
    public ResponseEntity<Resource> getFile(@RequestParam String fileName) throws IOException {
        Resource file = fileService.getFile(fileName);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}