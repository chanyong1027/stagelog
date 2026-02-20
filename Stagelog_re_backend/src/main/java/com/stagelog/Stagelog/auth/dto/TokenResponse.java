package com.stagelog.Stagelog.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String nickname;

    public static TokenResponse of(String accessToken, Long userId, String email, String nickname) {
        return new TokenResponse(accessToken, "Bearer", userId, email, nickname);
    }
}
