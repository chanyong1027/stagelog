package com.stagelog.Stagelog.user.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stagelog.Stagelog.global.exception.InvalidInputException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    @DisplayName("소셜 회원 생성 시 password는 null로 저장된다")
    void createSocialUser_setsPasswordNull() {
        User user = User.createSocialUser(
                "social@example.com",
                "socialUser",
                "https://example.com/image.png",
                Provider.GOOGLE,
                "google-123"
        );

        assertThat(user.getPassword()).isNull();
        assertThat(user.getProvider()).isEqualTo(Provider.GOOGLE);
        assertThat(user.getIsSocial()).isTrue();
    }

    @Test
    @DisplayName("소셜 회원 생성에 LOCAL provider를 전달하면 예외가 발생한다")
    void createSocialUser_withLocalProvider_throwsInvalidInput() {
        assertThatThrownBy(() -> User.createSocialUser(
                "local@example.com",
                "localUser",
                null,
                Provider.LOCAL,
                "local-1"
        )).isInstanceOf(InvalidInputException.class);
    }
}
