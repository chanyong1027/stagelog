import React from 'react';

/**
 * 로딩 컴포넌트 - Neon Night 테마
 * 네온 글로우 스피너 + 펄스 애니메이션
 */
const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* 글로우 배경 */}
      <div className="relative">
        {/* 외부 글로우 */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />

        {/* 스피너 */}
        <div className="relative w-12 h-12">
          {/* 외부 링 */}
          <div className="absolute inset-0 rounded-full border-2 border-border" />

          {/* 회전하는 그라데이션 링 */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />

          {/* 내부 도트 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          </div>
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <p className="text-sm text-text-muted animate-pulse">
        불러오는 중...
      </p>
    </div>
  );
};

export default Loading;
