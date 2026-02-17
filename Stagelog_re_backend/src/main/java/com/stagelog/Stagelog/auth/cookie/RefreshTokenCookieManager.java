package com.stagelog.Stagelog.auth.cookie;

import com.stagelog.Stagelog.global.jwt.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class RefreshTokenCookieManager {
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

    private static final String REFRESH_TOKEN_COOKIE_PATH = "/api/auth/refresh";
    private static final String LOCAL_DEFAULT_SAME_SITE = "Lax";
    private static final String PROD_DEFAULT_SAME_SITE = "None";
    private static final Set<String> PROD_PROFILE_NAMES = Set.of("prod", "production");

    private final JwtProperties jwtProperties;
    private final AuthCookieProperties authCookieProperties;
    private final Environment environment;

    public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Duration maxAge = Duration.ofMillis(jwtProperties.getRefreshTokenValidity());
        ResponseCookie cookie = buildCookie(refreshToken, maxAge);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void expireRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie expiredCookie = buildCookie("", Duration.ZERO);
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
    }

    public String resolveRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private ResponseCookie buildCookie(String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(resolveSecure())
                .sameSite(resolveSameSite())
                .path(REFRESH_TOKEN_COOKIE_PATH)
                .maxAge(maxAge);

        if (StringUtils.hasText(authCookieProperties.getDomain())) {
            builder.domain(authCookieProperties.getDomain());
        }
        return builder.build();
    }

    private boolean resolveSecure() {
        if (authCookieProperties.getSecure() != null) {
            return authCookieProperties.getSecure();
        }
        return isProductionProfile();
    }

    private String resolveSameSite() {
        if (StringUtils.hasText(authCookieProperties.getSameSite())) {
            return authCookieProperties.getSameSite();
        }
        return isProductionProfile() ? PROD_DEFAULT_SAME_SITE : LOCAL_DEFAULT_SAME_SITE;
    }

    private boolean isProductionProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .anyMatch(PROD_PROFILE_NAMES::contains);
    }
}
