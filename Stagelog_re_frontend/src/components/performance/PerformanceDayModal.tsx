import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPerformance } from '../../types/performance.types';
import { formatDateRange } from '../../utils/dateFormatter';
import { ROUTES } from '../../utils/constants';

interface PerformanceDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  performances: CalendarPerformance[];
}

/**
 * 특정 날짜의 공연 목록 모달 - Neon Night 테마
 * 다크 배경 + 글래스 모달 + 네온 액센트
 */
const PerformanceDayModal: React.FC<PerformanceDayModalProps> = ({
  isOpen,
  onClose,
  date,
  performances,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePerformanceClick = (id: number) => {
    navigate(ROUTES.PERFORMANCE_DETAIL(id));
    onClose();
  };

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-bg-deep/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden pointer-events-auto animate-fade-in-up shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 그라데이션 라인 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* 헤더 */}
          <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-1">{date}</h2>
                <p className="text-sm text-text-muted">
                  총 <span className="text-primary font-semibold">{performances.length}</span>개 공연
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-bg-surface border border-border hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group"
                aria-label="닫기"
              >
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 공연 리스트 */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
            {performances.length > 0 ? (
              <div className="space-y-3">
                {performances.map((performance, index) => (
                  <div
                    key={performance.id}
                    className="group cursor-pointer"
                    onClick={() => handlePerformanceClick(performance.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative bg-bg-surface rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-bg-card transition-all duration-300 overflow-hidden">
                      {/* 호버 시 그라데이션 라인 */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex items-center gap-4">
                        {/* 포스터 이미지 */}
                        {performance.postUrl ? (
                          <img
                            src={performance.postUrl}
                            alt={performance.title}
                            className="w-16 h-20 object-cover rounded-lg border border-border group-hover:border-primary/30 transition-all duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-poster.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-20 bg-bg-elevated rounded-lg border border-border flex items-center justify-center">
                            <span className="text-2xl">🎸</span>
                          </div>
                        )}

                        {/* 공연 정보 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {performance.title}
                          </h3>
                          <p className="text-sm text-text-muted flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateRange(performance.startDate, performance.endDate)}
                          </p>
                        </div>

                        {/* 화살표 아이콘 */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-text-muted group-hover:text-primary transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-text-muted">이 날짜에 등록된 공연이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceDayModal;
