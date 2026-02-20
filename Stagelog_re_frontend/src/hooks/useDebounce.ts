import { useState, useEffect } from 'react';

/**
 * Debounce Hook
 * - 입력값이 변경될 때마다 일정 시간 대기 후 값 업데이트
 * - 검색 입력 등에 유용
 *
 * @param value - debounce할 값
 * @param delay - 지연 시간 (ms)
 * @returns debounced된 값
 *
 * @example
 * const SearchComponent = () => {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *
 *   useEffect(() => {
 *     // debouncedSearch가 변경될 때만 API 호출
 *     fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 *
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
 * };
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 시간 후에 값 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup: 이전 타이머 취소
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
