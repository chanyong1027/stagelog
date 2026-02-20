import { format, parseISO, isValid, differenceInDays, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 'yyyy.MM.dd' 형식으로 포맷팅
 * @param date - 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, 'yyyy.MM.dd', { locale: ko });
  } catch {
    return '-';
  }
};

/**
 * 날짜를 'yyyy.MM.dd HH:mm' 형식으로 포맷팅
 * @param date - 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 날짜시간 문자열
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, 'yyyy.MM.dd HH:mm', { locale: ko });
  } catch {
    return '-';
  }
};

/**
 * 날짜 범위를 'yyyy.MM.dd ~ yyyy.MM.dd' 형식으로 포맷팅
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 포맷팅된 날짜 범위 문자열
 */
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === '-' || end === '-') return '-';
  if (start === end) return start;

  return `${start} ~ ${end}`;
};

/**
 * 년월을 'yyyy년 MM월' 형식으로 포맷팅
 * @param year - 년도
 * @param month - 월 (1-12)
 * @returns 포맷팅된 년월 문자열
 */
export const formatYearMonth = (year: number, month: number): string => {
  try {
    const date = new Date(year, month - 1, 1);
    if (!isValid(date)) return '-';
    return format(date, 'yyyy년 MM월', { locale: ko });
  } catch {
    return '-';
  }
};

/**
 * D-Day 계산 (공연까지 남은 일수)
 * @param date - 대상 날짜
 * @returns D-Day 문자열 (예: 'D-7', 'D-Day', '종료')
 */
export const getDday = (date: string | Date): string => {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(targetDate)) return '-';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diff = differenceInDays(targetDate, today);

    if (diff < 0) return '종료';
    if (diff === 0) return 'D-Day';
    return `D-${diff}`;
  } catch {
    return '-';
  }
};

/**
 * 공연 상태 확인 (공연중, 공연예정, 공연완료)
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 공연 상태 문자열
 */
export const getPerformanceStatus = (startDate: string | Date, endDate: string | Date): string => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) return '-';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start) return '공연예정';
    if (today > end) return '공연완료';
    return '공연중';
  } catch {
    return '-';
  }
};

/**
 * 다음 달 계산
 * @param year - 현재 년도
 * @param month - 현재 월 (1-12)
 * @returns 다음 달의 { year, month }
 */
export const getNextMonth = (year: number, month: number): { year: number; month: number } => {
  const date = new Date(year, month - 1, 1);
  const nextMonth = addMonths(date, 1);
  return {
    year: nextMonth.getFullYear(),
    month: nextMonth.getMonth() + 1,
  };
};

/**
 * 이전 달 계산
 * @param year - 현재 년도
 * @param month - 현재 월 (1-12)
 * @returns 이전 달의 { year, month }
 */
export const getPrevMonth = (year: number, month: number): { year: number; month: number } => {
  const date = new Date(year, month - 1, 1);
  const prevMonth = subMonths(date, 1);
  return {
    year: prevMonth.getFullYear(),
    month: prevMonth.getMonth() + 1,
  };
};

/**
 * API 형식으로 날짜 포맷팅 (yyyy-MM-dd)
 * @param date - 날짜 객체
 * @returns API 형식의 날짜 문자열
 */
export const formatDateForAPI = (date: Date): string => {
  try {
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

/**
 * 현재 년월 가져오기
 * @returns 현재 { year, month }
 */
export const getCurrentYearMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};
