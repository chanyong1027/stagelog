package com.stagelog.Stagelog.global.jwt;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class RefreshTokenHasher {
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final JwtProperties jwtProperties;

    @PostConstruct
    public void validatePepper() {
        if (!StringUtils.hasText(jwtProperties.getRefreshTokenPepper())) {
            throw new IllegalStateException("jwt.refresh-token-pepper must be configured.");
        }
    }

    public String hash(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return "";
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(
                    jwtProperties.getRefreshTokenPepper().getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGORITHM
            );
            mac.init(keySpec);
            byte[] digest = mac.doFinal(refreshToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to hash refresh token.", e);
        }
    }
}
