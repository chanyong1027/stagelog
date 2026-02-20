import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyInterestedPerformances, useDeleteInterestedPerformance } from '../hooks/useInterestedPerformances';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { formatDateRange } from '../utils/dateFormatter';

/**
 * D-Day 계산 함수
 * @param startDateStr - 공연 시작일 (YYYY-MM-DD 형식)
 * @returns D-day 문자열 (D-50, D-Day, D+3 등)
 */
const calculateDDay = (startDateStr: string): { text: string; isPast: boolean; isToday: boolean } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);

    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return { text: 'D-Day', isPast: false, isToday: true };
    } else if (diffDays > 0) {
        return { text: `D-${diffDays}`, isPast: false, isToday: false };
    } else {
        return { text: `D+${Math.abs(diffDays)}`, isPast: true, isToday: false };
    }
};

/**
 * 관심 공연 목록 페이지 - Neon Night 테마
 * - 리스트 형식으로 관심 공연 표시
 * - D-Day 표시
 * - 공연 클릭 시 상세 페이지로 이동
 * - 관심 공연 삭제 기능
 */
const InterestedPerformanceListPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: interestedPerformances, isLoading } = useMyInterestedPerformances();
    const deleteInterested = useDeleteInterestedPerformance();

    const handlePerformanceClick = (performanceId: number) => {
        navigate(ROUTES.PERFORMANCE_DETAIL(performanceId));
    };

    const handleDelete = (performanceId: number, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`"${title}"을(를) 관심 공연에서 삭제하시겠습니까?`)) {
            deleteInterested.mutate(performanceId);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base">
            {/* 노이즈 오버레이 */}
            <div className="noise-overlay" />

            {/* 배경 메쉬 그라데이션 */}
            <div className="fixed inset-0 bg-mesh pointer-events-none" />

            <Header />

            <main className="relative max-w-5xl mx-auto px-6 lg:px-8 py-12">
                {/* 페이지 헤더 */}
                <div className="flex items-center justify-between mb-10 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        {/* 네온 도트 */}
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                        <div>
                            <h1 className="text-display text-text-primary mb-2">관심 공연</h1>
                            <p className="text-text-secondary">
                                내가 관심 있는 공연들을 한눈에 확인하세요
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => navigate(ROUTES.HOME)} variant="secondary">
                        공연 둘러보기
                    </Button>
                </div>

                {/* 관심 공연 목록 */}
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loading />
                    </div>
                ) : interestedPerformances && interestedPerformances.length > 0 ? (
                    <div className="space-y-4 animate-fade-in-up stagger-1">
                        {interestedPerformances.map((ip, index) => {
                            const dday = calculateDDay(ip.startDate);

                            return (
                                <div
                                    key={ip.id}
                                    className="group relative rounded-2xl overflow-hidden bg-bg-card border border-border hover:border-accent/50 transition-all duration-300 cursor-pointer animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() => handlePerformanceClick(ip.performanceId)}
                                >
                                    {/* 상단 그라데이션 라인 */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex items-center p-4 gap-5">
                                        {/* 포스터 이미지 (작게) */}
                                        <div className="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border border-border">
                                            <img
                                                src={ip.posterUrl || '/placeholder-poster.jpg'}
                                                alt={ip.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-poster.jpg';
                                                }}
                                            />
                                        </div>

                                        {/* 공연 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1 group-hover:text-accent transition-colors duration-300">
                                                {ip.title}
                                            </h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-text-secondary flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDateRange(ip.startDate, ip.endDate)}
                                                </p>
                                                {ip.venue && (
                                                    <p className="text-sm text-text-muted flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="line-clamp-1">{ip.venue}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* D-Day 표시 */}
                                        <div className="flex-shrink-0 text-center px-4">
                                            <div className={`text-2xl font-bold ${dday.isToday
                                                    ? 'text-accent'
                                                    : dday.isPast
                                                        ? 'text-text-muted'
                                                        : 'text-primary'
                                                }`}>
                                                {dday.text}
                                            </div>
                                            <p className="text-xs text-text-muted mt-1">
                                                {dday.isToday ? '오늘 공연!' : dday.isPast ? '지난 공연' : '공연까지'}
                                            </p>
                                        </div>

                                        {/* 삭제 버튼 */}
                                        <button
                                            onClick={(e) => handleDelete(ip.performanceId, ip.title, e)}
                                            disabled={deleteInterested.isPending}
                                            className="flex-shrink-0 p-3 rounded-xl bg-bg-surface border border-border text-text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="관심 공연 삭제"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // 관심 공연 없음
                    <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden text-center py-16 px-8 animate-fade-in-up">
                        {/* 상단 그라데이션 라인 */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                            <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-3">
                            관심 공연이 없습니다
                        </h3>
                        <p className="text-text-secondary mb-8">
                            공연을 둘러보고 마음에 드는 공연을 추가해보세요
                        </p>
                        <Button onClick={() => navigate(ROUTES.HOME)} size="lg">
                            공연 둘러보기
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default InterestedPerformanceListPage;
