package com.stagelog.Stagelog.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String nickname;

    public static TokenResponse of(String accessToken, String refreshToken, Long userId, String email, String nickname) {
        return new TokenResponse(accessToken, refreshToken, "Bearer", userId, email, nickname);
    }
}
