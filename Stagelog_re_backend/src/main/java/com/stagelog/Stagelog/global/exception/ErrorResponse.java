package com.stagelog.Stagelog.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<ValidationError> errors = new ArrayList<>();

    private ErrorResponse(ErrorCode errorCode) {
        this.timestamp = LocalDateTime.now();
        this.status = errorCode.getHttpStatus().value();
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }

    private ErrorResponse(ErrorCode errorCode, String customMessage) {
        this.timestamp = LocalDateTime.now();
        this.status = errorCode.getHttpStatus().value();
        this.code = errorCode.getCode();
        this.message = customMessage;
    }

    private ErrorResponse(ErrorCode errorCode, List<ValidationError> errors) {
        this.timestamp = LocalDateTime.now();
        this.status = errorCode.getHttpStatus().value();
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.errors = errors;
    }

    public static ErrorResponse of(HttpStatus httpStatus, String code, String message) {
        ErrorResponse response = new ErrorResponse();
        response.timestamp = LocalDateTime.now();
        response.status = httpStatus.value();
        response.code = code;
        response.message = message;
        return response;
    }

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode);
    }

    public static ErrorResponse of(ErrorCode errorCode, String customMessage) {
        return new ErrorResponse(errorCode, customMessage);
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> fieldErrors) {
        List<ValidationError> errors = fieldErrors.stream()
                .map(error -> new ValidationError(
                        error.getField(),
                        error.getRejectedValue() == null ? "" : error.getRejectedValue().toString(),
                        error.getDefaultMessage()
                ))
                .toList();
        return new ErrorResponse(errorCode, errors);
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class ValidationError {
        private String field;
        private String rejectedValue;
        private String message;

        public ValidationError(String field, String rejectedValue, String message) {
            this.field = field;
            this.rejectedValue = rejectedValue;
            this.message = message;
        }
    }
}
