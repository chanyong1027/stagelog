# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stagelog - 공연 정보 조회 및 기록 서비스의 백엔드. Spring Boot 3.5.8 / Java 17 / PostgreSQL / Gradle.

## Build & Run Commands

```bash
./gradlew clean build          # 전체 빌드
./gradlew clean build -x test  # 테스트 제외 빌드
./gradlew test                 # 전체 테스트
./gradlew bootRun              # 애플리케이션 실행
```

환경변수 필요: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `KOPIS_API_KEY`

## Architecture

**레이어드 아키텍처**: Controller → Service → Repository → Domain

```
com.stagelog.Stagelog
├── auth/          # 인증 (자체 로그인 + 소셜 로그인, JWT 발급)
├── user/          # 사용자 관리 (프로필, 계정 상태)
├── performance/   # 공연 정보 (KOPIS API 연동, Spring Batch)
└── global/        # 공통 (Security, JWT, Exception, BaseEntity)
```

## Key Design Decisions

- **인증**: JWT 기반 stateless. subject에 email을 저장. `CustomUserDetailsService`가 email로 DB 조회.
- **User 엔티티**: 자체 로그인(`createLocalUser`)과 소셜 로그인(`createSocialUser`) 두 가지 정적 팩토리 메서드. `Provider` enum으로 구분 (LOCAL, KAKAO, GOOGLE, NAVER).
- **계정 상태 관리**: `UserStatus`(ACTIVE, DELETED, SUSPENDED)를 `JwtAuthenticationFilter`에서 체크. 탈퇴/정지된 유저는 필터에서 403 반환.
- **Batch**: KOPIS 공연 API에서 목록 조회 → 상세 조회 2단계. Reader-Processor-Writer 패턴, rate limiting 적용.
- **Exception**: `ErrorCode` enum 중심. `GlobalExceptionHandler`에서 `ErrorResponse`로 통일된 JSON 응답.

## Conventions

- JPA 엔티티: `@NoArgsConstructor(access = PROTECTED)`, 정적 팩토리 메서드로 생성, setter 없음
- 모든 엔티티는 `BaseEntity`(createdAt, updatedAt) 상속
- DTO: Request/Response 접미사, `@NoArgsConstructor(access = PRIVATE)` (Jackson 역직렬화용)
- 검증: DTO에서 `@Valid` + Jakarta Validation, 도메인에서 비즈니스 검증
- 에러 메시지: 한국어
- CORS: `http://localhost:5173` 허용 (프론트엔드)
- 인증 불필요 경로: `/api/auth/**`, `/api/performances/**`, `/api/migration/**`
