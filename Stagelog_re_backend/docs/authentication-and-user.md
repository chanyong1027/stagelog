# 인증/인가 및 사용자 관리 설계 문서

## 목차
1. [전체 아키텍처](#1-전체-아키텍처)
2. [User 엔티티 설계](#2-user-엔티티-설계)
3. [인증 흐름](#3-인증-흐름)
4. [JWT 설계](#4-jwt-설계)
5. [Spring Security 구성](#5-spring-security-구성)
6. [API 명세](#6-api-명세)
7. [설계 결정과 대안 비교](#7-설계-결정과-대안-비교)

---

## 1. 전체 아키텍처

### 패키지 구조

```
auth/
├── controller/AuthController        # 인증 API (회원가입, 로그인, 토큰 갱신, 로그아웃)
├── service/AuthService              # 인증 비즈니스 로직
└── dto/
    ├── SignupRequest                 # 자체 회원가입 요청
    ├── LoginRequest                 # 자체 로그인 요청
    ├── OAuth2LoginRequest           # 소셜 로그인 요청
    ├── RefreshRequest               # 토큰 갱신 요청
    └── TokenResponse                # JWT 토큰 응답 (Access + Refresh)

user/
├── controller/UserController        # 사용자 정보 API (프로필, 수정, 탈퇴)
├── service/UserService              # 사용자 비즈니스 로직
├── repository/UserRepository        # 데이터 접근
├── domain/
│   ├── User                         # 사용자 엔티티
│   ├── Role                         # 권한 (USER, ADMIN)
│   ├── Provider                     # 로그인 제공자 (LOCAL, KAKAO, GOOGLE, NAVER)
│   └── UserStatus                   # 계정 상태 (ACTIVE, DELETED, SUSPENDED)
└── dto/
    ├── UserProfileResponse          # 프로필 응답
    └── UserUpdateRequest            # 프로필 수정 요청

global/
├── jwt/
│   ├── JwtTokenProvider             # JWT 생성/검증/파싱 (Access + Refresh)
│   ├── JwtAuthenticationFilter      # 매 요청마다 JWT 검증 필터 (Access Token만 허용)
│   ├── JwtProperties                # JWT 설정값 (secret, accessTokenValidity, refreshTokenValidity)
│   ├── domain/
│   │   └── RefreshToken             # Refresh Token 엔티티
│   └── repository/
│       └── RefreshTokenRepository   # Refresh Token 데이터 접근
├── security/
│   ├── CustomUserDetails            # UserDetails 구현체 (User 엔티티 래핑)
│   └── CustomUserDetailsService     # UserDetailsService 구현체 (email로 조회)
└── config/
    └── SecurityConfig               # Spring Security 설정
```

### 책임 분리: auth vs user

| 구분 | auth 패키지 | user 패키지 |
|------|-------------|-------------|
| **역할** | 인증 (Authentication) | 사용자 관리 |
| **주요 기능** | 회원가입, 로그인, JWT 발급 | 프로필 조회/수정, 계정 상태 관리 |
| **인증 필요** | 불필요 (`/api/auth/**` permitAll) | 필요 (JWT 토큰 필수) |

---

## 2. User 엔티티 설계

### 필드 구성

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long | PK, AUTO | DB 기본키 |
| `email` | String | UNIQUE | 이메일 (JWT subject, 소셜/자체 공통 식별자) |
| `userId` | String | UNIQUE, NOT NULL, 변경불가 | 로그인 ID (자체: 사용자 입력, 소셜: `kakao_123456` 자동 생성) |
| `password` | String | NOT NULL | 비밀번호 (자체: BCrypt 암호화, 소셜: `"SOCIAL_LOGIN"` 고정값) |
| `nickname` | String | NOT NULL, 2~20자 | 표시 이름 |
| `profileImageUrl` | String | nullable | 프로필 사진 URL |
| `provider` | Provider | NOT NULL | LOCAL / KAKAO / GOOGLE / NAVER |
| `providerId` | String | nullable | 소셜 플랫폼 고유 ID |
| `role` | Role | NOT NULL | USER / ADMIN |
| `status` | UserStatus | NOT NULL | ACTIVE / DELETED / SUSPENDED |
| `lastLoginAt` | LocalDateTime | nullable | 마지막 로그인 시간 |
| `emailNotificationEnabled` | Boolean | NOT NULL, 기본 true | 이메일 알림 수신 동의 |
| `isSocial` | Boolean | NOT NULL | 소셜 가입 여부 |
| `createdAt` | LocalDateTime | NOT NULL, 자동 | 가입일 (BaseEntity) |
| `updatedAt` | LocalDateTime | 자동 | 수정일 (BaseEntity) |

### 복합 유니크 제약

```java
@UniqueConstraint(columnNames = {"provider", "provider_id"})
```

같은 카카오 계정(providerId)으로 중복 가입을 방지한다.

### 정적 팩토리 메서드

엔티티 생성에 `new` + setter 대신 정적 팩토리 메서드를 사용한다.

```java
// 자체 회원가입
User.createLocalUser(userId, encodedPassword, nickname, email)

// 소셜 로그인 (첫 로그인 시 자동 회원가입)
User.createSocialUser(email, nickname, profileImageUrl, provider, providerId)
```

**이유:**
- 생성 시 필수 검증 로직을 한 곳에서 강제할 수 있다
- setter를 노출하지 않아 엔티티 불변성을 보장한다
- 자체/소셜의 초기화 로직이 다르므로 메서드를 분리하여 의도를 명확히 한다

### 상태 변경 메서드

```java
user.updateProfile(nickname, profileImageUrl, emailNotificationEnabled)  // null이면 해당 필드 변경 안 함
user.updateLastLoginAt()
user.delete()     // status → DELETED
user.suspend()    // status → SUSPENDED
user.activate()   // status → ACTIVE
```

**소프트 삭제(Soft Delete)를 선택한 이유:**
- 탈퇴 후에도 공연 기록, 리뷰 등 연관 데이터를 보존할 수 있다
- 관리자가 부정 이용 이력을 확인할 수 있다
- 실수로 탈퇴한 사용자를 복구할 수 있다

---

## 3. 인증 흐름

### 3-1. 자체 회원가입

```
클라이언트 → POST /api/auth/signup
{
  "userId": "hong_gildong",
  "password": "Test1234!",
  "nickname": "홍길동",
  "email": "hong@example.com"
}

→ AuthController.signup()
→ AuthService.signUp()
  1. userId 중복 확인 (existsByUserId)
  2. email 중복 확인 (existsByEmail)
  3. 비밀번호 BCrypt 암호화
  4. User.createLocalUser() → DB 저장
→ 201 Created + userId 반환
```

### 3-2. 자체 로그인

```
클라이언트 → POST /api/auth/login
{
  "userId": "hong_gildong",
  "password": "Test1234!"
}

→ AuthController.login()
→ AuthService.login()
  1. userId로 사용자 조회 (findByUserId)
  2. BCrypt 비밀번호 검증
  3. lastLoginAt 업데이트
  4. issueTokens(user) → Access Token + Refresh Token 발급
     - 기존 Refresh Token이 있으면 교체(Rotation), 없으면 새로 생성
→ 200 OK + TokenResponse (accessToken, refreshToken, userId, email, nickname)
```

### 3-3. 소셜 로그인

```
[프론트엔드]
1. 카카오/구글/네이버 OAuth2 인증 → 소셜 플랫폼에서 사용자 정보 획득

[백엔드]
클라이언트 → POST /api/auth/oauth2/login
{
  "provider": "KAKAO",
  "providerId": "1234567890",
  "email": "user@kakao.com",
  "nickname": "카카오유저",
  "profileImageUrl": "https://..."
}

→ AuthController.oauth2Login()
→ AuthService.loginWithOAuth2()
→ UserService.getOrCreateUser()
  - 기존 사용자 (provider + providerId로 조회됨) → lastLoginAt 업데이트
  - 신규 사용자 (조회 안 됨) → User.createSocialUser() → DB 저장
→ issueTokens(user) → Access Token + Refresh Token 발급
→ 200 OK + TokenResponse
```

### 3-4. 토큰 갱신 (Refresh)

```
클라이언트 → POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOi..."
}

→ AuthController.refresh()
→ AuthService.refresh()
  1. JwtTokenProvider.validateToken() → 서명/만료 검증
  2. JwtTokenProvider.isRefreshToken() → type이 "refresh"인지 확인
  3. DB에서 Refresh Token 조회 (findByRefreshToken)
  4. 만료 여부 확인 (isExpired)
  5. 새 Access Token + 새 Refresh Token 발급
  6. 기존 Refresh Token을 새 것으로 교체 (Refresh Token Rotation)
→ 200 OK + TokenResponse (새 accessToken, 새 refreshToken)
```

### 3-5. 로그아웃

```
클라이언트 → POST /api/auth/logout
Authorization: Bearer eyJhbGciOi...

→ AuthController.logout()
  - @AuthenticationPrincipal에서 email 추출
→ AuthService.logout(email)
  - 해당 email의 Refresh Token을 DB에서 삭제
→ 204 No Content
```

> 로그아웃 시 Access Token은 서버에서 무효화하지 않는다. 클라이언트가 토큰을 폐기하며, Access Token은 만료 시간(1시간)이 지나면 자연 소멸한다. Refresh Token만 DB에서 삭제하여 재발급을 차단한다.

### 3-6. 인증된 요청 처리 (JWT 검증)

```
클라이언트 → GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

→ JwtAuthenticationFilter.doFilterInternal()
  1. Authorization 헤더에서 Bearer 토큰 추출
  2. JwtTokenProvider.validateToken() → 서명/만료 검증
  3. JwtTokenProvider.isAccessToken() → type이 "access"인지 확인
     - Refresh Token으로 API 호출 시도 → 401 "Access Token이 필요합니다."
  4. JwtTokenProvider.getAuthentication()
     → JWT subject에서 email 추출
     → CustomUserDetailsService.loadUserByUsername(email) → DB 조회
     → CustomUserDetails 생성 (User 엔티티 래핑)
  5. 계정 상태 체크
     - isEnabled() == false (DELETED) → 403 "탈퇴한 사용자입니다."
     - isAccountNonLocked() == false (SUSPENDED) → 403 "정지된 사용자입니다."
  5. SecurityContextHolder에 Authentication 저장

→ UserController.getMyProfile()
  @AuthenticationPrincipal CustomUserDetails → userDetails.getUser().getId()
→ UserService.getMyProfile(id) → UserProfileResponse 반환
```

---

## 4. JWT 설계

### 라이브러리

- **jjwt 0.12.6** (io.jsonwebtoken)
- 0.12.x 최신 API 사용: `SecretKey`, `Jwts.parser().verifyWith()`, `parseSignedClaims()`, `getPayload()`

### 토큰 구조

**Access Token:**

| 항목 | 값 |
|------|-----|
| **알고리즘** | HS512 |
| **Subject (sub)** | 사용자 email |
| **Claims - role** | `ROLE_USER` 또는 `ROLE_ADMIN` |
| **Claims - type** | `access` |
| **만료 시간** | 1시간 (3600000ms) |
| **전달 방식** | Authorization 헤더 (Bearer 토큰) |

**Refresh Token:**

| 항목 | 값 |
|------|-----|
| **알고리즘** | HS512 |
| **Subject (sub)** | 사용자 email |
| **Claims - role** | `ROLE_USER` 또는 `ROLE_ADMIN` |
| **Claims - type** | `refresh` |
| **만료 시간** | 14일 (1209600000ms) |
| **저장 위치** | DB (RefreshToken 엔티티) |

### role claim을 추가한 이유

JWT에서 바로 권한을 확인할 수 있어 불필요한 DB 조회를 줄일 수 있다. 현재는 매 요청마다 DB를 조회하고 있지만, 추후 캐싱이나 최적화 시 활용 가능하다.

### type claim을 추가한 이유

Access Token과 Refresh Token을 구분하기 위함이다. type claim이 없으면 Refresh Token으로 API를 호출하거나, Access Token으로 토큰 갱신을 시도하는 **토큰 오용 공격**이 가능하다.

- `JwtAuthenticationFilter`: `isAccessToken()`으로 검증 → Refresh Token으로 API 호출 차단
- `AuthService.refresh()`: `isRefreshToken()`으로 검증 → Access Token으로 갱신 차단

### JWT Subject로 email을 선택한 이유

| 후보 | 장점 | 단점 |
|------|------|------|
| **Long id (PK)** | 불변, 빠른 조회 | 소셜 유저에게 의미 없음, 토큰만으로 누구인지 알 수 없음 |
| **userId** | 자체 로그인 유저에게 직관적 | 소셜 유저의 userId는 `kakao_123456`처럼 자동 생성된 값이라 의미 없음 |
| **email** (선택) | 자체/소셜 모든 유저가 가짐, 사람이 읽을 수 있음 | 이메일 변경 시 기존 토큰 무효화 필요 (현재 이메일 변경 기능 없음) |

### Access + Refresh Token 구조

| 항목 | Access Token | Refresh Token |
|------|-------------|---------------|
| **용도** | API 인증 | Access Token 재발급 |
| **만료** | 1시간 (짧게) | 14일 (길게) |
| **저장 위치** | 클라이언트 (메모리/localStorage) | DB (서버 측 관리) |
| **탈취 시 위험** | 1시간 내 악용 가능 | DB에서 삭제하면 즉시 무효화 가능 |
| **갱신** | Refresh Token으로 재발급 | Refresh Token Rotation (사용 시 새 것으로 교체) |

### Refresh Token 엔티티

```java
RefreshToken {
    id: Long (PK)
    email: String (UNIQUE)
    refreshToken: String
    expiryDate: LocalDateTime
}
```

- `create(email, refreshToken, validityMillis)` — 신규 생성
- `rotate(newRefreshToken, validityMillis)` — 기존 토큰을 새 것으로 교체 + 만료일 갱신
- `isExpired()` — 현재 시간 기준 만료 여부 확인

### Refresh Token Rotation

Refresh Token 사용 시 **새 Refresh Token을 발급하고 기존 것을 교체**하는 방식이다.

```
[기존 방식 - Rotation 없음]
Refresh Token A로 갱신 → 새 Access Token 발급, Refresh Token A 유지
→ Refresh Token A가 탈취되면 14일간 계속 악용 가능

[현재 방식 - Rotation 적용]
Refresh Token A로 갱신 → 새 Access Token + 새 Refresh Token B 발급, A는 폐기
→ Refresh Token A가 탈취되어도, 정상 사용자가 먼저 갱신하면 A는 무효화됨
```

> 추후 사용자가 늘면 Refresh Token 저장소를 RDB에서 Redis로 전환하여 성능을 개선할 수 있다.

---

## 5. Spring Security 구성

### SecurityConfig 설정

```java
.csrf(disable)                    // REST API이므로 CSRF 불필요
.formLogin(disable)               // JWT 사용, 폼 로그인 불필요
.httpBasic(disable)               // Basic Auth 불필요
.sessionManagement(STATELESS)     // JWT 기반이므로 세션 미사용
```

### 인가 규칙

```java
.requestMatchers("/api/auth/logout").authenticated()
.requestMatchers("/api/auth/**", "/api/performances/**", "/api/migration/**").permitAll()
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.anyRequest().authenticated()
```

| 경로 | 접근 권한 | 이유 |
|------|-----------|------|
| `/api/auth/logout` | 인증 필요 | `@AuthenticationPrincipal`로 현재 사용자를 식별해야 함 |
| `/api/auth/**` | 모두 | 로그인/회원가입/토큰 갱신은 인증 전에 호출 |
| `/api/performances/**` | 모두 | 공연 정보는 비로그인 사용자도 조회 가능 |
| `/api/admin/**` | ADMIN만 | 관리자 기능 |
| 나머지 | 인증 필요 | `/api/users/me` 등 |

> **주의:** `/api/auth/logout`은 `/api/auth/**` permitAll보다 **먼저** 선언해야 한다. Spring Security는 선언 순서대로 매칭하므로, 먼저 선언된 규칙이 우선한다.

### Filter Chain 순서

```
요청 → CorsFilter → JwtAuthenticationFilter(Access Token만 허용) → UsernamePasswordAuthenticationFilter → ...
```

`JwtAuthenticationFilter`가 `UsernamePasswordAuthenticationFilter` 앞에 위치하여 JWT 검증을 먼저 수행한다.

### CustomUserDetails / CustomUserDetailsService

**UserDetails를 직접 구현한 이유:**

Spring Security가 제공하는 `org.springframework.security.core.userdetails.User`를 사용할 수도 있지만:
- `isEnabled()` → UserStatus가 ACTIVE인지 체크
- `isAccountNonLocked()` → SUSPENDED가 아닌지 체크
- `getUser()` → Controller에서 User 엔티티에 직접 접근 가능

이런 커스텀 로직이 필요하므로 직접 구현했다.

**CustomUserDetails 주요 메서드:**

| 메서드 | 반환값 | 설명 |
|--------|--------|------|
| `getUsername()` | email | JWT subject와 일치 |
| `getAuthorities()` | ROLE_USER 또는 ROLE_ADMIN | 권한 |
| `isEnabled()` | status == ACTIVE | 탈퇴 유저 차단 |
| `isAccountNonLocked()` | status != SUSPENDED | 정지 유저 차단 |
| `getUser()` | User 엔티티 | Controller에서 id 등 접근용 |

---

## 6. API 명세

### Auth API (`/api/auth`)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/api/auth/check-userid?userId=xxx` | X | 아이디 중복 확인 |
| POST | `/api/auth/signup` | X | 자체 회원가입 |
| POST | `/api/auth/login` | X | 자체 로그인 |
| POST | `/api/auth/oauth2/login` | X | 소셜 로그인 |
| POST | `/api/auth/refresh` | X | 토큰 갱신 (Refresh Token 필요) |
| POST | `/api/auth/logout` | O | 로그아웃 (Refresh Token 삭제) |

### User API (`/api/users`)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/api/users/me` | O | 내 프로필 조회 |
| PATCH | `/api/users/me` | O | 내 프로필 수정 |
| DELETE | `/api/users/me` | O | 회원 탈퇴 (소프트 삭제) |

### 요청/응답 예시

**회원가입 요청:**
```json
POST /api/auth/signup
{
  "userId": "hong_gildong",
  "password": "Test1234!",
  "nickname": "홍길동",
  "email": "hong@example.com"
}
→ 201 Created, body: 1 (생성된 id)
```

**로그인 응답:**
```json
POST /api/auth/login
{
  "userId": "hong_gildong",
  "password": "Test1234!"
}
→ 200 OK
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "hong@example.com",
  "nickname": "홍길동"
}
```

**토큰 갱신:**
```json
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOi..."
}
→ 200 OK
{
  "accessToken": "eyJhbGciOi...(새 토큰)",
  "refreshToken": "eyJhbGciOi...(새 토큰)",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "hong@example.com",
  "nickname": "홍길동"
}
```

**로그아웃:**
```json
POST /api/auth/logout
Authorization: Bearer eyJhbGciOi...
→ 204 No Content
```

**프로필 수정 (부분 업데이트):**
```json
PATCH /api/users/me
Authorization: Bearer eyJhbGciOi...
{
  "nickname": "새닉네임"
}
→ 200 OK + UserProfileResponse
```

null인 필드는 변경하지 않는다. 닉네임만 보내면 닉네임만 바뀐다.

---

## 7. 설계 결정과 대안 비교

### 7-1. 로그인 처리: Controller vs Filter

| 방식 | 설명 |
|------|------|
| **Controller 방식 (현재)** | `AuthController`에서 `@PostMapping("/login")`으로 처리 |
| **Filter 방식** | `AbstractAuthenticationProcessingFilter`를 상속받아 필터에서 처리 |

**Controller 방식을 선택한 이유:**

| 비교 | Controller 방식 | Filter 방식 |
|------|-----------------|-------------|
| 구현 복잡도 | 단순 (Controller + Service) | 높음 (Filter + AuthenticationProvider + SuccessHandler + FailureHandler 최소 4개) |
| Spring MVC 활용 | `@Valid`, `@RequestBody` 사용 가능 | `HttpServletRequest`에서 직접 파싱 필요 |
| 디버깅 | Controller 레벨이라 추적 쉬움 | Filter Chain은 디버깅 까다로움 |
| 소셜+자체 로그인 | 같은 패턴으로 일관되게 처리 | 둘 다 필터로 하면 복잡도 급증 |
| 적합한 상황 | JWT + REST API (업계 표준) | 세션 기반 폼 로그인 |

`AbstractAuthenticationProcessingFilter`는 원래 세션 기반 폼 로그인용으로 설계된 것이다. JWT + REST API에 맞추려면 억지로 커스텀해야 하는 부분이 많아, Controller 방식이 더 적합하다.

---

### 7-2. 매 요청마다 DB 조회 vs 토큰 정보만 사용

| 방식 | 설명 |
|------|------|
| **DB 조회 방식 (현재)** | JWT에서 email 추출 → `CustomUserDetailsService`로 DB 조회 → `CustomUserDetails` 생성 |
| **토큰 정보만 사용** | JWT 클레임에 userId, role 등을 넣고, DB 조회 없이 Authentication 생성 |

**DB 조회 방식을 선택한 이유:**

| 비교 | DB 조회 방식 | 토큰만 사용 |
|------|-------------|-------------|
| 성능 | 매 요청마다 쿼리 1회 | DB 조회 없음, 빠름 |
| 실시간 반영 | role 변경, 계정 정지/탈퇴 **즉시** 반영 | 토큰 만료 전까지 이전 정보로 접근 가능 |
| 보안 | 정지된 유저 즉시 차단 가능 | 토큰 유효 기간 동안 차단 불가 |
| 구현 | Spring Security 표준 패턴 | 비표준, 직접 Authentication 생성 |

현재 규모에서 매 요청 DB 1회 조회는 성능 문제가 되지 않으며, 보안과 실시간 반영이 더 중요하다.

> **스케일이 커지면?** Redis 캐싱으로 DB 조회를 대체할 수 있다. `loadUserByUsername`에서 Redis를 먼저 확인하고, 없으면 DB 조회 후 캐싱하는 방식.

---

### 7-3. 프로필 수정: 개별 메서드 vs 통합 메서드

| 방식 | 설명 |
|------|------|
| **개별 메서드** | `updateNickname()`, `updateProfileImage()`, `updateEmailNotification()` 각각 분리 |
| **통합 메서드 (현재)** | `updateProfile(nickname, profileImageUrl, emailNotificationEnabled)` 하나로 처리 |

**통합 메서드를 선택한 이유:**

| 비교 | 개별 메서드 | 통합 메서드 |
|------|------------|-------------|
| API 호출 | 필드별 API가 필요하거나, Controller에서 여러 서비스 메서드 호출 | API 1개, 트랜잭션 1개 |
| 실제 사용 패턴 | 필드 하나만 바꾸는 관리자 기능에 적합 | "프로필 수정" 페이지에서 한 번에 저장하는 사용자 패턴에 적합 |
| null 처리 | 불필요 | null인 필드는 변경 안 함 (부분 업데이트) |

사용자가 프로필 수정 화면에서 여러 필드를 바꾸고 "저장" 버튼을 누르는 게 자연스러운 UX이다.

---

### 7-4. 소프트 삭제 vs 하드 삭제

| 방식 | 설명 |
|------|------|
| **소프트 삭제 (현재)** | `status`를 DELETED로 변경, 실제 데이터는 유지 |
| **하드 삭제** | DB에서 row를 물리적으로 삭제 |

| 비교 | 소프트 삭제 | 하드 삭제 |
|------|------------|-----------|
| 데이터 보존 | 공연 기록, 리뷰 등 연관 데이터 유지 | 외래키 제약으로 연관 데이터도 삭제 필요 |
| 복구 가능성 | 관리자가 복구 가능 | 불가능 |
| 부정 이용 추적 | 탈퇴 후에도 이력 확인 가능 | 증거 소멸 |
| DB 용량 | 데이터 누적 | 깔끔함 |
| 쿼리 복잡도 | 조회 시 `status = ACTIVE` 조건 필요 | 단순 |

공연 기록 서비스 특성상 사용자의 관람 이력, 리뷰 등의 보존이 중요하므로 소프트 삭제가 적합하다.

---

### 7-5. 비밀번호 암호화: BCrypt vs 기타

| 알고리즘 | 장점 | 단점 |
|----------|------|------|
| **BCrypt (현재)** | 업계 표준, 적응형 해싱 (cost factor 조정 가능), Spring Security 기본 지원 | SHA 대비 느림 (의도적) |
| SCrypt | BCrypt보다 메모리 사용량 높아 GPU 공격에 강함 | 구현 복잡, 메모리 사용량 높음 |
| Argon2 | 최신 표준, 메모리+시간+병렬성 모두 조절 가능 | Spring Security 추가 설정 필요 |
| SHA-256 + Salt | 빠름 | 너무 빨라서 무차별 대입에 취약, 적응형 아님 |

BCrypt는 Spring Security가 기본 제공하며, 현재 대부분의 프로젝트에서 표준으로 사용된다.

---

### 7-6. 검증 위치: DTO vs 엔티티

현재 프로젝트는 **2단계 검증**을 사용한다.

| 단계 | 위치 | 역할 | 예시 |
|------|------|------|------|
| 1차 | DTO (`@Valid`) | 요청 형식 검증 | `@Email`, `@NotBlank`, `@Pattern`, `@Size` |
| 2차 | 엔티티 (메서드 내부) | 비즈니스 규칙 검증 | `validateEmail()`, `validateNickname()` |

**이유:**
- DTO 검증: Controller 진입 시점에 잘못된 요청을 빠르게 걸러냄 (400 Bad Request)
- 엔티티 검증: 어디서 호출하든 (Service, Batch 등) 비즈니스 규칙이 보장됨

---

### 7-7. 로그인 DTO에 형식 검증을 넣지 않은 이유

`LoginRequest`에는 `@NotBlank`만 있고 `@Pattern`, `@Size` 등이 없다.

로그인은 이미 가입된 정보로 인증하는 행위이다. 형식 검증은 회원가입 시 한 번만 하면 되고, 로그인 시에는 DB에 있는지(`USER_NOT_FOUND`), 비밀번호가 맞는지(`INVALID_PASSWORD`)만 확인하면 충분하다.

---

## 부록: 파일 목록

| 파일 | 경로 |
|------|------|
| User | `user/domain/User.java` |
| Role | `user/domain/Role.java` |
| Provider | `user/domain/Provider.java` |
| UserStatus | `user/domain/UserStatus.java` |
| UserRepository | `user/repository/UserRepository.java` |
| UserService | `user/service/UserService.java` |
| UserController | `user/controller/UserController.java` |
| UserProfileResponse | `user/dto/UserProfileResponse.java` |
| UserUpdateRequest | `user/dto/UserUpdateRequest.java` |
| AuthService | `auth/service/AuthService.java` |
| AuthController | `auth/controller/AuthController.java` |
| SignupRequest | `auth/dto/SignupRequest.java` |
| LoginRequest | `auth/dto/LoginRequest.java` |
| OAuth2LoginRequest | `auth/dto/OAuth2LoginRequest.java` |
| RefreshRequest | `auth/dto/RefreshRequest.java` |
| TokenResponse | `auth/dto/TokenResponse.java` |
| JwtTokenProvider | `global/jwt/JwtTokenProvider.java` |
| JwtAuthenticationFilter | `global/jwt/JwtAuthenticationFilter.java` |
| JwtProperties | `global/jwt/JwtProperties.java` |
| RefreshToken | `global/jwt/domain/RefreshToken.java` |
| RefreshTokenRepository | `global/jwt/repository/RefreshTokenRepository.java` |
| CustomUserDetails | `global/security/CustomUserDetails.java` |
| CustomUserDetailsService | `global/security/CustomUserDetailsService.java` |
| SecurityConfig | `global/config/SecurityConfig.java` |
