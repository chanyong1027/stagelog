import { useState } from 'react';
import { PAGINATION } from '../utils/constants';

interface UsePaginationProps {
  initialPage?: number;
  initialSize?: number;
}

interface UsePaginationReturn {
  page: number;
  size: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  resetPage: () => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

/**
 * 페이지네이션 Hook
 * - 페이지 번호와 크기 관리
 * - 페이지 이동 헬퍼 함수 제공
 *
 * @param initialPage - 초기 페이지 (기본값: 0)
 * @param initialSize - 초기 페이지 크기 (기본값: 6)
 * @returns 페이지네이션 상태 및 제어 함수
 *
 * @example
 * const PerformanceList = () => {
 *   const { page, size, setPage, nextPage, prevPage } = usePagination();
 *   const { data } = usePerformances({ page, size });
 *
 *   return (
 *     <div>
 *       <button onClick={prevPage}>이전</button>
 *       <span>Page {page + 1}</span>
 *       <button onClick={nextPage}>다음</button>
 *     </div>
 *   );
 * };
 */
export const usePagination = ({
  initialPage = PAGINATION.DEFAULT_PAGE,
  initialSize = PAGINATION.DEFAULT_SIZE,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  // 첫 페이지로 리셋
  const resetPage = () => {
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  // 다음 페이지
  const nextPage = () => {
    setPage((prev) => prev + 1);
  };

  // 이전 페이지
  const prevPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  // 특정 페이지로 이동
  const goToPage = (targetPage: number) => {
    setPage(Math.max(0, targetPage));
  };

  return {
    page,
    size,
    setPage,
    setSize,
    resetPage,
    nextPage,
    prevPage,
    goToPage,
  };
};
