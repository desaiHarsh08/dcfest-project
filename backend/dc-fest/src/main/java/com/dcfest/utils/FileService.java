package com.dcfest.utils;

import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Retrieves a file by its name from the configured directory.
     * 
     * @param fileName the name of the file to be fetched.
     * @return a Resource representing the file.
     * @throws IOException if the file does not exist or there is an I/O error.
     */
    public Resource getFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        // Check if the file exists and is readable
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("File not found or not readable: " + fileName);
        }
    }
}
