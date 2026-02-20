import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviewDetail, useDeleteReview } from '../hooks/useReviews';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { formatDateTime } from '../utils/dateFormatter';

/**
 * 리뷰 상세 페이지 - Neon Night 테마
 * 다크 배경 + 글래스 카드 + Spotify 스타일 트랙 리스트
 */
const ReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reviewId = Number(id);

  const { data: review, isLoading, error } = useReviewDetail(reviewId);
  const { mutate: deleteReview } = useDeleteReview();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      setIsDeleting(true);
      deleteReview(reviewId, {
        onError: () => {
          setIsDeleting(false);
          alert('리뷰 삭제에 실패했습니다.');
        },
      });
    }
  };

  const handleEdit = () => {
    navigate(ROUTES.REVIEW_EDIT(reviewId));
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  // 에러 또는 데이터 없음
  if (error || !review) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <Header />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="bg-bg-card rounded-2xl border border-border p-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-surface border border-border flex items-center justify-center">
              <span className="text-4xl">😢</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              리뷰를 불러올 수 없습니다
            </h2>
            <p className="text-text-secondary mb-8">
              요청하신 리뷰를 찾을 수 없거나 오류가 발생했습니다.
            </p>
            <Button onClick={() => navigate(ROUTES.REVIEWS)} className="btn-neon">
              리뷰 목록으로
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 배경 메쉬 그라데이션 */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <Header />

      {/* 뒤로가기 바 */}
      <div className="relative border-b border-border/50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-sm text-text-secondary hover:text-primary transition-colors duration-300"
          >
            <svg
              className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
        </div>
      </div>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {/* 리뷰 헤더 카드 */}
        <div className="animate-fade-in-up">
          <div className="relative bg-bg-card rounded-2xl border border-border p-8 mb-6 overflow-hidden">
            {/* 상단 그라데이션 라인 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {/* 배경 글로우 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <h1 className="text-headline md:text-display text-text-primary mb-4 leading-tight">
                    {review.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface rounded-lg border border-border">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateTime(review.createdAt)}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    size="sm"
                    disabled={isDeleting}
                    className="bg-bg-surface border-border hover:border-primary/50"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    수정
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="danger"
                    size="sm"
                    disabled={isDeleting}
                    loading={isDeleting}
                    className="bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </Button>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* 리뷰 본문 (HTML 렌더링) */}
              <div className="mt-8">
                <div
                  className="prose prose-invert prose-lg max-w-none
                    prose-headings:text-text-primary
                    prose-p:text-text-secondary
                    prose-a:text-primary hover:prose-a:text-primary-light
                    prose-strong:text-text-primary
                    prose-blockquote:border-primary/50 prose-blockquote:bg-bg-surface/50 prose-blockquote:rounded-r-lg prose-blockquote:py-2
                    prose-code:text-accent prose-code:bg-bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-bg-deep prose-pre:border prose-pre:border-border
                    prose-img:rounded-xl prose-img:border prose-img:border-border"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 셋리스트 (플레이리스트) 섹션 */}
        {review.tracks && review.tracks.length > 0 && (
          <div className="animate-fade-in-up stagger-1">
            <div className="relative bg-bg-card rounded-2xl border border-border p-8 overflow-hidden">
              {/* 상단 그라데이션 라인 */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

              {/* 헤더 */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{review.playlistTitle || '플레이리스트'}</h2>
                  <p className="text-sm text-text-muted">
                    공연에서 들었던 곡 <span className="text-secondary font-semibold">{review.tracks.length}</span>곡
                  </p>
                </div>
              </div>

              {/* 트랙 리스트 */}
              <div className="space-y-2">
                {review.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 p-4 bg-bg-surface/50 rounded-xl border border-border/50 hover:bg-bg-surface hover:border-border transition-all duration-300"
                  >
                    {/* 트랙 번호 */}
                    <div className="flex-shrink-0 w-8 h-8 bg-bg-card rounded-lg flex items-center justify-center text-sm font-semibold text-text-muted group-hover:bg-secondary group-hover:text-white transition-all duration-300 border border-border group-hover:border-secondary">
                      {index + 1}
                    </div>

                    {/* 앨범 아트 */}
                    {track.albumImageUrl ? (
                      <img
                        src={track.albumImageUrl}
                        alt={track.title}
                        className="w-14 h-14 rounded-lg object-cover shadow-md border border-border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-bg-elevated to-bg-card rounded-lg flex items-center justify-center shadow-md border border-border">
                        <svg className="w-7 h-7 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                    )}

                    {/* 트랙 정보 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary truncate text-lg group-hover:text-secondary transition-colors duration-300">
                        {track.title}
                      </h4>
                      {track.artistName && (
                        <p className="text-sm text-text-muted truncate">
                          {track.artistName}
                        </p>
                      )}
                    </div>

                    {/* Spotify 링크 */}
                    {track.spotifyId && (
                      <a
                        href={`https://open.spotify.com/track/${track.spotifyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-3 text-text-muted hover:text-secondary bg-bg-card rounded-xl border border-border hover:border-secondary/50 transition-all duration-300"
                        title="Spotify에서 듣기"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Spotify 안내 */}
              <div className="mt-6 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  각 곡의 Spotify 아이콘을 클릭하면 해당 곡을 들을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReviewDetailPage;
