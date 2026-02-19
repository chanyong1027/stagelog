package com.stagelog.Stagelog.auth.oauth2.handler;

import com.stagelog.Stagelog.auth.oauth2.repository.CookieAuthorizationRequestRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * OAuth2 인증 실패 시 에러코드를 파라미터로 붙여 프런트로 리다이렉트한다.
 *
 * <p>리다이렉트: {@code {FRONTEND_REDIRECT_URI}?error={errorCode}}
 * <p>내부 로그에는 상세 원인을 기록하고 외부 응답은 최소화한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final CookieAuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Value("${app.auth.frontend-redirect-uri}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        String errorCode = resolveErrorCode(exception);
        log.warn("OAuth2 로그인 실패: errorCode={}, cause={}", errorCode, exception.getMessage());

        cookieAuthorizationRequestRepository.deleteCookie(response);

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("error", errorCode)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    /**
     * OAuth2AuthenticationException이면 우리가 설정한 에러코드(AUTH_00x)를 사용.
     * Spring Security 자체 예외면 기본 provider 에러코드로 대체.
     */
    private String resolveErrorCode(AuthenticationException exception) {
        if (exception instanceof OAuth2AuthenticationException oauthEx) {
            return oauthEx.getError().getErrorCode();
        }
        return "AUTH_OAUTH2_PROVIDER_ERROR";
    }
}
