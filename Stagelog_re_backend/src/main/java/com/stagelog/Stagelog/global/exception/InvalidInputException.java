package com.stagelog.Stagelog.global.exception;

public class InvalidInputException extends BusinessException{

    public InvalidInputException(ErrorCode errorCode) {
        super(errorCode);
    }

    public InvalidInputException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}
