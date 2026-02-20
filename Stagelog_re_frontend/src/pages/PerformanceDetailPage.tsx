import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePerformanceDetail } from '../hooks/usePerformances';
import {
  useMyInterestedPerformances,
  useAddInterestedPerformance,
  useDeleteInterestedPerformance
} from '../hooks/useInterestedPerformances';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { formatDateRange } from '../utils/dateFormatter';
import { ROUTES } from '../utils/constants';

/**
 * 공연 상세 페이지 - Neon Night 테마
 * 시네마틱 히어로 + 글래스 정보 카드 + 네온 CTA
 */
const PerformanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const performanceId = Number(id);

  const { data: performance, isLoading, error } = usePerformanceDetail(performanceId);

  // 페이지 진입 시 스크롤을 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 관심 공연 관련 hooks
  const { data: interestedPerformances } = useMyInterestedPerformances();
  const addInterested = useAddInterestedPerformance();
  const deleteInterested = useDeleteInterestedPerformance();

  // 현재 공연이 관심 공연인지 확인
  const isInterested = interestedPerformances?.some(ip => ip.performanceId === performanceId) ?? false;

  // 관심 공연 토글 핸들러
  const handleToggleInterested = () => {
    if (isInterested) {
      deleteInterested.mutate(performanceId);
    } else {
      addInterested.mutate({ performanceId });
    }
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
  if (error || !performance) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <Header />
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-surface border border-border flex items-center justify-center">
            <span className="text-5xl">😢</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            공연 정보를 불러올 수 없습니다
          </h2>
          <p className="text-text-secondary mb-8">
            요청하신 공연을 찾을 수 없거나 오류가 발생했습니다.
          </p>
          <Button onClick={() => navigate(ROUTES.HOME)}>홈으로 돌아가기</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const dateRange = formatDateRange(performance.startDate, performance.endDate);

  const handleTicketClick = () => {
    if (performance.ticketUrl) {
      window.open(performance.ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 배경 메쉬 그라데이션 */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <Header />

      {/* 뒤로가기 바 */}
      <div className="relative border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
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

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-10 animate-fade-in-up">
          {/* 배경 글로우 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-bg-card to-accent/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />

          {/* 그라데이션 보더 */}
          <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-primary/30 via-transparent to-accent/30">
            <div className="absolute inset-[1px] rounded-3xl bg-bg-card/90" />
          </div>

          {/* 콘텐츠 */}
          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 lg:p-12">
            {/* 포스터 이미지 */}
            <div className="lg:col-span-2">
              <div className="relative group">
                {/* 포스터 글로우 */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-bg-surface">
                  <img
                    src={performance.postUrl || '/placeholder-poster.jpg'}
                    alt={performance.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.jpg';
                    }}
                  />

                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            {/* 공연 정보 */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              {/* 상단 정보 */}
              <div>
                {/* 오버라인 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-overline text-primary">LIVE PERFORMANCE</span>
                </div>

                {/* 제목 */}
                <h1 className="text-display text-text-primary mb-6 leading-tight">
                  {performance.title}
                </h1>

                {/* 출연진 + 관심 공연 버튼 */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  {/* 출연진 태그들 */}
                  {performance.cast.map((artist, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors duration-300"
                    >
                      {artist}
                    </span>
                  ))}

                  {/* 구분선 */}
                  <div className="w-px h-6 bg-border/50 mx-2" />

                  {/* 관심 공연 버튼 */}
                  <button
                    onClick={handleToggleInterested}
                    disabled={addInterested.isPending || deleteInterested.isPending}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${isInterested
                        ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 hover:border-accent/40'
                        : 'bg-bg-surface text-text-secondary border-border hover:text-accent hover:border-accent/40 hover:bg-accent/10'
                      } ${(addInterested.isPending || deleteInterested.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* 하트 아이콘 */}
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${isInterested ? 'scale-110' : 'group-hover:scale-110'}`}
                      fill={isInterested ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{isInterested ? '관심 공연 삭제' : '관심 공연 추가'}</span>
                  </button>
                </div>

                {/* 주요 정보 카드 */}
                <div className="space-y-3">
                  {/* 공연 기간 */}
                  <InfoRow
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    label="공연 기간"
                    value={dateRange}
                  />

                  {/* 공연 시간 */}
                  {performance.dtguidance && (
                    <InfoRow
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      label="공연 시간"
                      value={performance.dtguidance}
                    />
                  )}

                  {/* 러닝타임 */}
                  {performance.runtime && (
                    <InfoRow
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      }
                      label="러닝타임"
                      value={performance.runtime}
                    />
                  )}

                  {/* 장소 */}
                  <InfoRow
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    label="공연 장소"
                    value={performance.place}
                  />

                  {/* 티켓 가격 */}
                  {performance.ticketPrice && (
                    <InfoRow
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      label="티켓 가격"
                      value={performance.ticketPrice}
                    />
                  )}

                  {/* 티켓 판매처 */}
                  {performance.ticketVendor && (
                    <InfoRow
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      }
                      label="티켓 판매"
                      value={performance.ticketVendor}
                    />
                  )}
                </div>
              </div>

              {/* 티켓 구매 버튼 */}
              {performance.ticketUrl && (
                <div className="mt-10">
                  <button
                    onClick={handleTicketClick}
                    className="group relative w-full lg:w-auto px-12 py-5 bg-gradient-to-r from-primary to-accent text-white text-lg font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02]"
                  >
                    {/* 시머 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      티켓 예매하기
                    </span>
                  </button>
                  <p className="text-sm text-text-muted mt-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    예매 페이지로 이동합니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden animate-fade-in-up stagger-1">
          {/* 상단 그라데이션 라인 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-glow" />
              <h2 className="text-title text-text-primary">공연 안내</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-text-secondary leading-relaxed">
                이 공연에 대한 자세한 정보는 티켓 예매 페이지에서 확인하실 수 있습니다.
                공연 일정, 좌석 배치, 할인 정보 등을 확인해보세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// 정보 행 컴포넌트 - Neon Night 스타일
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-bg-surface/50 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-bg-surface transition-all duration-300 group">
      <div className="flex-shrink-0 text-primary mt-0.5 group-hover:text-primary-light transition-colors duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-muted mb-1">{label}</p>
        <p className="text-base font-medium text-text-primary break-words">{value}</p>
      </div>
    </div>
  );
};

export default PerformanceDetailPage;
