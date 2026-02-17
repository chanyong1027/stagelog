package com.stagelog.Stagelog.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LoginAttemptTest {

    private static final int MAX_FAILURE_COUNT = 5;
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(10);
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    @Test
    @DisplayName("10분 윈도우 내 5회 실패 시 계정 잠금이 활성화된다")
    void recordFailure_withinWindow_locksAtFiveFailures() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 1, 1, 10, 0);
        LoginAttempt attempt = LoginAttempt.create("user1", "127.0.0.1", baseTime);

        attempt.recordFailure(baseTime.plusMinutes(1), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(2), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(3), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(4), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);

        assertThat(attempt.getFailCount()).isEqualTo(5);
        assertThat(attempt.isLocked(baseTime.plusMinutes(5))).isTrue();
    }

    @Test
    @DisplayName("잠금 만료 후 실패하면 카운터가 초기화되어 다시 1회부터 시작한다")
    void recordFailure_afterLockExpired_resetsCounter() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 1, 1, 10, 0);
        LoginAttempt attempt = LoginAttempt.create("user1", "127.0.0.1", baseTime);

        attempt.recordFailure(baseTime.plusMinutes(1), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(2), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(3), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);
        attempt.recordFailure(baseTime.plusMinutes(4), MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);

        LocalDateTime afterLockExpired = baseTime.plusMinutes(20);
        attempt.recordFailure(afterLockExpired, MAX_FAILURE_COUNT, FAILURE_WINDOW, LOCK_DURATION);

        assertThat(attempt.getFailCount()).isEqualTo(1);
        assertThat(attempt.isLocked(afterLockExpired)).isFalse();
    }
}
