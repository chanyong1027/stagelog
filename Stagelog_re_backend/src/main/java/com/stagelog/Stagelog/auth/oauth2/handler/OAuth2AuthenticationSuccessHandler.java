package com.stagelog.Stagelog.auth.oauth2.handler;

import com.stagelog.Stagelog.auth.cookie.RefreshTokenCookieManager;
import com.stagelog.Stagelog.auth.dto.AuthTokenResult;
import com.stagelog.Stagelog.auth.oauth2.repository.CookieAuthorizationRequestRepository;
import com.stagelog.Stagelog.auth.oauth2.service.CustomOAuth2User;
import com.stagelog.Stagelog.auth.service.AuthTokenIssuer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

/**
 * OAuth2 인증 성공 후 refresh 쿠키를 심고 프런트로 리다이렉트한다.
 *
 * <p>프런트는 쿠키 존재 여부로 성공을 판단하고,
 * 이후 {@code POST /api/auth/refresh}로 access token을 부트스트랩한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthTokenIssuer authTokenIssuer;
    private final RefreshTokenCookieManager refreshTokenCookieManager;
    private final CookieAuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Value("${app.auth.frontend-redirect-uri}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        AuthTokenResult result = authTokenIssuer.issueFor(oAuth2User.getUser());

        refreshTokenCookieManager.addRefreshTokenCookie(response, result.refreshToken());
        cookieAuthorizationRequestRepository.deleteCookie(response);

        log.info("OAuth2 로그인 성공: userId={}", oAuth2User.getUser().getId());
        getRedirectStrategy().sendRedirect(request, response, frontendRedirectUri);
    }
}
