// API 페이징 응답 타입 (Spring Data Page)
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// API 에러 응답 타입
export interface ApiError {
  message: string;
  status: number;
}

// API 공통 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
