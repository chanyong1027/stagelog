package com.stagelog.Stagelog.global.jwt.repository;

import com.stagelog.Stagelog.global.jwt.domain.RefreshToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByEmail(String email);

    Optional<RefreshToken> findByRefreshTokenHash(String refreshTokenHash);

    void deleteByEmail(String email);

    @Modifying
    @Query(value = """
            INSERT INTO refresh_tokens (email, refresh_token_hash, expiry_date, created_at, updated_at)
            VALUES (:email, :refreshTokenHash, :expiryDate, NOW(), NOW())
            ON CONFLICT (email)
            DO UPDATE SET refresh_token_hash = EXCLUDED.refresh_token_hash,
                          expiry_date = EXCLUDED.expiry_date,
                          updated_at = NOW()
            """, nativeQuery = true)
    void upsertByEmail(
            @Param("email") String email,
            @Param("refreshTokenHash") String refreshTokenHash,
            @Param("expiryDate") LocalDateTime expiryDate
    );
}
