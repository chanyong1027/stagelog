package com.stagelog.Stagelog.auth.service;

/**
 * 토큰 생성 결과를 묶는 내부 전용 타입.
 * auth.service 패키지 외부에 노출하지 않는다 (package-private).
 * 외부로 전달되는 타입은 AuthTokenResult만 사용한다.
 */
record TokenPairWithHash(String accessToken, String refreshToken, String refreshTokenHash) {
}
