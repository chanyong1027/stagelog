package com.stagelog.Stagelog.global.jwt.repository;

import com.stagelog.Stagelog.global.jwt.domain.RefreshToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByEmail(String email);

    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    void deleteByEmail(String email);
}
