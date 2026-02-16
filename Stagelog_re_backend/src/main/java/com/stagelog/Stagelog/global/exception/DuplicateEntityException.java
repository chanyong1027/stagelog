package com.stagelog.Stagelog.global.exception;

public class DuplicateEntityException extends BusinessException {

    public DuplicateEntityException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DuplicateEntityException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}
