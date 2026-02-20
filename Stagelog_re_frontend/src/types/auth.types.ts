// 로그인 요청
export interface LoginRequest {
  userId: string;
  password: string;
}

// 로그인/리프레시 응답 (백엔드 TokenResponse)
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  nickname: string;
}

// 회원가입 요청
export interface SignupRequest {
  userId: string;
  nickname: string;
  email: string;
  password: string;
}

// 사용자 역할
export type Role = 'USER' | 'ADMIN';

// 사용자 정보
export interface User {
  id: number;
  userId: string;
  nickname: string;
  email: string;
  role: Role;
}

// localStorage에 저장할 사용자 정보
export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
}
