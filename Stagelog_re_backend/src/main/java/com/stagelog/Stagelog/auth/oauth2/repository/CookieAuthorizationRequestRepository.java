package com.stagelog.Stagelog.auth.oauth2.repository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * STATELESS 환경에서 OAuth2 인가 요청(state 포함)을 HttpOnly 쿠키에 저장한다.
 *
 * Spring Security 기본 구현(HttpSessionOAuth2AuthorizationRequestRepository)은 세션을 사용하므로
 * SessionCreationPolicy.STATELESS 환경에서 state 검증이 실패한다.
 * 이 클래스는 state를 쿠키로 보존해 CSRF 방어를 유지한다.
 *
 * SameSite=Lax: OAuth2 콜백은 소셜 플랫폼 → 우리 서버로의 top-level GET 리다이렉트이므로
 * Lax 정책에서도 쿠키가 정상 전달된다.
 */
@Slf4j
@Component
public class CookieAuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 180; // OAuth2 플로우 완료에 충분한 3분

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return readCookie(request, COOKIE_NAME)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(response);
            return;
        }
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, serialize(authorizationRequest))
                .path("/")
                .httpOnly(true)
                .maxAge(COOKIE_EXPIRE_SECONDS)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        deleteCookie(response);
        return authorizationRequest;
    }

    /**
     * 성공/실패 핸들러에서 OAuth2 플로우 완료 후 쿠키를 명시적으로 삭제할 때 사용한다.
     */
    public void deleteCookie(HttpServletResponse response) {
        ResponseCookie expiredCookie = ResponseCookie.from(COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
    }

    private Optional<String> readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .filter(StringUtils::hasText)
                .findFirst();
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(request);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("OAuth2AuthorizationRequest 직렬화 실패", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
                return (OAuth2AuthorizationRequest) ois.readObject();
            }
        } catch (Exception e) {
            // 쿠키가 손상됐거나 만료된 경우 — state 불일치로 인증 실패 처리됨
            log.warn("OAuth2 state 쿠키 역직렬화 실패, 손상된 쿠키로 판단하여 null 반환");
            return null;
        }
    }
}
