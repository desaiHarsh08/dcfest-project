package com.dcfest.exceptions;

public class RegistrationDeadlineClosedException extends RuntimeException {
    public RegistrationDeadlineClosedException(String message) {
        super(message);
    }
}

