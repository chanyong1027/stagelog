# 소셜 로그인 구현 가이드

## 목차
1. [우리 시스템의 소셜 로그인 구조](#1-우리-시스템의-소셜-로그인-구조)
2. [카카오 로그인 설정](#2-카카오-로그인-설정)
3. [구글 로그인 설정](#3-구글-로그인-설정)
4. [네이버 로그인 설정](#4-네이버-로그인-설정)
5. [환경변수 설정](#5-환경변수-설정)
6. [백엔드 구현](#6-백엔드-구현)
7. [프론트엔드 구현](#7-프론트엔드-구현)
8. [JWT 전달 방식: HttpOnly Cookie](#8-jwt-전달-방식-httponly-cookie)
9. [테스트 및 디버깅](#9-테스트-및-디버깅)
10. [운영 배포 시 주의사항](#10-운영-배포-시-주의사항)

---

## 1. 우리 시스템의 소셜 로그인 구조

### 핵심: 백엔드 주도 방식 (Server-Side Flow)

프론트엔드는 OAuth 인증 과정에 **직접 관여하지 않는다.** 백엔드가 모든 OAuth 통신을 처리하고, 결과로 JWT를 발급하여 HttpOnly Cookie에 담아 전달한다.

```
┌──────────┐  ①로그인 버튼 클릭    ┌──────────┐  ②소셜 인증 페이지로  ┌──────────────┐
│          │ (링크 이동)          │          │    리다이렉트       │              │
│ 프론트엔드 │ ──────────────────→ │  백엔드    │ ──────────────────→│  소셜 플랫폼    │
│ (React)  │                    │ (Spring) │                    │(카카오/구글/네이버)│
│          │                    │          │ ←──────────────────│              │
└──────────┘                    └──────────┘  ③인가 코드 (code)   └──────────────┘
                                     │            콜백
                                     │
                                     │  ④code → Access Token 교환 (서버 간 통신)
                                     │  ⑤Access Token → 사용자 정보 조회 (서버 간 통신)
                                     │  ⑥getOrCreateUser() → JWT 발급
                                     │
┌──────────┐                    ┌────▼─────┐
│          │ ←───────────────── │          │
│ 프론트엔드 │  ⑦프론트엔드로       │  백엔드    │
│ (React)  │   리다이렉트         │ (Spring) │
│          │   Set-Cookie:      │          │
└──────────┘   accessToken      └──────────┘
               refreshToken
               (HttpOnly)
```

### 왜 백엔드 주도 방식인가?

| 비교 | 프론트엔드 주도 | 백엔드 주도 (채택) |
|------|--------------|------------------|
| **Client Secret** | 프론트엔드에 노출 위험 | 서버에만 존재, 절대 노출 안 됨 |
| **소셜 Access Token** | 브라우저에 노출 | 서버 메모리에서만 사용 후 즉시 폐기 |
| **사용자 정보 조작** | 프론트가 보내는 정보를 변조 가능 | 백엔드가 직접 소셜 API에서 가져오므로 조작 불가 |
| **JWT 저장** | localStorage (XSS에 취약) | HttpOnly Cookie (JavaScript 접근 불가) |
| **CSRF 방지** | state 파라미터를 프론트에서 관리 | 백엔드에서 세션/쿠키로 state 관리 |
| **구현 복잡도** | 프론트엔드 복잡, 백엔드 단순 | 프론트엔드 단순, 백엔드에 집중 |

> **핵심 보안 원칙:** 프론트엔드(브라우저)는 신뢰할 수 없는 환경이다. 모든 민감 정보(Client Secret, 소셜 Access Token, 사용자 정보 검증)는 반드시 서버에서 처리해야 한다.

---

## 2. 카카오 로그인 설정

### 2-1. 앱 등록

1. [Kakao Developers](https://developers.kakao.com/) 접속 → 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
   - 앱 이름: `Stagelog`
   - 사업자명: 본인 이름 또는 팀명
   - 카테고리: `엔터테인먼트` > `공연/전시`
3. 생성 완료 후 **앱 키** 확인
   - **REST API 키** → Client ID로 사용

### 2-2. 카카오 로그인 활성화

1. 좌측 메뉴 → **카카오 로그인** → **활성화 설정** → `ON`

### 2-3. Client Secret 발급

1. 좌측 메뉴 → **카카오 로그인** → **보안** → **Client Secret** → **코드 생성**
2. 활성화 상태: `사용함` 으로 변경
3. 생성된 Client Secret 복사 → 환경변수에 저장

> 카카오는 Client Secret 없이도 동작하지만, **사용함으로 설정하면 보안이 강화**된다. 백엔드 주도 방식에서는 반드시 사용한다.

### 2-4. 동의항목 설정

좌측 메뉴 → **카카오 로그인** → **동의항목**

| 동의항목 | 동의 수준 | 필요 이유 |
|---------|-----------|----------|
| **닉네임** | 필수 동의 | User.nickname에 매핑 |
| **카카오계정(이메일)** | 필수 동의 | User.email에 매핑 (JWT subject) |
| **프로필 사진** | 선택 동의 | User.profileImageUrl에 매핑 |

> **주의:** 이메일을 **필수 동의**로 설정하려면 **비즈 앱 전환**이 필요하다. 개인 개발 단계에서는 "선택 동의"로 설정하고, 이메일 미제공 사용자에 대한 예외 처리를 추가해야 한다.

### 2-5. Redirect URI 설정

좌측 메뉴 → **카카오 로그인** → **Redirect URI**

**백엔드 주도 방식이므로 Callback은 백엔드 URL이다:**

```
개발: http://localhost:8080/api/auth/oauth2/callback/kakao
운영: https://api.yourdomain.com/api/auth/oauth2/callback/kakao
```

### 2-6. 플랫폼 등록

좌측 메뉴 → **플랫폼** → **Web 플랫폼 등록**

```
개발: http://localhost:8080
운영: https://api.yourdomain.com
```

### 2-7. 카카오 OAuth2 엔드포인트 정리

| 용도 | URL |
|------|-----|
| 인가 코드 요청 | `https://kauth.kakao.com/oauth/authorize` |
| Access Token 요청 | `https://kauth.kakao.com/oauth/token` |
| 사용자 정보 조회 | `https://kapi.kakao.com/v2/user/me` |

### 2-8. 카카오 사용자 정보 응답 예시

```json
{
  "id": 1234567890,
  "kakao_account": {
    "email": "user@kakao.com",
    "profile": {
      "nickname": "카카오유저",
      "profile_image_url": "https://k.kakaocdn.net/..."
    }
  }
}
```

**우리 시스템 매핑:**

| 카카오 응답 필드 | User 엔티티 필드 |
|----------------|-----------------|
| `id` | `providerId` (Long → String 변환) |
| `kakao_account.email` | `email` |
| `kakao_account.profile.nickname` | `nickname` |
| `kakao_account.profile.profile_image_url` | `profileImageUrl` |

---

## 3. 구글 로그인 설정

### 3-1. 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속 → 로그인
2. 상단 프로젝트 선택 → **새 프로젝트**
   - 프로젝트 이름: `Stagelog`
   - 조직: 없음 (개인)
3. 생성 후 해당 프로젝트 선택

### 3-2. OAuth 동의 화면 설정

1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. User Type: **외부** 선택 → 만들기
3. 앱 정보 입력:
   - 앱 이름: `Stagelog`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 이메일: 본인 이메일
4. **범위(Scopes)** 추가:
   - `email` — 이메일 주소
   - `profile` — 기본 프로필 (이름, 프로필 사진)
   - `openid` — OpenID Connect
5. **테스트 사용자** 추가 (앱이 "테스트" 상태일 때):
   - 테스트할 구글 계정의 이메일 등록
   - **최대 100명**까지 가능 (게시 전까지)

> **게시 상태:** 처음에는 "테스트" 상태다. 테스트 사용자만 로그인 가능하다. 실제 서비스 시 "프로덕션"으로 게시해야 하며, 구글 심사를 받아야 한다.

### 3-3. OAuth 2.0 클라이언트 ID 만들기

1. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `Stagelog Web Client`
5. **승인된 JavaScript 원본:** (비워도 됨 — 백엔드 리다이렉트 방식이므로)
6. **승인된 리디렉션 URI:**
   ```
   http://localhost:8080/api/auth/oauth2/callback/google
   https://api.yourdomain.com/api/auth/oauth2/callback/google
   ```
7. 만들기 → **클라이언트 ID**와 **클라이언트 보안 비밀번호** 확인

### 3-4. 구글 OAuth2 엔드포인트 정리

| 용도 | URL |
|------|-----|
| 인가 코드 요청 | `https://accounts.google.com/o/oauth2/v2/auth` |
| Access Token 요청 | `https://oauth2.googleapis.com/token` |
| 사용자 정보 조회 | `https://www.googleapis.com/oauth2/v2/userinfo` |

### 3-5. 구글 사용자 정보 응답 예시

```json
{
  "id": "109876543210987654321",
  "email": "user@gmail.com",
  "verified_email": true,
  "name": "홍길동",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**우리 시스템 매핑:**

| 구글 응답 필드 | User 엔티티 필드 |
|--------------|-----------------|
| `id` | `providerId` |
| `email` | `email` |
| `name` | `nickname` |
| `picture` | `profileImageUrl` |

---

## 4. 네이버 로그인 설정

### 4-1. 앱 등록

1. [NAVER Developers](https://developers.naver.com/) 접속 → 로그인
2. **Application** → **애플리케이션 등록**
3. 애플리케이션 이름: `Stagelog`
4. **사용 API:** `네이버 로그인` 선택
5. **제공 정보 선택:**

| 권한 | 필수/선택 | 필요 이유 |
|------|-----------|----------|
| **이메일** | 필수 | User.email에 매핑 |
| **별명** | 필수 | User.nickname에 매핑 |
| **프로필 사진** | 선택 | User.profileImageUrl에 매핑 |

6. **환경 추가:** `PC웹` 선택
7. **서비스 URL:**
   ```
   개발: http://localhost:8080
   운영: https://api.yourdomain.com
   ```
8. **Callback URL:**
   ```
   http://localhost:8080/api/auth/oauth2/callback/naver
   https://api.yourdomain.com/api/auth/oauth2/callback/naver
   ```
   (줄바꿈으로 여러 개 등록 가능)
9. 등록 완료 → **Client ID**와 **Client Secret** 확인

### 4-2. 네이버 OAuth2 엔드포인트 정리

| 용도 | URL |
|------|-----|
| 인가 코드 요청 | `https://nid.naver.com/oauth2.0/authorize` |
| Access Token 요청 | `https://nid.naver.com/oauth2.0/token` |
| 사용자 정보 조회 | `https://openapi.naver.com/v1/nid/me` |

### 4-3. 네이버 사용자 정보 응답 예시

```json
{
  "resultcode": "00",
  "message": "success",
  "response": {
    "id": "abc123def456",
    "email": "user@naver.com",
    "nickname": "네이버유저",
    "profile_image": "https://phinf.pstatic.net/..."
  }
}
```

**우리 시스템 매핑:**

| 네이버 응답 필드 | User 엔티티 필드 |
|----------------|-----------------|
| `response.id` | `providerId` |
| `response.email` | `email` |
| `response.nickname` | `nickname` |
| `response.profile_image` | `profileImageUrl` |

> **네이버 특이사항:** 사용자 정보가 `response` 객체 안에 한 단계 중첩되어 있다. DTO 매핑 시 주의.

---

## 5. 환경변수 설정

### 5-1. 백엔드 환경변수

백엔드 주도 방식에서는 **모든 OAuth 설정이 백엔드에 집중**된다.

**`application.yml` 추가 설정:**

```yaml
oauth2:
  kakao:
    client-id: ${KAKAO_CLIENT_ID}
    client-secret: ${KAKAO_CLIENT_SECRET}
    redirect-uri: ${KAKAO_REDIRECT_URI:http://localhost:8080/api/auth/oauth2/callback/kakao}
    token-uri: https://kauth.kakao.com/oauth/token
    user-info-uri: https://kapi.kakao.com/v2/user/me
    authorization-uri: https://kauth.kakao.com/oauth/authorize
  google:
    client-id: ${GOOGLE_CLIENT_ID}
    client-secret: ${GOOGLE_CLIENT_SECRET}
    redirect-uri: ${GOOGLE_REDIRECT_URI:http://localhost:8080/api/auth/oauth2/callback/google}
    token-uri: https://oauth2.googleapis.com/token
    user-info-uri: https://www.googleapis.com/oauth2/v2/userinfo
    authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
    scope: email profile openid
  naver:
    client-id: ${NAVER_CLIENT_ID}
    client-secret: ${NAVER_CLIENT_SECRET}
    redirect-uri: ${NAVER_REDIRECT_URI:http://localhost:8080/api/auth/oauth2/callback/naver}
    token-uri: https://nid.naver.com/oauth2.0/token
    user-info-uri: https://openapi.naver.com/v1/nid/me
    authorization-uri: https://nid.naver.com/oauth2.0/authorize

app:
  frontend-url: ${FRONTEND_URL:http://localhost:5173}
  # 소셜 로그인 완료 후 프론트엔드로 리다이렉트할 URL
  oauth2-success-redirect: ${FRONTEND_URL:http://localhost:5173}/oauth/success
  oauth2-failure-redirect: ${FRONTEND_URL:http://localhost:5173}/oauth/failure
```

### 5-2. 환경변수 파일 (`.env` 또는 시스템 환경변수)

```env
# === 카카오 ===
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# === 구글 ===
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# === 네이버 ===
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# === 프론트엔드 URL ===
FRONTEND_URL=http://localhost:5173
```

### 5-3. 프론트엔드 환경변수

프론트엔드는 **백엔드의 소셜 로그인 진입점 URL만** 알면 된다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

> 프론트엔드에 Client ID, Client Secret, Redirect URI가 **전혀 필요 없다.** 소셜 로그인 버튼은 단순히 백엔드 URL로 이동시키기만 한다.

### 5-4. 환경변수 관리 원칙

```
.env                → git에 올리지 않음 (.gitignore 필수)
.env.example        → 팀원 공유용 (git에 올림, 실제 값 없이 placeholder만)
application.yml     → 기본 설정 + ${} 변수 참조 (git에 올림)
```

**`.env.example` (팀원 공유용):**

```env
# 각 소셜 플랫폼 개발자 콘솔에서 발급
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
FRONTEND_URL=http://localhost:5173
```

---

## 6. 백엔드 구현

### 6-1. 전체 흐름

```
[소셜 로그인 진입]
GET /api/auth/oauth2/{provider}
  → state 생성 + 쿠키에 저장
  → 소셜 플랫폼 인증 페이지로 302 Redirect

[소셜 플랫폼 Callback]
GET /api/auth/oauth2/callback/{provider}?code=xxx&state=xxx
  → state 검증 (CSRF 방지)
  → code → Access Token 교환 (서버 간 HTTP 통신)
  → Access Token → 사용자 정보 조회 (서버 간 HTTP 통신)
  → getOrCreateUser() → User 생성 또는 조회
  → JWT 발급 (Access + Refresh Token)
  → Set-Cookie로 JWT 세팅
  → 프론트엔드로 302 Redirect
```

### 6-2. 패키지 구조

```
auth/
├── controller/
│   └── AuthController              # 기존 자체 로그인 + 소셜 로그인 진입/콜백
├── service/
│   └── AuthService                 # 기존 유지
└── dto/
    ├── SignupRequest
    ├── LoginRequest
    ├── RefreshRequest
    └── TokenResponse

oauth2/
├── OAuth2Properties                # 플랫폼별 Client ID/Secret/URI 설정값
├── OAuth2LoginService              # 소셜 로그인 전체 흐름 오케스트레이터
├── client/
│   ├── OAuth2Client                # 인터페이스 (토큰 교환 + 사용자 정보 조회)
│   ├── KakaoOAuth2Client           # 카카오 구현체
│   ├── GoogleOAuth2Client          # 구글 구현체
│   └── NaverOAuth2Client           # 네이버 구현체
└── dto/
    ├── OAuth2UserInfo              # 통일된 사용자 정보 (provider에 무관)
    ├── KakaoTokenResponse          # 카카오 토큰 응답 매핑
    ├── KakaoUserResponse           # 카카오 사용자 정보 매핑
    ├── GoogleUserResponse          # 구글 사용자 정보 매핑
    └── NaverUserResponse           # 네이버 사용자 정보 매핑
```

### 6-3. 설계 원칙: Strategy Pattern

각 소셜 플랫폼의 **토큰 교환 방식과 사용자 정보 응답 구조가 다르다.** `if-else`로 분기하면 유지보수가 어려워지므로 Strategy Pattern을 사용한다.

```java
// 공통 인터페이스
public interface OAuth2Client {
    Provider getProvider();                            // KAKAO, GOOGLE, NAVER
    String getAccessToken(String code, String redirectUri);  // code → Access Token
    OAuth2UserInfo getUserInfo(String accessToken);     // Access Token → 사용자 정보
}

// 통일된 사용자 정보 DTO
public class OAuth2UserInfo {
    private String providerId;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private Provider provider;
}
```

**각 플랫폼은 이 인터페이스를 구현한다:**

```java
@Component
public class KakaoOAuth2Client implements OAuth2Client {
    @Override
    public Provider getProvider() { return Provider.KAKAO; }

    @Override
    public String getAccessToken(String code, String redirectUri) {
        // POST https://kauth.kakao.com/oauth/token
        // → 카카오 토큰 응답 파싱 → access_token 반환
    }

    @Override
    public OAuth2UserInfo getUserInfo(String accessToken) {
        // GET https://kapi.kakao.com/v2/user/me
        // → 카카오 응답 구조를 OAuth2UserInfo로 변환
    }
}
```

**플랫폼 라우팅 (OAuth2LoginService):**

```java
@Service
public class OAuth2LoginService {
    private final Map<Provider, OAuth2Client> clients;

    // Spring이 OAuth2Client 구현체들을 자동 주입 → Map으로 변환
    public OAuth2LoginService(List<OAuth2Client> clientList) {
        this.clients = clientList.stream()
            .collect(Collectors.toMap(OAuth2Client::getProvider, Function.identity()));
    }

    public OAuth2UserInfo processCallback(Provider provider, String code, String redirectUri) {
        OAuth2Client client = clients.get(provider);
        String accessToken = client.getAccessToken(code, redirectUri);
        return client.getUserInfo(accessToken);
        // 소셜 Access Token은 여기서 사용 후 즉시 폐기 (변수 스코프 종료)
    }
}
```

**새 플랫폼 추가 시:**
1. `NaverOAuth2Client implements OAuth2Client` 구현
2. `Provider` enum에 추가
3. `application.yml`에 설정 추가
4. **기존 코드 수정 없음** (OCP 원칙)

### 6-4. OAuth2 에러 응답 공통화 (커스텀 예외)

각 소셜 플랫폼의 **에러 응답 구조가 모두 다르다.** 이를 그대로 컨트롤러에서 처리하면 `if-else` 분기가 난무하므로, 커스텀 예외로 통일한다.

**플랫폼별 에러 응답 비교:**

| 플랫폼 | 에러 필드명 | 응답 예시 |
|--------|-----------|----------|
| **카카오** | `error`, `error_description` | `{"error": "invalid_grant", "error_description": "authorization code not found"}` |
| **구글** | `error.code`, `error.message`, `error.status` | `{"error": {"code": 401, "message": "Invalid Credentials", "status": "UNAUTHENTICATED"}}` |
| **네이버** | `errorMessage`, `errorCode` | `{"errorMessage": "Authentication failed", "errorCode": "024"}` |

> 카카오는 `error`와 `error_description`, 구글은 중첩 객체 `error.message`, 네이버는 `errorMessage`와 `errorCode`로 필드명이 전부 다르다.

**커스텀 예외 계층:**

```java
/**
 * 소셜 로그인 과정에서 발생하는 모든 예외를 통일하는 커스텀 예외.
 * 각 OAuth2Client 구현체가 플랫폼별 에러를 이 예외로 변환하여 던진다.
 */
public class OAuth2AuthenticationException extends RuntimeException {

    private final Provider provider;        // 어떤 플랫폼에서 발생했는지
    private final String errorCode;         // 통일된 에러 코드
    private final String errorDescription;  // 사람이 읽을 수 있는 설명

    public OAuth2AuthenticationException(Provider provider, String errorCode,
                                          String errorDescription) {
        super(String.format("[%s] %s: %s", provider, errorCode, errorDescription));
        this.provider = provider;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
    }

    public OAuth2AuthenticationException(Provider provider, String errorCode,
                                          String errorDescription, Throwable cause) {
        super(String.format("[%s] %s: %s", provider, errorCode, errorDescription), cause);
        this.provider = provider;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
    }
}
```

**각 OAuth2Client에서 에러를 통일된 예외로 변환:**

```java
// KakaoOAuth2Client — 카카오 에러 응답 변환
@Override
public String getAccessToken(String code, String redirectUri) {
    try {
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUri, request, Map.class);
        Map<String, Object> body = response.getBody();

        if (body.containsKey("error")) {
            // 카카오: {"error": "invalid_grant", "error_description": "..."}
            throw new OAuth2AuthenticationException(
                Provider.KAKAO,
                (String) body.get("error"),              // "invalid_grant"
                (String) body.get("error_description")   // "authorization code not found"
            );
        }
        return (String) body.get("access_token");
    } catch (RestClientException e) {
        throw new OAuth2AuthenticationException(
            Provider.KAKAO, "CONNECTION_ERROR", "카카오 API 연결 실패", e);
    }
}

// GoogleOAuth2Client — 구글 에러 응답 변환
@Override
public OAuth2UserInfo getUserInfo(String accessToken) {
    try {
        // ...
    } catch (HttpClientErrorException e) {
        Map<String, Object> errorBody = objectMapper.readValue(e.getResponseBodyAsString(), Map.class);
        Map<String, Object> error = (Map<String, Object>) errorBody.get("error");
        // 구글: {"error": {"code": 401, "message": "Invalid Credentials", "status": "UNAUTHENTICATED"}}
        throw new OAuth2AuthenticationException(
            Provider.GOOGLE,
            (String) error.get("status"),    // "UNAUTHENTICATED"
            (String) error.get("message")    // "Invalid Credentials"
        );
    }
}

// NaverOAuth2Client — 네이버 에러 응답 변환
@Override
public OAuth2UserInfo getUserInfo(String accessToken) {
    Map<String, Object> body = response.getBody();
    if (!"00".equals(body.get("resultcode"))) {
        // 네이버: {"errorMessage": "Authentication failed", "errorCode": "024"}
        throw new OAuth2AuthenticationException(
            Provider.NAVER,
            (String) body.get("errorCode"),      // "024"
            (String) body.get("errorMessage")    // "Authentication failed"
        );
    }
    // ...
}
```

**GlobalExceptionHandler에서 통일된 처리:**

```java
@ExceptionHandler(OAuth2AuthenticationException.class)
public ResponseEntity<ErrorResponse> handleOAuth2AuthenticationException(
        OAuth2AuthenticationException e) {
    log.error("소셜 로그인 실패: provider={}, errorCode={}, description={}",
            e.getProvider(), e.getErrorCode(), e.getErrorDescription());

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("OAUTH2_AUTHENTICATION_FAILED",
                    "소셜 로그인에 실패했습니다. 다시 시도해주세요."));
}
```

> **핵심 원칙:** 플랫폼별 에러 파싱은 각 `OAuth2Client` 구현체 내부에서 처리하고, 컨트롤러와 서비스 레이어에서는 `OAuth2AuthenticationException`만 다루면 된다. 이렇게 하면 새 플랫폼을 추가해도 예외 처리 코드를 수정할 필요가 없다.

### 6-5. Controller 엔드포인트

```java
@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2Controller {

    // ① 소셜 로그인 진입점 — 프론트엔드에서 이 URL로 이동시키면 됨
    @GetMapping("/{provider}")
    public void redirectToProvider(
            @PathVariable Provider provider,
            HttpServletResponse response) {
        // 1. state 생성 (UUID) → 쿠키에 저장 (CSRF 방지)
        // 2. 소셜 플랫폼 인증 페이지 URL 구성
        // 3. response.sendRedirect(인증 페이지 URL)
    }

    // ② 소셜 플랫폼 Callback — 소셜 플랫폼이 이 URL로 리다이렉트
    @GetMapping("/callback/{provider}")
    public void callback(
            @PathVariable Provider provider,
            @RequestParam String code,
            @RequestParam String state,
            HttpServletRequest request,
            HttpServletResponse response) {
        // 1. state 검증 (쿠키에 저장한 값과 비교)
        // 2. OAuth2LoginService.processCallback(provider, code, redirectUri)
        // 3. UserService.getOrCreateUser(...)
        // 4. AuthService.issueTokens(user)
        // 5. JWT를 HttpOnly Cookie에 세팅
        // 6. response.sendRedirect(프론트엔드 성공 URL)
    }
}
```

### 6-6. state 파라미터로 CSRF 방지

```
[공격 시나리오 - state 없는 경우]
1. 공격자가 자기 소셜 계정으로 인가 코드를 발급받음
2. 이 code가 포함된 Callback URL을 피해자에게 전송
3. 피해자가 클릭하면 → 공격자의 소셜 계정이 피해자의 세션에 연결됨

[방어 - state 사용]
1. 소셜 로그인 진입 시 랜덤 state 생성 → 쿠키에 저장
2. 소셜 플랫폼이 Callback 시 같은 state를 돌려줌
3. 쿠키의 state와 Callback의 state를 비교
4. 일치하지 않으면 → 요청 거부
```

state를 **쿠키**에 저장하는 이유:
- 세션을 사용하지 않는 Stateless 구조이므로 서버 세션에 저장 불가
- 쿠키에 `HttpOnly`, `SameSite=Lax` 설정으로 안전하게 보관
- Callback 처리 후 즉시 삭제

### 6-7. SecurityConfig 변경

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/logout").authenticated()
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/auth/oauth2/**").permitAll()     // 소셜 로그인 진입 + 콜백
    .requestMatchers("/api/performances/**", "/api/migration/**",
            "/performance-admin.html").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

> `/api/auth/oauth2/**`는 `/api/auth/**`에 이미 포함되므로 별도 추가가 필수는 아니지만, 명시적으로 적어두면 가독성이 좋다.

### 6-8. RestTemplate/WebClient 설정

소셜 플랫폼 API 호출에 사용할 HTTP 클라이언트가 필요하다.

```java
@Configuration
public class RestClientConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplateBuilder()
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }
}
```

> Spring Boot 3.2+에서는 `RestClient`를 사용해도 좋다. 핵심은 **타임아웃을 반드시 설정**하는 것이다. 소셜 API가 응답하지 않을 때 무한 대기하면 서버 스레드가 고갈된다.

---

## 7. 프론트엔드 구현

### 7-1. 프론트엔드의 역할

백엔드 주도 방식에서 프론트엔드는 **극도로 단순**하다.

```
1. 소셜 로그인 버튼 클릭 → 백엔드 URL로 이동 (window.location.href)
2. (소셜 로그인 과정은 백엔드가 모두 처리)
3. 로그인 완료 후 → 프론트엔드 성공 페이지로 리다이렉트됨
4. 쿠키에 JWT가 자동 세팅되어 있음 → API 호출 시 자동 전송
```

### 7-2. 로그인 버튼

```typescript
const SocialLoginButtons = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <div>
      <a href={`${API_URL}/api/auth/oauth2/kakao`}>카카오로 로그인</a>
      <a href={`${API_URL}/api/auth/oauth2/google`}>구글로 로그인</a>
      <a href={`${API_URL}/api/auth/oauth2/naver`}>네이버로 로그인</a>
    </div>
  );
};
```

> **`<a href>`로 충분하다.** fetch/axios가 아니라 페이지 이동이므로, 단순한 링크 태그로 구현한다. 팝업 방식을 원한다면 `window.open()`을 사용할 수도 있다.

### 7-3. 성공/실패 페이지

```
/oauth/success → 로그인 성공, 메인 페이지로 리다이렉트
/oauth/failure → 로그인 실패, 에러 메시지 표시 후 로그인 페이지로 안내
```

성공 페이지에서 별도 처리가 필요 없다. JWT는 이미 HttpOnly Cookie에 세팅되어 있으므로, 이후 API 호출 시 **브라우저가 자동으로 쿠키를 전송**한다.

### 7-4. API 호출 시 쿠키 전송

```typescript
// fetch 사용 시
const response = await fetch(`${API_URL}/api/users/me`, {
  credentials: 'include',  // 쿠키를 자동 전송
});

// axios 사용 시
axios.defaults.withCredentials = true;
const response = await axios.get(`${API_URL}/api/users/me`);
```

> **`credentials: 'include'` (fetch) 또는 `withCredentials: true` (axios):** Cross-Origin 요청에서 쿠키를 전송하려면 반드시 이 옵션을 설정해야 한다.

---

## 8. JWT 전달 방식: HttpOnly Cookie

### 8-1. 왜 HttpOnly Cookie인가

| 저장 방식 | XSS 취약 | CSRF 취약 | 설명 |
|----------|---------|----------|------|
| **localStorage** | O (JavaScript로 접근 가능) | X | XSS 공격으로 토큰 탈취 가능 |
| **일반 Cookie** | O (JavaScript로 접근 가능) | O | 두 공격 모두에 취약 |
| **HttpOnly Cookie** (채택) | X (JavaScript 접근 불가) | O → SameSite로 방어 | 가장 안전 |

### 8-2. 쿠키 설정

```java
private void addJwtCookies(HttpServletResponse response, String accessToken, String refreshToken) {
    ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)         // JavaScript에서 접근 불가 (XSS 방어)
            .secure(true)           // HTTPS에서만 전송 (운영 환경)
            .sameSite("Lax")        // 같은 사이트 요청에서만 전송 (CSRF 방어)
            .path("/")              // 모든 경로에서 전송
            .maxAge(3600)           // 1시간 (Access Token 만료와 일치)
            .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Lax")
            .path("/api/auth/refresh")  // 갱신 엔드포인트에서만 전송
            .maxAge(1209600)            // 14일 (Refresh Token 만료와 일치)
            .build();

    response.addHeader("Set-Cookie", accessCookie.toString());
    response.addHeader("Set-Cookie", refreshCookie.toString());
}
```

**각 속성의 역할:**

| 속성 | 값 | 보안 효과 |
|------|-----|----------|
| `httpOnly` | true | JavaScript의 `document.cookie`로 접근 불가 → XSS 방어 |
| `secure` | true | HTTPS에서만 전송 → 네트워크 스니핑 방어 |
| `sameSite` | Lax | 외부 사이트에서의 요청 시 쿠키 미전송 → CSRF 방어 |
| `path` (refresh) | `/api/auth/refresh` | Refresh Token은 갱신 요청에서만 전송 → 노출 최소화 |

### 8-3. SameSite와 CORS 관계

| 환경 | 프론트엔드 | 백엔드 | SameSite | 동작 |
|------|----------|--------|----------|------|
| 개발 | `localhost:5173` | `localhost:8080` | Lax | 같은 도메인이므로 정상 동작 |
| 운영 (같은 도메인) | `stagelog.com` | `api.stagelog.com` | Lax | 서브도메인, domain 속성 설정 필요 |
| 운영 (다른 도메인) | `stagelog.com` | `api-stagelog.com` | None | Secure 필수, CORS 설정 필요 |

> 프론트엔드와 백엔드의 **도메인이 같으면** (서브도메인 포함) `SameSite=Lax`로 충분하다. 도메인이 완전히 다르면 `SameSite=None`으로 설정해야 하며, 이 경우 반드시 `Secure=true`여야 한다.

### 8-4. 운영 환경 쿠키 도메인 설계 (중요)

#### 문제: `secure(true)` + `SameSite=Lax`에서 쿠키가 전달되지 않는 케이스

운영 환경에서 `secure(true)`를 설정하면, **프론트엔드와 백엔드의 도메인이 완전히 다를 경우** `SameSite=Lax` 환경에서 쿠키가 전달되지 않는다. `SameSite=None`으로 변경하면 쿠키가 전달되긴 하지만, CSRF 방어가 약해지고 서드파티 쿠키 차단 정책에 영향을 받는다.

```
[문제 시나리오]
프론트엔드: https://stagelog.com
백엔드:     https://stagelog-api.com   ← 도메인이 완전히 다름

→ SameSite=Lax일 때: 쿠키 전달 안 됨 (Cross-Site로 판단)
→ SameSite=None으로 변경 시: 쿠키는 전달되지만 보안이 약해짐
```

#### 해결: 서브도메인 기반 도메인 설계

**실무에서는 프론트엔드와 백엔드를 같은 루트 도메인의 서브도메인으로 배치한다:**

```
✅ 권장 도메인 구조
프론트엔드: https://stagelog.com         (또는 https://www.stagelog.com)
백엔드:     https://api.stagelog.com

→ 같은 "Site" (stagelog.com)로 판단됨
→ SameSite=Lax에서도 쿠키가 정상 전달됨
```

```
❌ 피해야 할 도메인 구조
프론트엔드: https://stagelog.com
백엔드:     https://stagelog-api.com     ← 다른 Site로 판단됨

프론트엔드: https://stagelog.vercel.app
백엔드:     https://stagelog.fly.dev     ← 다른 Site로 판단됨
```

#### 쿠키 domain 속성 설정

서브도메인 구조에서 쿠키를 공유하려면 `domain` 속성을 루트 도메인으로 설정해야 한다:

```java
ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
        .httpOnly(true)
        .secure(true)
        .sameSite("Lax")
        .path("/")
        .domain(".stagelog.com")    // ← 루트 도메인 (앞에 . 붙임)
        .maxAge(3600)
        .build();
```

> `domain=".stagelog.com"`으로 설정하면 `stagelog.com`, `api.stagelog.com`, `www.stagelog.com` 등 모든 서브도메인에서 쿠키가 공유된다.

#### 환경별 domain 설정

```yaml
# application-local.yml — 개발 환경
app:
  cookie-secure: false
  cookie-domain: localhost    # localhost에서는 domain 설정 불필요 (생략 가능)

# application-prod.yml — 운영 환경
app:
  cookie-secure: true
  cookie-domain: .stagelog.com  # 루트 도메인으로 설정
```

```java
@Value("${app.cookie-domain:}")
private String cookieDomain;

private ResponseCookie buildCookie(String name, String value, int maxAge, String path) {
    ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(isSecure())
            .sameSite("Lax")
            .path(path)
            .maxAge(maxAge);

    if (!cookieDomain.isEmpty()) {
        builder.domain(cookieDomain);  // 운영 환경에서만 domain 설정
    }

    return builder.build();
}
```

#### 도메인 설계 시 체크리스트

| 항목 | 설명 |
|------|------|
| 도메인 구매 | `stagelog.com` 같은 루트 도메인 하나 구매 |
| 프론트엔드 배포 | `stagelog.com` 또는 `www.stagelog.com`에 배포 |
| 백엔드 배포 | `api.stagelog.com`에 배포 |
| DNS 설정 | 각 서브도메인에 대한 A/CNAME 레코드 설정 |
| SSL 인증서 | 와일드카드 인증서 (`*.stagelog.com`) 또는 서브도메인별 발급 |
| 쿠키 domain | `.stagelog.com`으로 설정 |
| SameSite | `Lax` 유지 (보안 유지 + 쿠키 공유) |

> **면접 포인트:** "프론트엔드와 백엔드의 도메인을 서브도메인으로 맞추면 `SameSite=Lax`에서도 쿠키가 공유되어, `SameSite=None`으로 낮출 필요가 없습니다. 이를 통해 CSRF 방어를 유지하면서도 HttpOnly Cookie 기반 인증을 안전하게 운영할 수 있습니다." 이렇게 답변하면 도메인 설계와 보안을 함께 이해하고 있다는 점을 어필할 수 있다.

### 8-5. 개발 환경에서의 secure 설정

로컬 개발 시 HTTPS를 사용하지 않으므로 `secure=true`이면 쿠키가 전송되지 않는다.

```java
// 프로필별 분기
@Value("${spring.profiles.active:local}")
private String activeProfile;

private boolean isSecure() {
    return !"local".equals(activeProfile);
}
```

또는 `application.yml`에서:

```yaml
# application-local.yml
app:
  cookie-secure: false

# application-prod.yml
app:
  cookie-secure: true
```

### 8-6. JwtAuthenticationFilter 변경

기존 필터는 `Authorization: Bearer` 헤더에서 토큰을 추출한다. HttpOnly Cookie 방식으로 전환하면 **쿠키에서 토큰을 추출**하도록 변경해야 한다.

```java
// 기존: Authorization 헤더에서 추출
String token = resolveTokenFromHeader(request);

// 변경: 쿠키에서 추출 (헤더 방식도 fallback으로 유지)
String token = resolveTokenFromCookie(request);
if (token == null) {
    token = resolveTokenFromHeader(request);  // 모바일 앱 등 쿠키 불가 환경 대비
}
```

```java
private String resolveTokenFromCookie(HttpServletRequest request) {
    if (request.getCookies() == null) return null;
    return Arrays.stream(request.getCookies())
            .filter(cookie -> "access_token".equals(cookie.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);
}
```

> **헤더 방식을 fallback으로 유지하는 이유:** 모바일 앱이나 Postman 테스트 등 쿠키를 사용하기 어려운 환경에서도 동작하도록 하기 위함이다.

### 8-7. 로그아웃 시 쿠키 삭제

```java
@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletResponse response) {
    // Refresh Token DB 삭제
    // ...

    // 쿠키 만료 처리
    ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
            .httpOnly(true).secure(true).sameSite("Lax")
            .path("/").maxAge(0).build();

    ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
            .httpOnly(true).secure(true).sameSite("Lax")
            .path("/api/auth/refresh").maxAge(0).build();

    response.addHeader("Set-Cookie", accessCookie.toString());
    response.addHeader("Set-Cookie", refreshCookie.toString());

    return ResponseEntity.noContent().build();
}
```

### 8-8. 토큰 갱신 흐름 변경

기존의 `POST /api/auth/refresh`는 Request Body로 Refresh Token을 받았지만, 쿠키 방식에서는 **쿠키에서 자동으로 추출**한다.

```java
@PostMapping("/refresh")
public ResponseEntity<Void> refresh(
        HttpServletRequest request,
        HttpServletResponse response) {
    // 쿠키에서 Refresh Token 추출
    String refreshToken = resolveRefreshTokenFromCookie(request);

    // 기존 갱신 로직
    TokenResponse tokens = authService.refresh(refreshToken);

    // 새 토큰을 쿠키에 세팅
    addJwtCookies(response, tokens.getAccessToken(), tokens.getRefreshToken());

    return ResponseEntity.noContent().build();
}
```

> `RefreshRequest` DTO가 더 이상 필요 없어진다. 쿠키에서 직접 추출하기 때문이다.

---

## 9. 테스트 및 디버깅

### 9-1. 단계별 테스트 순서

```
① 소셜 플랫폼 설정 확인
  → 브라우저에서 http://localhost:8080/api/auth/oauth2/kakao 접속
  → 카카오 로그인 화면으로 리다이렉트되면 OK
  → "redirect_uri mismatch" 에러 → 콘솔의 Redirect URI 확인

② Callback 수신 확인
  → 소셜 로그인 완료 후 백엔드 Callback URL로 돌아오는지 확인
  → 서버 로그에서 code 파라미터 수신 확인

③ 토큰 교환 + 사용자 정보 조회 확인
  → 서버 로그에서 소셜 Access Token 수신 확인
  → 서버 로그에서 사용자 정보 (email, nickname) 수신 확인

④ JWT 발급 + 쿠키 세팅 확인
  → 프론트엔드로 리다이렉트된 후 브라우저 개발자 도구 →
    Application 탭 → Cookies에서 access_token, refresh_token 확인
  → HttpOnly 플래그가 true인지 확인

⑤ 인증된 API 호출 확인
  → GET /api/users/me 호출 (credentials: include)
  → 프로필 정보가 반환되면 OK

⑥ DB 확인
  → users 테이블에 소셜 사용자가 생성되었는지 확인
  → provider, provider_id, email 값이 올바른지 확인
```

### 9-2. 자주 발생하는 에러

| 에러 | 원인 | 해결 |
|------|------|------|
| `redirect_uri_mismatch` | 소셜 콘솔에 등록한 URI와 백엔드 설정이 다름 | 정확히 일치하는지 확인 (끝에 `/` 유무, http vs https 포함) |
| `invalid_client` | Client ID/Secret이 잘못됨 | 환경변수가 제대로 로드되었는지 확인 |
| `invalid_grant` | 인가 코드가 만료됨 (보통 5분) | 코드 수신 후 즉시 토큰 교환하는지 확인 |
| `KOE101` (카카오) | 잘못된 앱 키 | REST API 키를 사용하고 있는지 확인 |
| `403 Forbidden` (네이버) | 테스트 사용자가 아님 | 네이버 콘솔에서 테스트 계정 등록 |
| 쿠키가 세팅 안 됨 | SameSite/Secure 설정 문제 | 개발 환경에서 secure=false인지 확인 |
| 쿠키가 전송 안 됨 | credentials 미설정 | fetch에 `credentials: 'include'` 추가 |
| CORS 에러 | 쿠키 전송 시 CORS 설정 불일치 | `allowCredentials(true)` + `allowedOrigins` 명시 (와일드카드 불가) |

### 9-3. CORS 설정 주의사항

쿠키 기반 인증에서 `allowCredentials(true)`를 사용하면 `allowedOrigins("*")`가 **금지**된다. 반드시 구체적인 도메인을 명시해야 한다.

```java
// SecurityConfig의 CORS 설정
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",       // 개발
    "https://stagelog.com"         // 운영 (추후)
));
configuration.setAllowCredentials(true);  // 쿠키 전송 허용
```

### 9-4. Postman으로 자체 로그인 테스트

소셜 로그인은 브라우저 리다이렉트 기반이므로 Postman으로 테스트하기 어렵다. 자체 로그인 API(`POST /api/auth/login`)는 기존대로 Postman에서 테스트 가능하다.

소셜 로그인은 **브라우저에서 직접 테스트**한다:
1. 브라우저 주소창에 `http://localhost:8080/api/auth/oauth2/kakao` 입력
2. 카카오 로그인 진행
3. 프론트엔드로 리다이렉트 확인
4. 개발자 도구에서 쿠키 확인

---

## 10. 운영 배포 시 주의사항

### 10-1. 도메인 변경 체크리스트

| 항목 | 변경 내용 |
|------|----------|
| 카카오 콘솔 | Redirect URI를 운영 백엔드 URL로 추가 |
| 구글 콘솔 | 승인된 리디렉션 URI를 운영 백엔드 URL로 추가 |
| 네이버 콘솔 | Callback URL을 운영 백엔드 URL로 추가 |
| `application.yml` | redirect-uri를 운영 도메인으로 변경 (환경변수) |
| CORS 설정 | 운영 프론트엔드 도메인 추가 |
| 쿠키 설정 | `secure=true`, 운영 domain 설정 |

### 10-2. 앱 심사/검수

| 플랫폼 | 상태 | 해야 할 일 |
|--------|------|-----------|
| **카카오** | 기본 상태로 사용 가능 | 이메일 필수 동의가 필요하면 비즈 앱 전환 |
| **구글** | "테스트" → "프로덕션" 전환 필요 | 개인정보처리방침 URL 제출, 구글 심사 (1~2주) |
| **네이버** | 기본 상태로 테스트 가능 | 서비스 적용을 위해 검수 요청 필요 |

### 10-3. HTTPS 필수

- 구글은 운영 환경에서 **HTTPS**가 필수 (localhost는 예외)
- `secure=true` 쿠키는 HTTPS에서만 전송됨
- Let's Encrypt 등으로 SSL 인증서를 발급받아 적용

### 10-4. 보안 체크리스트

- [ ] Client ID, Client Secret이 백엔드 환경변수에만 존재하는지 확인
- [ ] 프론트엔드 코드에 소셜 관련 Secret이 포함되어 있지 않은지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] state 파라미터로 CSRF 공격을 방지하는지 확인
- [ ] 소셜 Access Token이 서버 메모리에서만 사용되고 로그에 남지 않는지 확인
- [ ] JWT가 HttpOnly, Secure, SameSite 쿠키에 저장되는지 확인
- [ ] Refresh Token 쿠키의 path가 `/api/auth/refresh`로 제한되었는지 확인
- [ ] 운영 환경에서 `secure=true`인지 확인
- [ ] CORS에 `allowedOrigins`가 구체적 도메인으로 지정되었는지 확인 (와일드카드 X)
- [ ] 소셜 플랫폼에서 요청한 권한(scope)이 최소한인지 확인
- [ ] RestTemplate 타임아웃이 설정되어 있는지 확인

---

## 부록: 구현 순서 권장

처음부터 세 플랫폼을 동시에 구현하지 말고, **하나씩 순서대로** 진행하는 것을 권장한다.

### 권장 순서: 카카오 → 구글 → 네이버

| 순서 | 플랫폼 | 이유 |
|------|--------|------|
| 1 | **카카오** | 한국 서비스 기준 가장 많이 사용. 문서가 한국어. |
| 2 | **구글** | 글로벌 표준 OAuth2. 가장 정석적인 구현. |
| 3 | **네이버** | 응답 구조가 독특 (`response` 중첩). 검수 절차가 있음. |

### 단계별 마일스톤

```
[Phase 1] 인프라 구축
  □ OAuth2Properties, OAuth2Client 인터페이스, OAuth2UserInfo DTO 생성
  □ OAuth2LoginService (Strategy Pattern 라우팅) 구현
  □ OAuth2Controller (진입점 + 콜백) 구현
  □ JwtAuthenticationFilter 쿠키 추출 로직 추가
  □ HttpOnly Cookie 유틸 메서드 구현
  □ SecurityConfig / CORS 설정 업데이트

[Phase 2] 카카오 로그인
  □ 카카오 개발자 콘솔 앱 등록 (Redirect URI = 백엔드)
  □ KakaoOAuth2Client 구현
  □ 카카오 토큰/사용자 정보 응답 DTO 매핑
  □ E2E 테스트: 로그인 → 쿠키 세팅 → 프로필 조회

[Phase 3] 구글 로그인 추가
  □ 구글 Cloud Console 설정
  □ GoogleOAuth2Client 구현
  □ E2E 테스트

[Phase 4] 네이버 로그인 추가
  □ 네이버 개발자 센터 설정
  □ NaverOAuth2Client 구현
  □ E2E 테스트

[Phase 5] 마무리
  □ 자체 로그인도 HttpOnly Cookie 방식으로 통일
  □ 로그아웃 시 쿠키 삭제 처리
  □ 토큰 갱신 흐름 (쿠키 기반) 검증
  □ 소셜 앱 심사/검수 진행
```

---

## 부록: 기존 코드 변경 사항 정리

백엔드 주도 방식을 적용하면 기존 코드에서 다음이 변경된다:

### 제거/대체되는 것

| 기존 | 변경 |
|------|------|
| `POST /api/auth/oauth2/login` (프론트가 사용자 정보 전달) | `GET /api/auth/oauth2/{provider}` + `GET /api/auth/oauth2/callback/{provider}` (백엔드가 직접 조회) |
| `OAuth2LoginRequest` DTO (프론트에서 보내는 사용자 정보) | `OAuth2UserInfo` DTO (백엔드가 소셜 API에서 직접 파싱) |
| `AuthService.loginWithOAuth2(OAuth2LoginRequest)` | `OAuth2LoginService.processCallback()` + `AuthService.issueTokens()` |
| `TokenResponse`를 JSON Body로 반환 | JWT를 HttpOnly Cookie로 세팅 |
| `Authorization: Bearer` 헤더로 토큰 전달 | 쿠키에서 토큰 추출 (헤더도 fallback 유지) |
| `RefreshRequest` DTO (Body로 Refresh Token 전달) | 쿠키에서 Refresh Token 추출 |

### 유지되는 것

| 항목 | 이유 |
|------|------|
| `UserService.getOrCreateUser()` | 소셜 사용자 생성/조회 로직은 동일 |
| `User.createSocialUser()` | 엔티티 생성 로직은 동일 |
| `Provider` enum | 동일 |
| `AuthService.issueTokens()` | JWT 발급 로직은 동일 |
| `JwtTokenProvider` | JWT 생성/검증은 동일 |
| `RefreshToken` 엔티티 | Refresh Token 저장 로직은 동일 |
| `POST /api/auth/login` (자체 로그인) | 자체 로그인은 기존대로 유지 (추후 쿠키 방식으로 통일) |
