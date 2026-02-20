import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformances, useCalendarPerformances } from '../hooks/usePerformances';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Banner from '../components/common/Banner';
import SearchBar from '../components/performance/SearchBar';
import PerformanceCard from '../components/performance/PerformanceCard';
import Calendar from '../components/performance/Calendar';
import Loading from '../components/common/Loading';
import { ROUTES } from '../utils/constants';

/**
 * 메인 페이지 (HomePage) - Neon Night 테마
 * 다크 배경 + 네온 악센트 + 글래스모피즘
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // 국내공연 데이터
  const { data: domesticData, isLoading: isDomesticLoading } = usePerformances({
    isFestival: false,
    page: 0,
    size: 6,
  });

  // 페스티벌 데이터
  const { data: festivalData, isLoading: isFestivalLoading } = usePerformances({
    isFestival: true,
    page: 0,
    size: 6,
  });

  // 캘린더 데이터
  const { data: calendarData, isLoading: isCalendarLoading } = useCalendarPerformances(
    currentYear,
    currentMonth
  );

  // 검색 제출 시 검색 페이지로 이동
  const handleSearchSubmit = (keyword: string) => {
    if (keyword.trim()) {
      navigate(`${ROUTES.PERFORMANCES}?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 배경 메쉬 그라데이션 */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-20">
        {/* Hero 배너 */}
        <section className="animate-fade-in-up">
          <Banner />
        </section>

        {/* 검색 섹션 */}
        <section className="py-4 animate-fade-in-up stagger-1">
          <SearchBar onSubmit={handleSearchSubmit} />
        </section>

        {/* 국내공연 섹션 */}
        <section className="animate-fade-in-up stagger-2">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* 네온 도트 */}
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <h2 className="text-title text-text-primary">국내공연</h2>
              <span className="text-overline text-text-muted">CONCERTS</span>
            </div>
            <button
              onClick={() => navigate(`${ROUTES.PERFORMANCES}?isFestival=false`)}
              className="group flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-300"
            >
              <span>전체보기</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 공연 그리드 */}
          {isDomesticLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {domesticData?.content?.slice(0, 6).map((performance, index) => (
                <div
                  key={performance.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PerformanceCard performance={performance} />
                </div>
              ))}
            </div>
          )}

          {/* 빈 상태 */}
          {!isDomesticLoading && domesticData?.content?.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                <span className="text-2xl">🎸</span>
              </div>
              <p className="text-text-secondary">등록된 공연이 없습니다</p>
            </div>
          )}
        </section>

        {/* 페스티벌 섹션 */}
        <section className="animate-fade-in-up stagger-3">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* 네온 도트 - 악센트 컬러 */}
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              <h2 className="text-title text-text-primary">페스티벌</h2>
              <span className="text-overline text-text-muted">FESTIVALS</span>
            </div>
            <button
              onClick={() => navigate(`${ROUTES.PERFORMANCES}?isFestival=true`)}
              className="group flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300"
            >
              <span>전체보기</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 공연 그리드 */}
          {isFestivalLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {festivalData?.content?.slice(0, 6).map((performance, index) => (
                <div
                  key={performance.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PerformanceCard performance={performance} />
                </div>
              ))}
            </div>
          )}

          {/* 빈 상태 */}
          {!isFestivalLoading && festivalData?.content?.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                <span className="text-2xl">🎪</span>
              </div>
              <p className="text-text-secondary">등록된 페스티벌이 없습니다</p>
            </div>
          )}
        </section>

        {/* 캘린더 섹션 */}
        <section className="pb-12 animate-fade-in-up stagger-4">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-glow" />
            <h2 className="text-title text-text-primary">공연 캘린더</h2>
            <span className="text-overline text-text-muted">CALENDAR</span>
          </div>

          {/* 캘린더 카드 */}
          <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden">
            {/* 상단 그라데이션 라인 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

            <div className="p-6">
              {isCalendarLoading ? (
                <Loading />
              ) : (
                <Calendar
                  year={currentYear}
                  month={currentMonth}
                  performances={calendarData || []}
                  onMonthChange={handleMonthChange}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default HomePage;
