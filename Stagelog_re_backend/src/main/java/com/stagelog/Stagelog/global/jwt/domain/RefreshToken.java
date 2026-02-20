package com.stagelog.Stagelog.global.jwt.domain;

import com.stagelog.Stagelog.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "refresh_token_hash", nullable = false, length = 128)
    private String refreshTokenHash;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public static RefreshToken create(String email, String refreshTokenHash, Long validityMillis) {
        RefreshToken token = new RefreshToken();
        token.email = email;
        token.refreshTokenHash = refreshTokenHash;
        token.expiryDate = LocalDateTime.now().plusSeconds(validityMillis / 1000);
        return token;
    }

    public void rotate(String newRefreshTokenHash, Long validityMillis) {
        this.refreshTokenHash = newRefreshTokenHash;
        this.expiryDate = LocalDateTime.now().plusSeconds(validityMillis / 1000);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
