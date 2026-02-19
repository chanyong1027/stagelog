package com.stagelog.Stagelog.auth.oauth2.userinfo;

import com.stagelog.Stagelog.user.domain.Provider;

/**
 * 소셜 provider 응답을 표준화한 사용자 정보 인터페이스.
 *
 * provider별 응답 구조 차이를 이 인터페이스 뒤로 캡슐화해,
 * CustomOAuth2UserService와 성공 핸들러가 provider를 몰라도 동작하게 한다.
 * 새 provider 추가 시 구현체 + OAuth2UserInfoFactory 등록만으로 확장된다 (OCP).
 *
 * email, profileImageUrl은 소셜 계정 설정에 따라 null일 수 있다.
 * email이 null인 경우 CustomOAuth2UserService에서 AUTH_OAUTH2_MISSING_EMAIL로 처리한다.
 */
public interface OAuth2UserInfo {

    Provider provider();

    /** 소셜 플랫폼의 사용자 고유 ID. null이면 AUTH_OAUTH2_PROVIDER_ERROR로 처리한다. */
    String providerId();

    /** 이메일. 사용자가 제공하지 않으면 null. */
    String email();

    String nickname();

    /** 프로필 이미지 URL. 없으면 null. */
    String profileImageUrl();
}
