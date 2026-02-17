package com.stagelog.Stagelog.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

import com.stagelog.Stagelog.auth.dto.LoginRequest;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.UnauthorizedException;
import com.stagelog.Stagelog.global.jwt.JwtProperties;
import com.stagelog.Stagelog.global.jwt.JwtTokenProvider;
import com.stagelog.Stagelog.global.jwt.RefreshTokenHasher;
import com.stagelog.Stagelog.global.jwt.repository.RefreshTokenRepository;
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

    private AuthService authService;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        authService = new AuthService(
                userRepository,
                userService,
                jwtTokenProvider,
                jwtProperties,
                refreshTokenHasher,
                refreshTokenRepository,
                passwordEncoder,
                loginAttemptService
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
}
