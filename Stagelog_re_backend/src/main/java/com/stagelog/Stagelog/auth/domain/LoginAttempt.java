package com.stagelog.Stagelog.auth.domain;

import com.stagelog.Stagelog.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "login_attempts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "client_ip"})
        }
)
public class LoginAttempt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "client_ip", nullable = false, length = 64)
    private String clientIp;

    @Column(name = "fail_count", nullable = false)
    private int failCount;

    @Column(name = "first_failed_at", nullable = false)
    private LocalDateTime firstFailedAt;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    public static LoginAttempt create(String userId, String clientIp, LocalDateTime failedAt) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.userId = userId;
        attempt.clientIp = clientIp;
        attempt.failCount = 1;
        attempt.firstFailedAt = failedAt;
        attempt.lockedUntil = null;
        return attempt;
    }

    public void recordFailure(
            LocalDateTime failedAt,
            int maxFailureCount,
            Duration failureWindow,
            Duration lockDuration
    ) {
        if (isLockExpired(failedAt) || isFailureWindowExpired(failedAt, failureWindow)) {
            resetFailures(failedAt);
            return;
        }

        this.failCount += 1;
        if (this.failCount >= maxFailureCount) {
            this.lockedUntil = failedAt.plus(lockDuration);
        }
    }

    public boolean isLocked(LocalDateTime now) {
        return this.lockedUntil != null && this.lockedUntil.isAfter(now);
    }

    public boolean isLockExpired(LocalDateTime now) {
        return this.lockedUntil != null && !this.lockedUntil.isAfter(now);
    }

    public boolean isFailureWindowExpired(LocalDateTime now, Duration failureWindow) {
        return this.firstFailedAt.plus(failureWindow).isBefore(now);
    }

    private void resetFailures(LocalDateTime failedAt) {
        this.failCount = 1;
        this.firstFailedAt = failedAt;
        this.lockedUntil = null;
    }
}
