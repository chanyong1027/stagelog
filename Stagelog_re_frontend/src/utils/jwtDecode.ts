/**
 * JWT 토큰 디코딩 유틸리티
 */

interface JwtPayload {
  sub: string; // email (백엔드에서 email을 sub으로 저장)
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * JWT 토큰을 디코딩하여 payload 반환
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};
