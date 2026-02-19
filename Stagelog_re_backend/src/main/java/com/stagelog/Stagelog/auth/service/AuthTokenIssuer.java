package com.stagelog.Stagelog.auth.service;

import com.stagelog.Stagelog.auth.dto.AuthTokenResult;
import com.stagelog.Stagelog.global.jwt.JwtProperties;
import com.stagelog.Stagelog.global.jwt.JwtTokenProvider;
import com.stagelog.Stagelog.global.jwt.RefreshTokenHasher;
import com.stagelog.Stagelog.global.jwt.repository.RefreshTokenRepository;
import com.stagelog.Stagelog.user.domain.User;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 토큰 신규 발급 전용 컴포넌트 (DIP 준수).
 *
 * <p>외부(컨트롤러·핸들러)는 {@link #issueFor(User)}만 호출한다.
 * {@link #createTokenPair}는 같은 패키지의 {@code AuthService.refresh()} 전용 헬퍼이며
 * 외부에서 직접 호출하면 refresh token이 DB에 저장되지 않아 회전 정책이 깨진다.
 */
@Component
@RequiredArgsConstructor
public class AuthTokenIssuer {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final RefreshTokenHasher refreshTokenHasher;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 신규 토큰 발급: access + refresh 생성 → refresh 해시 → DB upsert.
     * 자체 로그인 및 OAuth2 성공 핸들러에서 사용한다.
     */
    @Transactional
    public AuthTokenResult issueFor(User user) {
        String email = user.getEmail();
        String role = user.getRole().getValue();

        TokenPairWithHash pair = createTokenPair(email, role);

        refreshTokenRepository.upsertByEmail(
                email,
                pair.refreshTokenHash(),
                LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenValidity() / 1000)
        );

        return AuthTokenResult.of(
                pair.accessToken(),
                pair.refreshToken(),
                user.getId(),
                email,
                user.getNickname()
        );
    }

    /**
     * 토큰 생성 + 해시 계산만 수행 (DB 저장 없음).
     * {@code AuthService.refresh()}의 rotation 헬퍼 — package-private.
     * 외부에서 직접 호출 금지: 반드시 {@link #issueFor(User)}를 사용할 것.
     */
    TokenPairWithHash createTokenPair(String email, String role) {
        String accessToken = jwtTokenProvider.createAccessToken(email, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(email, role);
        String refreshTokenHash = refreshTokenHasher.hash(refreshToken);
        return new TokenPairWithHash(accessToken, refreshToken, refreshTokenHash);
    }
}
