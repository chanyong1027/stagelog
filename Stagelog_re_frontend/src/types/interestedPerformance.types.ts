/**
 * 관심 공연 관련 타입 정의
 */

// 관심 공연 생성 요청
export interface IPCreateRequest {
  performanceId: number;
}

// 관심 공연 생성 응답
export interface IPCreateResponse {
  id: number;
}

// 관심 공연 목록 아이템
export interface InterestedPerformanceItem {
  id: number;
  performanceId: number;
  title: string;
  posterUrl: string;  // 포스터 URL
  startDate: string;
  endDate: string;
  venue: string;
}
