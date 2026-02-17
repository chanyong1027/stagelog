package com.stagelog.Stagelog.global.jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RefreshTokenHasherTest {

    private RefreshTokenHasher refreshTokenHasher;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setRefreshTokenPepper("test-refresh-token-pepper");
        refreshTokenHasher = new RefreshTokenHasher(jwtProperties);
    }

    @Test
    @DisplayName("빈 refresh token은 해시하지 않고 예외를 던진다")
    void hash_blankRefreshToken_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> refreshTokenHasher.hash(" "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("refreshToken must not be blank.");
    }

    @Test
    @DisplayName("같은 refresh token은 같은 해시를 생성한다")
    void hash_sameRefreshToken_returnsSameHash() {
        String refreshToken = "refresh-token-value";

        String hash1 = refreshTokenHasher.hash(refreshToken);
        String hash2 = refreshTokenHasher.hash(refreshToken);

        assertThat(hash1).isEqualTo(hash2);
    }
}
