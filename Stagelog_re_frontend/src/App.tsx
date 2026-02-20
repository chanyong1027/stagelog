import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Stage Log 애플리케이션 최상위 컴포넌트
 * - ErrorBoundary로 전역 에러 처리
 * - AppRoutes로 라우팅 관리
 */
function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
