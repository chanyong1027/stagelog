package com.stagelog.Stagelog.auth.service;

import com.stagelog.Stagelog.auth.dto.LoginRequest;
import com.stagelog.Stagelog.auth.dto.OAuth2LoginRequest;
import com.stagelog.Stagelog.auth.dto.SignupRequest;
import com.stagelog.Stagelog.auth.dto.TokenResponse;
import com.stagelog.Stagelog.global.exception.DuplicateEntityException;
import com.stagelog.Stagelog.global.exception.EntityNotFoundException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.UnauthorizedException;
import com.stagelog.Stagelog.global.jwt.JwtProperties;
import com.stagelog.Stagelog.global.jwt.JwtTokenProvider;
import com.stagelog.Stagelog.global.jwt.domain.RefreshToken;
import com.stagelog.Stagelog.global.jwt.repository.RefreshTokenRepository;
import com.stagelog.Stagelog.user.domain.User;
import com.stagelog.Stagelog.user.repository.UserRepository;
import com.stagelog.Stagelog.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Boolean existUser(String userId) {
        return userRepository.existsByUserId(userId);
    }

    @Transactional
    public Long signUp(SignupRequest request) {
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new DuplicateEntityException(ErrorCode.USER_ALREADY_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntityException(ErrorCode.USER_ALREADY_EXISTS);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.createLocalUser(
                request.getUserId(),
                encodedPassword,
                request.getNickname(),
                request.getEmail()
        );
        return userRepository.save(user).getId();
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(ErrorCode.INVALID_PASSWORD);
        }

        user.updateLastLoginAt();

        return issueTokens(user);
    }

    @Transactional
    public TokenResponse loginWithOAuth2(OAuth2LoginRequest request) {
        User user = userService.getOrCreateUser(
                request.getEmail(),
                request.getNickname(),
                request.getProfileImageUrl(),
                request.getProvider(),
                request.getProviderId()
        );

        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshTokenValue) {
        if (!jwtTokenProvider.validateToken(refreshTokenValue)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (!jwtTokenProvider.isRefreshToken(refreshTokenValue)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshToken storedToken = refreshTokenRepository.findByRefreshToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        String email = jwtTokenProvider.getEmail(refreshTokenValue);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

        String role = user.getRole().getValue();
        String newAccessToken = jwtTokenProvider.createAccessToken(email, role);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(email, role);

        // Refresh Token Rotation
        storedToken.rotate(newRefreshToken, jwtProperties.getRefreshTokenValidity());

        return TokenResponse.of(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getNickname()
        );
    }

    @Transactional
    public void logout(String email) {
        refreshTokenRepository.deleteByEmail(email);
    }

    private TokenResponse issueTokens(User user) {
        String email = user.getEmail();
        String role = user.getRole().getValue();

        String accessToken = jwtTokenProvider.createAccessToken(email, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(email, role);

        // 기존 Refresh Token이 있으면 교체, 없으면 새로 생성
        refreshTokenRepository.findByEmail(email)
                .ifPresentOrElse(
                        token -> token.rotate(refreshToken, jwtProperties.getRefreshTokenValidity()),
                        () -> refreshTokenRepository.save(
                                RefreshToken.create(email, refreshToken, jwtProperties.getRefreshTokenValidity())
                        )
                );

        return TokenResponse.of(
                accessToken,
                refreshToken,
                user.getId(),
                email,
                user.getNickname()
        );
    }
}
