package com.stagelog.Stagelog.user.domain;

import com.stagelog.Stagelog.global.entity.BaseEntity;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.InvalidInputException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Check(constraints = "(social_provider_type = 'LOCAL' AND password IS NOT NULL) OR "
        + "(social_provider_type <> 'LOCAL' AND password IS NULL)")
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"provider", "provider_id"})
        }
)
public class User extends BaseEntity {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = false, updatable = false)
    private String userId;

    @Column
    private String password;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_provider_type", nullable = false)
    private Provider provider;

    @Column(name = "provider_id")
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_status", nullable = false)
    private UserStatus status;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "email_notification_enabled", nullable = false)
    private Boolean emailNotificationEnabled;

    @Column(name = "is_social", nullable = false)
    private Boolean isSocial;

    public static User createSocialUser(
            String email,
            String nickname,
            String profileImageUrl,
            Provider provider,
            String providerId
    ) {
        validateEmail(email);
        validateNickname(nickname);
        validateProvider(provider, providerId);

        User user = new User();
        user.email = email;
        user.userId = provider.name().toLowerCase() + "_" + providerId;
        user.password = null;
        user.nickname = nickname;
        user.profileImageUrl = profileImageUrl;
        user.provider = provider;
        user.providerId = providerId;
        user.role = Role.USER;
        user.status = UserStatus.ACTIVE;
        user.emailNotificationEnabled = true;
        user.isSocial = true;
        return user;
    }

    public static User createLocalUser(String userId, String encodedPassword, String nickname, String email) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if (encodedPassword == null || encodedPassword.isBlank()) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
        validateNickname(nickname);
        validateEmail(email);

        User user = new User();
        user.userId = userId;
        user.password = encodedPassword;
        user.nickname = nickname;
        user.email = email;
        user.provider = Provider.LOCAL;
        user.providerId = userId;
        user.role = Role.USER;
        user.status = UserStatus.ACTIVE;
        user.emailNotificationEnabled = true;
        user.isSocial = false;
        return user;
    }

    public void updateLastLoginAt() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public void updateProfile(String nickname, String profileImageUrl, Boolean emailNotificationEnabled) {
        if (nickname != null) {
            validateNickname(nickname);
            this.nickname = nickname;
        }
        if (profileImageUrl != null) {
            this.profileImageUrl = profileImageUrl;
        }
        if (emailNotificationEnabled != null) {
            this.emailNotificationEnabled = emailNotificationEnabled;
        }
    }

    public void delete() {
        this.status = UserStatus.DELETED;
    }

    public void suspend() {
        this.status = UserStatus.SUSPENDED;
    }

    public void activate() {
        this.status = UserStatus.ACTIVE;
    }

    private static void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new InvalidInputException(ErrorCode.INVALID_EMAIL_FORMAT);
        }
    }

    private static void validateNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if (nickname.length() < 2 || nickname.length() > 20) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
    }

    private static void validateProvider(Provider provider, String providerId) {
        if (provider == null || providerId == null || providerId.isBlank()) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if (provider == Provider.LOCAL) {
            throw new InvalidInputException(ErrorCode.INVALID_INPUT_VALUE);
        }
    }
}
