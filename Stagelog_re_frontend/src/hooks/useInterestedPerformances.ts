import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { toast } from 'react-hot-toast';
import { interestedPerformanceAPI } from '../api/interestedPerformance.api';
import { IPCreateRequest } from '../types/interestedPerformance.types';

/**
 * 내 관심 공연 목록 조회 Hook
 */
export const useMyInterestedPerformances = () => {
    return useQuery({
        queryKey: ['interestedPerformances'],
        queryFn: () => interestedPerformanceAPI.getMyInterestedPerformances().then(res => res.data),
    });
};

/**
 * 특정 공연이 관심 공연인지 확인하는 Hook
 * @param performanceId - 확인할 공연 ID
 */
export const useIsInterestedPerformance = (performanceId: number) => {
    const { data: interestedPerformances } = useMyInterestedPerformances();

    if (!interestedPerformances) return false;

    return interestedPerformances.some(ip => ip.performanceId === performanceId);
};

/**
 * 관심 공연 추가 Hook
 */
export const useAddInterestedPerformance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IPCreateRequest) => interestedPerformanceAPI.addInterestedPerformance(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interestedPerformances'] });
            // toast.success('관심 공연에 추가되었습니다.');
        },
        onError: () => {
            // toast.error('관심 공연 추가에 실패했습니다.');
        },
    });
};

/**
 * 관심 공연 삭제 Hook
 */
export const useDeleteInterestedPerformance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (performanceId: number) => interestedPerformanceAPI.deleteInterestedPerformance(performanceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interestedPerformances'] });
            // toast.success('관심 공연에서 삭제되었습니다.');
        },
        onError: () => {
            // toast.error('관심 공연 삭제에 실패했습니다.');
        },
    });
};
