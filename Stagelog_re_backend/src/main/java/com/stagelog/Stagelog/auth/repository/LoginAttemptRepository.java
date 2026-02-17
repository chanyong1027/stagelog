package com.stagelog.Stagelog.auth.repository;

import com.stagelog.Stagelog.auth.domain.LoginAttempt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    Optional<LoginAttempt> findByUserIdAndClientIp(String userId, String clientIp);

    void deleteByUserIdAndClientIp(String userId, String clientIp);
}
