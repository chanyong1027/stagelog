import client from './client';
import {
    IPCreateRequest,
    IPCreateResponse,
    InterestedPerformanceItem,
} from '../types/interestedPerformance.types';

/**
 * 관심 공연 관련 API
 */
export const interestedPerformanceAPI = {
    /**
     * 관심 공연 추가
     * @param data - 공연 ID를 포함한 요청 데이터
     * @returns 생성된 관심 공연 응답
     */
    addInterestedPerformance: (data: IPCreateRequest) =>
        client.post<IPCreateResponse>('/api/interested-performances', data),

    /**
     * 내 관심 공연 목록 조회
     * @returns 관심 공연 목록
     */
    getMyInterestedPerformances: () =>
        client.get<InterestedPerformanceItem[]>('/api/interested-performances'),

    /**
     * 관심 공연 삭제
     * @param performanceId - 삭제할 공연 ID
     * @returns 삭제된 관심 공연 ID
     */
    deleteInterestedPerformance: (performanceId: number) =>
        client.delete<number>(`/api/interested-performances/${performanceId}`),
};
