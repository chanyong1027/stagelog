package com.stagelog.Stagelog.auth.oauth2.userinfo;

import static org.assertj.core.api.Assertions.assertThat;

import com.stagelog.Stagelog.user.domain.Provider;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class KakaoOAuth2UserInfoTest {

    @Test
    @DisplayName("provider()는 KAKAO를 반환한다")
    void provider_returnsKakao() {
        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(Map.of());
        assertThat(userInfo.provider()).isEqualTo(Provider.KAKAO);
    }

    @Test
    @DisplayName("id(Long)를 providerId(String)으로 변환한다")
    void providerId_convertsLongToString() {
        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(Map.of("id", 1234567890L));
        assertThat(userInfo.providerId()).isEqualTo("1234567890");
    }

    @Test
    @DisplayName("id가 없으면 providerId는 null을 반환한다")
    void providerId_returnsNullWhenIdMissing() {
        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(Map.of());
        assertThat(userInfo.providerId()).isNull();
    }

    @Test
    @DisplayName("kakao_account.email 필드를 이메일로 파싱한다")
    void email_parsesNestedField() {
        Map<String, Object> attrs = Map.of(
                "id", 123L,
                "kakao_account", Map.of("email", "user@kakao.com")
        );
        assertThat(new KakaoOAuth2UserInfo(attrs).email()).isEqualTo("user@kakao.com");
    }

    @Test
    @DisplayName("kakao_account가 없으면 email은 null을 반환한다")
    void email_returnsNullWhenKakaoAccountMissing() {
        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(Map.of("id", 123L));
        assertThat(userInfo.email()).isNull();
    }

    @Test
    @DisplayName("email 동의를 받지 않았으면 null을 반환한다")
    void email_returnsNullWhenEmailNotInAccount() {
        Map<String, Object> attrs = Map.of(
                "id", 123L,
                "kakao_account", Map.of("profile_needs_agreement", false)
        );
        assertThat(new KakaoOAuth2UserInfo(attrs).email()).isNull();
    }

    @Test
    @DisplayName("kakao_account.profile.nickname 필드를 닉네임으로 파싱한다")
    void nickname_parsesNestedField() {
        Map<String, Object> profile = Map.of("nickname", "홍길동", "profile_image_url", "https://img.kakao.com/123.jpg");
        Map<String, Object> kakaoAccount = Map.of("email", "user@kakao.com", "profile", profile);
        Map<String, Object> attrs = Map.of("id", 123L, "kakao_account", kakaoAccount);

        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(attrs);
        assertThat(userInfo.nickname()).isEqualTo("홍길동");
        assertThat(userInfo.profileImageUrl()).isEqualTo("https://img.kakao.com/123.jpg");
    }

    @Test
    @DisplayName("profile이 없으면 nickname과 profileImageUrl은 null을 반환한다")
    void nickname_returnsNullWhenProfileMissing() {
        // HashMap 사용 - Map.of()는 null 값 허용 안 함
        Map<String, Object> kakaoAccount = new HashMap<>();
        kakaoAccount.put("email", "user@kakao.com");
        // profile 없음
        Map<String, Object> attrs = Map.of("id", 123L, "kakao_account", kakaoAccount);

        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(attrs);
        assertThat(userInfo.nickname()).isNull();
        assertThat(userInfo.profileImageUrl()).isNull();
    }
}
