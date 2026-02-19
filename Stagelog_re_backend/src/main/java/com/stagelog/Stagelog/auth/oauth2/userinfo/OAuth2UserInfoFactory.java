package com.stagelog.Stagelog.auth.oauth2.userinfo;

import com.stagelog.Stagelog.global.exception.BusinessException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import java.util.Map;
import java.util.function.Function;

/**
 * registrationId(카카오·구글·네이버)에 따라 OAuth2UserInfo 구현체를 반환하는 정적 팩토리.
 *
 * 새 provider 추가 시 REGISTRY에 항목 하나만 등록하면 되며,
 * CustomOAuth2UserService·핸들러 코드는 수정하지 않아도 된다 (OCP).
 */
public final class OAuth2UserInfoFactory {

    private static final Map<String, Function<Map<String, Object>, OAuth2UserInfo>> REGISTRY =
            Map.of(
                    "kakao", KakaoOAuth2UserInfo::new
                    // Step 7: "google", GoogleOAuth2UserInfo::new
                    // Step 8: "naver",  NaverOAuth2UserInfo::new
            );

    private OAuth2UserInfoFactory() {
    }

    /**
     * @param registrationId Spring Security OAuth2 Client의 registration ID (예: "kakao")
     * @param attributes     provider userinfo 엔드포인트 응답 attributes
     * @throws BusinessException AUTH_OAUTH2_PROVIDER_ERROR — 지원하지 않는 provider
     */
    public static OAuth2UserInfo of(String registrationId, Map<String, Object> attributes) {
        Function<Map<String, Object>, OAuth2UserInfo> creator =
                REGISTRY.get(registrationId.toLowerCase());
        if (creator == null) {
            throw new BusinessException(ErrorCode.AUTH_OAUTH2_PROVIDER_ERROR);
        }
        return creator.apply(attributes);
    }
}
