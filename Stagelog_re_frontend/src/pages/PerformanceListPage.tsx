import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePerformances } from '../hooks/usePerformances';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PerformanceCard from '../components/performance/PerformanceCard';
import Loading from '../components/common/Loading';

/**
 * 공연 목록 페이지 - Neon Night 테마
 * 다크 배경 + 글래스 필터바 + 네온 페이지네이션
 */
const PerformanceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 필터 정보 가져오기
  const isFestival = searchParams.get('isFestival') === 'true';
  const initialKeyword = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const pageSize = 12;

  // 공연 데이터 조회
  const { data, isLoading } = usePerformances({
    isFestival: isFestival,
    keyword: keyword || undefined,
    page: currentPage,
    size: pageSize,
    sort: sortBy,
  });

  const categoryTitle = isFestival ? '페스티벌' : '국내공연';
  const categoryIcon = isFestival ? '🎪' : '🎸';

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setCurrentPage(0);
  };

  // 정렬 변경
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(0);
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 배경 메쉬 그라데이션 */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <Header />

      {/* 뒤로가기 바 */}
      <div className="relative border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-sm text-text-secondary hover:text-primary transition-colors duration-300"
          >
            <svg
              className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* 페이지 헤더 */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{categoryIcon}</span>
            <h1 className="text-display text-text-primary">{categoryTitle}</h1>
            <span className="px-4 py-1.5 bg-primary/10 text-primary font-semibold rounded-full text-sm border border-primary/20">
              {totalElements}개 공연
            </span>
          </div>
          <p className="text-text-secondary text-lg">
            {isFestival
              ? '다양한 페스티벌 공연을 만나보세요'
              : '인디/밴드 공연을 둘러보세요'}
          </p>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden mb-10 animate-fade-in-up stagger-1">
          {/* 상단 그라데이션 라인 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* 검색창 */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                <div className="relative group">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="아티스트명 또는 공연명으로 검색"
                    className="w-full pl-12 pr-12 py-4 bg-bg-surface text-text-primary border border-border rounded-xl
                             placeholder:text-text-muted
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                             hover:border-border-light
                             transition-all duration-300"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setKeyword('');
                        setCurrentPage(0);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>

              {/* 정렬 드롭다운 */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-text-muted whitespace-nowrap">
                  정렬
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-xl
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                           cursor-pointer transition-all duration-300
                           appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '1.5rem',
                    backgroundPosition: 'right 0.75rem center',
                  }}
                >
                  <option value="startDate">공연 시작일순</option>
                  <option value="startDate,desc">공연 시작일 역순</option>
                  <option value="title">제목순</option>
                  <option value="createdAt,desc">최신 등록순</option>
                </select>
              </div>
            </div>

            {/* 검색 결과 표시 */}
            {keyword && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-text-secondary">
                  '<span className="font-semibold text-primary">{keyword}</span>' 검색 결과
                  <button
                    onClick={() => {
                      setKeyword('');
                      setSearchInput('');
                      setCurrentPage(0);
                    }}
                    className="ml-3 text-accent hover:text-accent-light font-medium transition-colors duration-300"
                  >
                    검색 초기화
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 공연 목록 그리드 */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        ) : data?.content && data.content.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
              {data.content.map((performance, index) => (
                <div
                  key={performance.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PerformanceCard performance={performance} />
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {/* 이전 페이지 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-3 rounded-xl border border-border bg-bg-surface
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:border-primary/50 hover:bg-bg-card
                           transition-all duration-300"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* 페이지 번호들 */}
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((page) => {
                    return (
                      page === 0 ||
                      page === totalPages - 1 ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    );
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage !== undefined && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 text-text-muted">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[44px] px-4 py-3 rounded-xl border transition-all duration-300
                            ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary font-semibold shadow-lg shadow-primary/20'
                                : 'bg-bg-surface border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                            }`}
                        >
                          {page + 1}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* 다음 페이지 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="p-3 rounded-xl border border-border bg-bg-surface
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:border-primary/50 hover:bg-bg-card
                           transition-all duration-300"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* 페이지 정보 */}
            <div className="text-center text-sm text-text-muted mb-8">
              전체 {totalElements}개 중{' '}
              <span className="text-text-secondary font-medium">
                {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}
              </span>
              개 표시
            </div>
          </>
        ) : (
          // 검색 결과 없음
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-surface border border-border flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-text-secondary mb-8">
              다른 검색어로 다시 시도해보세요
            </p>
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  setSearchInput('');
                  setCurrentPage(0);
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                전체 공연 보기
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PerformanceListPage;
