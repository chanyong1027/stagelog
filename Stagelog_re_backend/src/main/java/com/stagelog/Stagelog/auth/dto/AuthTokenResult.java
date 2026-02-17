package com.stagelog.Stagelog.auth.dto;

public record AuthTokenResult(
        String accessToken,
        String refreshToken,
        Long userId,
        String email,
        String nickname
) {
    public static AuthTokenResult of(
            String accessToken,
            String refreshToken,
            Long userId,
            String email,
            String nickname
    ) {
        return new AuthTokenResult(accessToken, refreshToken, userId, email, nickname);
    }

    public TokenResponse toTokenResponse() {
        return TokenResponse.of(accessToken, userId, email, nickname);
    }
}
