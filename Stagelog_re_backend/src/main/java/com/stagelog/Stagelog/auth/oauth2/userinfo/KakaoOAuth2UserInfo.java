package com.stagelog.Stagelog.auth.oauth2.userinfo;

import com.stagelog.Stagelog.user.domain.Provider;
import java.util.Map;

/**
 * 카카오 사용자 정보 응답을 OAuth2UserInfo로 매핑한다.
 *
 * 카카오 응답 구조:
 * {
 *   "id": 1234567890,                          → providerId (Long → String)
 *   "kakao_account": {
 *     "email": "user@kakao.com",               → email (선택 동의 시 null 가능)
 *     "profile": {
 *       "nickname": "카카오유저",               → nickname
 *       "profile_image_url": "https://..."     → profileImageUrl
 *     }
 *   }
 * }
 */
public class KakaoOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public Provider provider() {
        return Provider.KAKAO;
    }

    @Override
    public String providerId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    @Override
    public String email() {
        Map<String, Object> kakaoAccount = kakaoAccount();
        if (kakaoAccount == null) {
            return null;
        }
        return (String) kakaoAccount.get("email");
    }

    @Override
    public String nickname() {
        Map<String, Object> profile = profile();
        if (profile == null) {
            return null;
        }
        return (String) profile.get("nickname");
    }

    @Override
    public String profileImageUrl() {
        Map<String, Object> profile = profile();
        if (profile == null) {
            return null;
        }
        return (String) profile.get("profile_image_url");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> kakaoAccount() {
        return (Map<String, Object>) attributes.get("kakao_account");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> profile() {
        Map<String, Object> kakaoAccount = kakaoAccount();
        if (kakaoAccount == null) {
            return null;
        }
        return (Map<String, Object>) kakaoAccount.get("profile");
    }
}
