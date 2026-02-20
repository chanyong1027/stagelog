import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

/**
 * 푸터 컴포넌트 - Neon Night 다크 테마
 * 미니멀한 다크 디자인 + 그라데이션 악센트
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-bg-deep border-t border-border">
      {/* 상단 그라데이션 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 브랜드 섹션 */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-gradient mb-4">Stagelog</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              인디/밴드/R&B 공연의 모든 순간을 기록하세요.
              <br />
              당신만의 공연 아카이브를 만들어보세요.
            </p>

            {/* 소셜 링크 플레이스홀더 */}
            <div className="flex items-center gap-4 mt-6">
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                <span className="text-text-muted text-xs">IG</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                <span className="text-text-muted text-xs">TW</span>
              </div>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-overline mb-4">탐색</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="text-sm text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  공연 목록
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CALENDAR}
                  className="text-sm text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  캘린더
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.REVIEWS}
                  className="text-sm text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  내 리뷰
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h4 className="text-overline mb-4">정보</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                공연 정보: KOPIS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                음악 정보: Spotify
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary/50" />
                contact@stagelog.com
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">
              &copy; {currentYear} Stagelog. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <span className="hover:text-text-secondary transition-colors cursor-pointer">
                개인정보처리방침
              </span>
              <span className="hover:text-text-secondary transition-colors cursor-pointer">
                이용약관
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 배경 장식 - 미묘한 그라데이션 */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
};

export default Footer;
