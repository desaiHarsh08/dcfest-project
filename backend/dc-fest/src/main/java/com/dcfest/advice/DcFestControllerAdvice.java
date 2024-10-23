package com.dcfest.advice;

import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.utils.ErrorMessage;

// import io.jsonwebtoken.ExpiredJwtException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Set;

@ControllerAdvice
public class DcFestControllerAdvice {

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolationExceptions(ConstraintViolationException ex) {
        ex.printStackTrace();

        Set<ConstraintViolation<?>> constraintViolations = ex.getConstraintViolations();

        return new ResponseEntity<>(
                new ErrorMessage(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST,
                        constraintViolations.stream()
                                .map(ConstraintViolation::getMessage)
                                .toList()
                                .get(0)),
                HttpStatus.BAD_REQUEST);
    }

    // @ExceptionHandler(ExpiredJwtException.class)
    // public ResponseEntity<?> handleExpiredJwtException(ExpiredJwtException ex) {
    //     ex.printStackTrace();

    //     return new ResponseEntity<>(
    //             new ErrorMessage(HttpStatus.FORBIDDEN.value(), HttpStatus.FORBIDDEN, ex.getMessage()),
    //             HttpStatus.FORBIDDEN);
    // }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleSecurityException(SecurityException ex) {
        ex.printStackTrace();

        return new ResponseEntity<>(
                new ErrorMessage(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED, ex.getMessage()),
                HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ex.printStackTrace();
        return new ResponseEntity<>(
                new ErrorMessage(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND, ex.getMessage()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        ex.printStackTrace();
        return new ResponseEntity<>(
                new ErrorMessage(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST, ex.getMessage()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleOtherException(Exception ex) {
        ex.printStackTrace();
        return new ResponseEntity<>(
                new ErrorMessage(HttpStatus.INTERNAL_SERVER_ERROR.value(), HttpStatus.INTERNAL_SERVER_ERROR,
                        ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
