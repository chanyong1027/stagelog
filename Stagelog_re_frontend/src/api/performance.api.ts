import client from './client';
import {
  PerformanceListItem,
  PerformanceDetail,
  PerformanceFilters,
  CalendarPerformance
} from '../types/performance.types';
import { PageResponse } from '../types/common.types';

/**
 * 공연 관련 API
 */
export const performanceAPI = {
  /**
   * 공연 목록 조회
   * @param params - 필터 파라미터 (isFestival, keyword, page, size, sort)
   * @returns 페이징된 공연 목록
   */
  getPerformances: (params: PerformanceFilters) =>
    client.get<PageResponse<PerformanceListItem>>('/api/performances', { params }),

  /**
   * 공연 상세 조회
   * @param id - 공연 ID
   * @returns 공연 상세 정보
   */
  getPerformanceById: (id: number) =>
    client.get<PerformanceDetail>(`/api/performances/${id}`),

  /**
   * 월별 공연 조회 (캘린더용)
   * @param year - 연도
   * @param month - 월 (1-12)
   * @returns 해당 월의 공연 목록
   */
  getCalendarPerformances: (year: number, month: number) =>
    client.get<CalendarPerformance[]>('/api/performances/calendar', {
      params: { year, month },
    }),
};
