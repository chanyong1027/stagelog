package com.stagelog.Stagelog.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

import com.stagelog.Stagelog.auth.dto.LoginRequest;
import com.stagelog.Stagelog.auth.dto.OAuth2LoginRequest;
import com.stagelog.Stagelog.auth.dto.AuthTokenResult;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.UnauthorizedException;
import com.stagelog.Stagelog.global.jwt.JwtProperties;
import com.stagelog.Stagelog.global.jwt.JwtTokenProvider;
import com.stagelog.Stagelog.global.jwt.RefreshTokenHasher;
import com.stagelog.Stagelog.global.jwt.domain.RefreshToken;
import com.stagelog.Stagelog.global.jwt.repository.RefreshTokenRepository;
import com.stagelog.Stagelog.user.domain.Provider;
import com.stagelog.Stagelog.user.domain.Role;
import com.stagelog.Stagelog.user.domain.User;
import com.stagelog.Stagelog.user.domain.UserStatus;
import com.stagelog.Stagelog.user.repository.UserRepository;
import com.stagelog.Stagelog.user.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenHasher refreshTokenHasher;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private LoginAttemptService loginAttemptService;
    @Mock
    private AuthTokenIssuer authTokenIssuer;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setAccessTokenValidity(3600000L);
        jwtProperties.setRefreshTokenValidity(1209600000L);
        authService = new AuthService(
                userRepository,
                userService,
                jwtTokenProvider,
                jwtProperties,
                refreshTokenHasher,
                refreshTokenRepository,
                passwordEncoder,
                loginAttemptService,
                authTokenIssuer
        );
    }

    @Test
    @DisplayName("존재하지 않는 userId로 로그인하면 실패 횟수를 기록하고 공통 인증 실패를 반환한다")
    void login_withUnknownUserId_recordsFailureAndThrowsInvalidCredentials() {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getUserId()).thenReturn("ghost");
        when(userRepository.findByUserId("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_INVALID_CREDENTIALS);
                });

        verify(loginAttemptService).validateNotLocked("ghost", "127.0.0.1");
        verify(loginAttemptService).recordFailure("ghost", "127.0.0.1");
        verify(loginAttemptService, never()).clearFailures("ghost", "127.0.0.1");
    }

    @Test
    @DisplayName("비밀번호가 틀리면 실패 횟수를 기록하고 공통 인증 실패를 반환한다")
    void login_withWrongPassword_recordsFailureAndThrowsInvalidCredentials() {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getUserId()).thenReturn("user1");
        when(request.getPassword()).thenReturn("wrong-password");

        User user = mock(User.class);
        when(user.getPassword()).thenReturn("encoded-password");
        when(userRepository.findByUserId("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_INVALID_CREDENTIALS);
                });

        verify(loginAttemptService).validateNotLocked("user1", "127.0.0.1");
        verify(loginAttemptService).recordFailure("user1", "127.0.0.1");
        verify(loginAttemptService, never()).clearFailures("user1", "127.0.0.1");
    }

    @Test
    @DisplayName("소셜 계정처럼 비밀번호가 null인 사용자는 로컬 로그인에 실패한다")
    void login_withNullPassword_failsAsInvalidCredentials() {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getUserId()).thenReturn("social-user");
        when(request.getPassword()).thenReturn("any-password");

        User user = mock(User.class);
        when(user.getPassword()).thenReturn(null);
        when(userRepository.findByUserId("social-user")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_INVALID_CREDENTIALS);
                });

        verify(loginAttemptService).validateNotLocked("social-user", "127.0.0.1");
        verify(loginAttemptService).recordFailure("social-user", "127.0.0.1");
        verify(loginAttemptService, never()).clearFailures("social-user", "127.0.0.1");
        verify(passwordEncoder, never()).matches("any-password", null);
    }

    @Test
    @DisplayName("정지 계정은 비밀번호가 맞아도 토큰 발급이 차단된다")
    void login_withSuspendedUser_throwsAccountBlocked() {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getUserId()).thenReturn("suspended-user");
        when(request.getPassword()).thenReturn("correct-password");

        User user = mock(User.class);
        when(user.getPassword()).thenReturn("encoded-password");
        when(user.getStatus()).thenReturn(UserStatus.SUSPENDED);
        when(userRepository.findByUserId("suspended-user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_ACCOUNT_BLOCKED);
                });

        verify(loginAttemptService).validateNotLocked("suspended-user", "127.0.0.1");
        verify(loginAttemptService, never()).recordFailure("suspended-user", "127.0.0.1");
        verify(loginAttemptService, never()).clearFailures("suspended-user", "127.0.0.1");
        verify(user, never()).updateLastLoginAt();
        verify(authTokenIssuer, never()).issueFor(any());
    }

    @Test
    @DisplayName("로그인 시도 제한에 걸리면 사용자 조회 전에 429 에러를 반환한다")
    void login_whenLocked_throwsTooManyAttemptsBeforeUserLookup() {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getUserId()).thenReturn("user1");
        doThrow(new UnauthorizedException(ErrorCode.AUTH_TOO_MANY_ATTEMPTS))
                .when(loginAttemptService).validateNotLocked("user1", "127.0.0.1");

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_TOO_MANY_ATTEMPTS);
                });

        verify(userRepository, never()).findByUserId("user1");
        verify(loginAttemptService, never()).recordFailure("user1", "127.0.0.1");
    }

    @Test
    @DisplayName("refresh는 해시된 토큰으로 조회하고 새 refresh 해시로 rotation 한다")
    void refresh_rotatesStoredHashAfterLookupByHashedToken() {
        String oldRefreshToken = "old-refresh-token";
        String oldRefreshHash = "old-refresh-hash";
        String newRefreshToken = "new-refresh-token";
        String newRefreshHash = "new-refresh-hash";
        String email = "user@example.com";

        RefreshToken storedToken = mock(RefreshToken.class);
        User user = mock(User.class);

        when(jwtTokenProvider.validateToken(oldRefreshToken)).thenReturn(true);
        when(jwtTokenProvider.isRefreshToken(oldRefreshToken)).thenReturn(true);
        when(refreshTokenHasher.hash(oldRefreshToken)).thenReturn(oldRefreshHash);
        when(refreshTokenRepository.findByRefreshTokenHash(oldRefreshHash)).thenReturn(Optional.of(storedToken));
        when(storedToken.isExpired()).thenReturn(false);
        when(jwtTokenProvider.getEmail(oldRefreshToken)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(user.getStatus()).thenReturn(UserStatus.ACTIVE);
        when(user.getRole()).thenReturn(Role.USER);
        when(user.getId()).thenReturn(1L);
        when(user.getEmail()).thenReturn(email);
        when(user.getNickname()).thenReturn("tester");
        // AuthTokenIssuer.createTokenPair()은 package-private — 같은 패키지에서 stubbing 가능
        when(authTokenIssuer.createTokenPair(email, Role.USER.getValue()))
                .thenReturn(new TokenPairWithHash("new-access-token", newRefreshToken, newRefreshHash));

        AuthTokenResult result = authService.refresh(oldRefreshToken);

        assertThat(result.accessToken()).isEqualTo("new-access-token");
        assertThat(result.refreshToken()).isEqualTo(newRefreshToken);
        verify(refreshTokenRepository).findByRefreshTokenHash(oldRefreshHash);
        verify(storedToken).rotate(newRefreshHash, 1209600000L);
    }

    @Test
    @DisplayName("OAuth2 로그인에서 정지 계정은 토큰 발급이 차단된다")
    void loginWithOAuth2_withSuspendedUser_throwsAccountBlocked() {
        OAuth2LoginRequest request = new OAuth2LoginRequest(
                Provider.GOOGLE,
                "google-123",
                "social@example.com",
                "social-user",
                "https://example.com/profile.png"
        );

        User user = mock(User.class);
        when(userService.getOrCreateUser(
                request.getEmail(),
                request.getNickname(),
                request.getProfileImageUrl(),
                request.getProvider(),
                request.getProviderId()
        )).thenReturn(user);
        when(user.getStatus()).thenReturn(UserStatus.SUSPENDED);

        assertThatThrownBy(() -> authService.loginWithOAuth2(request))
                .isInstanceOf(UnauthorizedException.class)
                .satisfies(throwable -> {
                    UnauthorizedException exception = (UnauthorizedException) throwable;
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_ACCOUNT_BLOCKED);
                });

        verify(authTokenIssuer, never()).issueFor(any());
    }
}
