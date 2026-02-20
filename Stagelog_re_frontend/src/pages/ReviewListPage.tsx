import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyReviews, useDeleteReview } from '../hooks/useReviews';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { formatDate } from '../utils/dateFormatter';

/**
 * 내 리뷰 목록 페이지 - Neon Night 테마
 * 다크 배경 + 글래스 카드 + 네온 액센트
 */
const ReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: reviews, isLoading } = useMyReviews();
  const { mutate: deleteReview } = useDeleteReview();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleReviewClick = (id: number) => {
    navigate(ROUTES.REVIEW_DETAIL(id));
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`"${title}" 리뷰를 삭제하시겠습니까?`)) {
      setDeletingId(id);
      deleteReview(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
        onError: () => {
          setDeletingId(null);
          alert('리뷰 삭제에 실패했습니다.');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 배경 메쉬 그라데이션 */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <Header />

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl"></span>
              <h1 className="text-display text-text-primary">내 리뷰</h1>
            </div>
            <p className="text-text-secondary text-lg">
              공연 후기를 확인하고 관리하세요
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.REVIEW_CREATE)} size="lg" className="btn-neon">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            리뷰 작성
          </Button>
        </div>

        {/* 리뷰 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative bg-bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  {/* 상단 그라데이션 라인 */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* 리뷰 정보 */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleReviewClick(review.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* 아이콘 */}
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 border border-primary/20">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>

                        {/* 제목 및 날짜 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {review.title}
                          </h3>
                          <p className="text-sm text-text-muted flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 md:ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewClick(review.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-surface rounded-xl border border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
                      >
                        상세보기
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(review.id, review.title);
                        }}
                        disabled={deletingId === review.id}
                        className="px-4 py-2 text-sm font-medium text-accent bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === review.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 리뷰 없음
          <div className="animate-fade-in-up">
            <div className="relative bg-bg-card rounded-2xl border border-border p-12 text-center overflow-hidden">
              {/* 배경 글로우 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  작성한 리뷰가 없습니다
                </h3>
                <p className="text-text-secondary mb-8">
                  공연 후기를 작성하고 기억을 남겨보세요
                </p>
                <Button onClick={() => navigate(ROUTES.REVIEW_CREATE)} size="lg" className="btn-neon">
                  첫 리뷰 작성하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReviewListPage;
