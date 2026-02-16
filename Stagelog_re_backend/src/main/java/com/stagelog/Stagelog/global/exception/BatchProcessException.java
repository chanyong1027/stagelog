package com.stagelog.Stagelog.global.exception;

public class BatchProcessException extends BusinessException {

    public BatchProcessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BatchProcessException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    public BatchProcessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
