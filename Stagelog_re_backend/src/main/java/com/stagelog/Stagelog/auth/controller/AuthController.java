package com.stagelog.Stagelog.auth.controller;

import com.stagelog.Stagelog.auth.cookie.RefreshTokenCookieManager;
import com.stagelog.Stagelog.auth.dto.LoginRequest;
import com.stagelog.Stagelog.auth.dto.OAuth2LoginRequest;
import com.stagelog.Stagelog.auth.dto.SignupRequest;
import com.stagelog.Stagelog.auth.dto.TokenResponse;
import com.stagelog.Stagelog.auth.dto.AuthTokenResult;
import com.stagelog.Stagelog.auth.service.AuthService;
import com.stagelog.Stagelog.global.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieManager refreshTokenCookieManager;

    @GetMapping("/check-userid")
    public ResponseEntity<Boolean> checkUserId(@RequestParam String userId) {
        return ResponseEntity.ok(authService.existUser(userId));
    }

    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@Valid @RequestBody SignupRequest request) {
        Long id = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthTokenResult result = authService.login(request);
        refreshTokenCookieManager.addRefreshTokenCookie(httpResponse, result.refreshToken());
        return ResponseEntity.ok(result.toTokenResponse());
    }

    @PostMapping("/oauth2/login")
    public ResponseEntity<TokenResponse> oauth2Login(
            @Valid @RequestBody OAuth2LoginRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthTokenResult result = authService.loginWithOAuth2(request);
        refreshTokenCookieManager.addRefreshTokenCookie(httpResponse, result.refreshToken());
        return ResponseEntity.ok(result.toTokenResponse());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = refreshTokenCookieManager.resolveRefreshTokenFromCookie(request);
        AuthTokenResult result = authService.refresh(refreshToken);
        refreshTokenCookieManager.addRefreshTokenCookie(response, result.refreshToken());
        return ResponseEntity.ok(result.toTokenResponse());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletResponse response
    ) {
        authService.logout(userDetails.getUsername());
        refreshTokenCookieManager.expireRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }
}
