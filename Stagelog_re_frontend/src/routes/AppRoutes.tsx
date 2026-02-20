import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';

// Auth 페이지
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import OAuth2CallbackPage from '../pages/auth/OAuth2CallbackPage';

// Main 페이지
import HomePage from '../pages/HomePage';
import PerformanceListPage from '../pages/PerformanceListPage';
import PerformanceDetailPage from '../pages/PerformanceDetailPage';

// Review 페이지
import ReviewListPage from '../pages/ReviewListPage';
import ReviewCreatePage from '../pages/ReviewCreatePage';
import ReviewEditPage from '../pages/ReviewEditPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';

// 관심 공연 페이지
import InterestedPerformanceListPage from '../pages/InterestedPerformanceListPage';

// Placeholder 페이지들 (아직 구현 안 됨)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">이 페이지는 곧 구현될 예정입니다.</p>
    </div>
  </div>
);
const CalendarPage = () => <PlaceholderPage title="캘린더 페이지" />;
const MyPerformancesPage = () => <PlaceholderPage title="내 공연 기록" />;
const ProfilePage = () => <PlaceholderPage title="프로필" />;

/**
 * 앱 라우팅 설정
 * - Public Routes: 로그인, 회원가입
 * - Protected Routes: 인증 필요한 페이지들
 */
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.OAUTH2_CALLBACK} element={<OAuth2CallbackPage />} />

        {/* Public Routes - 공연 관련 (로그인 없이 조회 가능) */}
        <Route path={ROUTES.PERFORMANCES} element={<PerformanceListPage />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path="/performances/:id" element={<PerformanceDetailPage />} />

        {/* Protected Routes - 리뷰 관련 */}
        <Route
          path={ROUTES.REVIEWS}
          element={
            <ProtectedRoute>
              <ReviewListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REVIEW_CREATE}
          element={
            <ProtectedRoute>
              <ReviewCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/:id/edit"
          element={
            <ProtectedRoute>
              <ReviewEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/:id"
          element={
            <ProtectedRoute>
              <ReviewDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - 관심 공연 */}
        <Route
          path={ROUTES.INTERESTED_PERFORMANCES}
          element={
            <ProtectedRoute>
              <InterestedPerformanceListPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - 사용자 관련 */}
        <Route
          path={ROUTES.MY_PERFORMANCES}
          element={
            <ProtectedRoute>
              <MyPerformancesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 - 루트로 리다이렉트 */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
