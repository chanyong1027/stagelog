package com.stagelog.Stagelog.user.domain;

import lombok.Getter;

@Getter
public enum Provider {
    LOCAL("Local"),
    KAKAO("Kakao"),
    GOOGLE("Google"),
    NAVER("Naver");

    private final String description;

    Provider(String description) {
        this.description = description;
    }
}
