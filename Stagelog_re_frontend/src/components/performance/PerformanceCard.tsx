import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PerformanceListItem } from '../../types/performance.types';
import { formatDateRange } from '../../utils/dateFormatter';
import { ROUTES } from '../../utils/constants';

interface PerformanceCardProps {
  performance: PerformanceListItem;
}

/**
 * 공연 카드 컴포넌트 - Neon Night 테마
 * 다크 배경 + 글로우 호버 + 그라데이션 오버레이
 */
const PerformanceCard: React.FC<PerformanceCardProps> = ({ performance }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.PERFORMANCE_DETAIL(performance.id));
  };

  const dateRange = formatDateRange(performance.startDate, performance.endDate);

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer card-hover"
    >
      {/* 포스터 이미지 */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-surface border border-border group-hover:border-primary/30 transition-all duration-500">
        {/* 글로우 배경 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:via-accent/10 group-hover:to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

        <div className="aspect-[3/4] relative">
          <img
            src={performance.postUrl || '/placeholder-poster.jpg'}
            alt={performance.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-poster.jpg';
            }}
          />

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 호버 시 날짜 표시 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-xs font-medium text-text-secondary">
              {dateRange}
            </p>
          </div>
        </div>
      </div>

      {/* 공연 정보 */}
      <div className="mt-4 px-1">
        {/* 제목 */}
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {performance.title}
        </h3>

        {/* 날짜 (기본 상태) */}
        <p className="text-xs text-text-muted mt-1 group-hover:opacity-0 transition-opacity duration-300">
          {dateRange}
        </p>
      </div>
    </div>
  );
};

export default PerformanceCard;
