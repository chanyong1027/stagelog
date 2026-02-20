import React from 'react';

interface BannerProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Hero 배너 컴포넌트 - Neon Night 테마
 * 대담한 그라데이션 + 글로우 효과 + 유기적 모션
 */
const Banner: React.FC<BannerProps> = ({
  title = '당신의 무대를 기록하세요',
  subtitle = '인디, 밴드, R&B — 모든 공연의 순간을 Stagelog와 함께',
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {/* 메인 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-bg-card to-accent/20" />

      {/* 메쉬 그라데이션 오버레이 */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 노이즈 텍스처 */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNyIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />

      {/* 그라데이션 보더 */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-primary/50 via-transparent to-accent/50">
        <div className="absolute inset-[1px] rounded-3xl bg-bg-card/80" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative px-8 py-16 md:px-16 md:py-24 text-center z-10">
        {/* 오버라인 */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-primary" />
          <span className="text-overline text-primary">Live Music Archive</span>
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* 메인 타이틀 */}
        <h2 className="text-display text-text-primary mb-4 animate-fade-in-up">
          <span className="block">{title.split(' ').slice(0, 2).join(' ')}</span>
          <span className="text-gradient">{title.split(' ').slice(2).join(' ')}</span>
        </h2>

        {/* 서브타이틀 */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
          {subtitle}
        </p>

        {/* 장식 요소 - 글로우 라인 */}
        <div className="flex justify-center items-center gap-3 mt-10 animate-fade-in-up stagger-3">
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-primary rounded-full" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <div className="w-16 h-[2px] bg-gradient-to-l from-transparent via-accent/60 to-accent rounded-full" />
        </div>

        {/* 스크롤 힌트 */}
        <div className="mt-12 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-text-muted/30 mx-auto flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-text-muted/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* 코너 장식 */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-accent/20 rounded-br-2xl" />
    </div>
  );
};

export default Banner;
