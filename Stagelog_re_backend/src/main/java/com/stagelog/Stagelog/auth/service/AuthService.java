package com.stagelog.Stagelog.auth.service;

import com.stagelog.Stagelog.auth.dto.LoginRequest;
import com.stagelog.Stagelog.auth.dto.SignupRequest;
import com.stagelog.Stagelog.auth.dto.AuthTokenResult;
import com.stagelog.Stagelog.global.exception.DuplicateEntityException;
import com.stagelog.Stagelog.global.exception.EntityNotFoundException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.UnauthorizedException;
import com.stagelog.Stagelog.global.jwt.JwtProperties;
import com.stagelog.Stagelog.global.jwt.JwtTokenProvider;
import com.stagelog.Stagelog.global.jwt.RefreshTokenHasher;
import com.stagelog.Stagelog.global.jwt.domain.RefreshToken;
import com.stagelog.Stagelog.global.jwt.repository.RefreshTokenRepository;
import com.stagelog.Stagelog.user.domain.User;
import com.stagelog.Stagelog.user.domain.UserStatus;
import com.stagelog.Stagelog.user.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final RefreshTokenHasher refreshTokenHasher;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;
    private final AuthTokenIssuer authTokenIssuer;

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
    public AuthTokenResult login(LoginRequest request, String clientIp) {
        String userId = request.getUserId();
        loginAttemptService.validateNotLocked(userId, clientIp);

        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            loginAttemptService.recordFailure(userId, clientIp);
            throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }
        User user = userOpt.get();

        if (!isValidPassword(request.getPassword(), user.getPassword())) {
            loginAttemptService.recordFailure(userId, clientIp);
            throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        assertActiveUser(user);
        loginAttemptService.clearFailures(userId, clientIp);
        user.updateLastLoginAt();

        return authTokenIssuer.issueFor(user);
    }

    @Transactional
    public AuthTokenResult refresh(String refreshTokenValue) {
        if (!StringUtils.hasText(refreshTokenValue)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (!jwtTokenProvider.validateToken(refreshTokenValue)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (!jwtTokenProvider.isRefreshToken(refreshTokenValue)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String refreshTokenHash = refreshTokenHasher.hash(refreshTokenValue);
        RefreshToken storedToken = refreshTokenRepository.findByRefreshTokenHash(refreshTokenHash)
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        String email = jwtTokenProvider.getEmail(refreshTokenValue);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.ACTIVE) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException(ErrorCode.AUTH_ACCOUNT_BLOCKED);
        }

        String role = user.getRole().getValue();
        TokenPairWithHash pair = authTokenIssuer.createTokenPair(email, role);

        // Refresh Token Rotation
        storedToken.rotate(pair.refreshTokenHash(), jwtProperties.getRefreshTokenValidity());

        return AuthTokenResult.of(
                pair.accessToken(),
                pair.refreshToken(),
                user.getId(),
                user.getEmail(),
                user.getNickname()
        );
    }

    @Transactional
    public void logout(String email) {
        refreshTokenRepository.deleteByEmail(email);
    }

    private boolean isValidPassword(String rawPassword, String encodedPassword) {
        if (!StringUtils.hasText(encodedPassword)) {
            return false;
        }
        try {
            return passwordEncoder.matches(rawPassword, encodedPassword);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private void assertActiveUser(User user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException(ErrorCode.AUTH_ACCOUNT_BLOCKED);
        }
    }
}
