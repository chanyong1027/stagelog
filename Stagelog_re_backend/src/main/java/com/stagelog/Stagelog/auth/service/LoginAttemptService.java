package com.stagelog.Stagelog.auth.service;

import com.stagelog.Stagelog.auth.domain.LoginAttempt;
import com.stagelog.Stagelog.auth.repository.LoginAttemptRepository;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.UnauthorizedException;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {
    private static final int MAX_FAILURE_COUNT = 5;
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(10);
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final LoginAttemptRepository loginAttemptRepository;

    @Transactional(readOnly = true)
    public void validateNotLocked(String userId, String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        loginAttemptRepository.findByUserIdAndClientIp(userId, clientIp)
                .ifPresent(attempt -> {
                    if (attempt.isLocked(now)) {
                        throw new UnauthorizedException(ErrorCode.AUTH_TOO_MANY_ATTEMPTS);
                    }
                });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String userId, String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        LoginAttempt attempt = loginAttemptRepository.findByUserIdAndClientIp(userId, clientIp)
                .orElseGet(() -> LoginAttempt.create(userId, clientIp, now));

        attempt.recordFailure(now, MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);

        if (attempt.getId() == null) {
            loginAttemptRepository.save(attempt);
        }
    }

    @Transactional
    public void clearFailures(String userId, String clientIp) {
        loginAttemptRepository.deleteByUserIdAndClientIp(userId, clientIp);
    }
}
