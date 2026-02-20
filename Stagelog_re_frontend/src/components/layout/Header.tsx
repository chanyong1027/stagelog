import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

/**
 * 헤더 컴포넌트 - Neon Night 다크 테마
 * 글래스모피즘 + 네온 글로우 효과
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useLogout();

  const nickname = useAuthStore((state) => state.nickname);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      {/* 상단 그라데이션 라인 */}
      <div className="h-[2px] bg-gradient-to-r from-primary via-accent to-secondary" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 좌측: 빈 공간 (레이아웃 균형용) */}
          <div className="flex-1"></div>

          {/* 중앙: 로고 */}
          <Link
            to={ROUTES.HOME}
            className="absolute left-1/2 -translate-x-1/2 group"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="text-gradient glow-text-primary group-hover:glow-text-accent transition-all duration-500">
                Stagelog
              </span>
            </h1>
            {/* 로고 하단 글로우 */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          {/* 우측: 인증 버튼 */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {nickname && (
                  <>
                    <span className="text-sm font-medium text-primary">{nickname}</span>
                    <div className="w-px h-4 bg-border" />
                  </>
                )}
                <button
                  onClick={() => navigate(ROUTES.INTERESTED_PERFORMANCES)}
                  className="text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300"
                >
                  관심 공연
                </button>
                <div className="w-px h-4 bg-border" />
                <button
                  onClick={() => navigate(ROUTES.REVIEWS)}
                  className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  내 리뷰
                </button>
                <div className="w-px h-4 bg-border" />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-text-muted hover:text-accent transition-colors duration-300"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate(ROUTES.SIGNUP)}
                  className="relative px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 btn-neon"
                >
                  <span className="relative z-10">시작하기</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
