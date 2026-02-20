package com.stagelog.Stagelog.user.domain;

import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE("활성"),
    DELETED("탈퇴"),
    SUSPENDED("정지");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }
}
