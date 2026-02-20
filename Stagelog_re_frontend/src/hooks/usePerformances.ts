import { useQuery } from '@tanstack/react-query';
import { performanceAPI } from '../api/performance.api';
import { PerformanceFilters } from '../types/performance.types';

/**
 * 공연 목록 조회 Hook
 * @param filters - 필터 파라미터 (isFestival, keyword, page, size, sort)
 */
export const usePerformances = (filters: PerformanceFilters) => {
  return useQuery({
    queryKey: ['performances', filters],
    queryFn: () => performanceAPI.getPerformances(filters).then(res => res.data),
    enabled: true,
  });
};

/**
 * 공연 상세 조회 Hook
 * @param id - 공연 ID
 */
export const usePerformanceDetail = (id: number) => {
  return useQuery({
    queryKey: ['performance', id],
    queryFn: () => performanceAPI.getPerformanceById(id).then(res => res.data),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
};

/**
 * 월별 캘린더 공연 조회 Hook
 * @param year - 연도
 * @param month - 월 (1-12)
 */
export const useCalendarPerformances = (year: number, month: number) => {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => performanceAPI.getCalendarPerformances(year, month).then(res => res.data),
    enabled: !!year && !!month, // year와 month가 있을 때만 쿼리 실행
  });
};
