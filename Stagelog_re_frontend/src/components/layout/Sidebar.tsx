import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useLogout } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const Sidebar: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={closeSidebar}
      />

      {/* 사이드바 */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform md:hidden">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-xl font-bold text-primary">Stage Log</span>
            <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.HOME}
                  onClick={closeSidebar}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  공연 목록
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CALENDAR}
                  onClick={closeSidebar}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  캘린더
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      to={ROUTES.REVIEWS}
                      onClick={closeSidebar}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      내 리뷰
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.MY_PERFORMANCES}
                      onClick={closeSidebar}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      내 공연 기록
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={closeSidebar}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      프로필
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* 하단 버튼 */}
          <div className="p-4 border-t">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                로그아웃
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to={ROUTES.LOGIN}
                  onClick={closeSidebar}
                  className="block w-full px-4 py-2 bg-gray-200 text-gray-800 text-center rounded-lg hover:bg-gray-300"
                >
                  로그인
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  onClick={closeSidebar}
                  className="block w-full px-4 py-2 bg-primary text-white text-center rounded-lg hover:bg-primary-dark"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
