import client from './client';
import {
  ReviewListItem,
  ReviewDetail,
  ReviewCreateRequest,
  ReviewUpdateRequest,
} from '../types/review.types';

/**
 * 리뷰 관련 API
 */
export const reviewAPI = {
  /**
   * 리뷰 생성
   * @param data - 리뷰 생성 요청 데이터 (title, content, tracks)
   * @returns 생성된 리뷰 ID
   */
  createReview: (data: ReviewCreateRequest) =>
    client.post<number>('/api/reviews', data),

  /**
   * 내 리뷰 목록 조회
   * @returns 내가 작성한 리뷰 목록
   */
  getMyReviews: () =>
    client.get<ReviewListItem[]>('/api/reviews'),

  /**
   * 리뷰 상세 조회
   * @param id - 리뷰 ID
   * @returns 리뷰 상세 정보 (제목, 내용, 트랙 목록 포함)
   */
  getReviewById: (id: number) =>
    client.get<ReviewDetail>(`/api/reviews/${id}`),

  /**
   * 리뷰 수정
   * @param id - 리뷰 ID
   * @param data - 리뷰 수정 요청 데이터 (title, content, tracks)
   * @returns 수정된 리뷰 상세 정보
   */
  updateReview: (id: number, data: ReviewUpdateRequest) =>
    client.put<ReviewDetail>(`/api/reviews/${id}`, data),

  /**
   * 리뷰 삭제
   * @param id - 리뷰 ID
   * @returns void (204 No Content)
   */
  deleteReview: (id: number) =>
    client.delete(`/api/reviews/${id}`),
};
