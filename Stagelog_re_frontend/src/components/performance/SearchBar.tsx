import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onSearch?: (keyword: string) => void;
  onSubmit?: (keyword: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Hero 검색바 컴포넌트 - Neon Night 테마
 * 글래스모피즘 + 네온 글로우 + 대형 사이즈
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSubmit,
  placeholder = '아티스트, 공연, 페스티벌을 검색해보세요',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 실시간 검색 (onSearch가 제공된 경우에만)
  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative max-w-3xl mx-auto ${className}`}>
      {/* 배경 글로우 효과 */}
      <div className={`
        absolute inset-0 -z-10 transition-all duration-500
        ${isFocused
          ? 'opacity-100 blur-2xl scale-110'
          : 'opacity-0 blur-xl scale-100'
        }
      `}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-full" />
      </div>

      {/* 검색 입력 컨테이너 */}
      <div className="relative group">
        {/* 그라데이션 보더 */}
        <div className={`
          absolute inset-0 rounded-2xl p-[1px] transition-opacity duration-300
          ${isFocused
            ? 'opacity-100 bg-gradient-to-r from-primary via-accent to-primary'
            : 'opacity-0'
          }
        `}>
          <div className="absolute inset-[1px] rounded-2xl bg-bg-surface" />
        </div>

        {/* 검색 아이콘 */}
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          <FaSearch className={`
            h-5 w-5 transition-colors duration-300
            ${isFocused ? 'text-primary' : 'text-text-muted'}
          `} />
        </div>

        {/* 검색 입력 필드 */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            relative w-full pl-14 pr-14 py-5
            text-lg text-text-primary
            bg-bg-surface/80 backdrop-blur-sm
            border border-border rounded-2xl
            placeholder:text-text-muted
            transition-all duration-300
            focus:outline-none focus:border-transparent
            hover:border-border-light
          `}
        />

        {/* 클리어 버튼 */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-6 flex items-center z-10 text-text-muted hover:text-accent transition-colors duration-300"
            aria-label="검색어 지우기"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}

        {/* 우측 장식 라인 */}
        <div className={`
          absolute right-16 top-1/2 -translate-y-1/2 w-px h-8 transition-colors duration-300
          ${searchTerm ? 'bg-border' : 'bg-transparent'}
        `} />
      </div>

      {/* 검색 힌트 */}
      <div className={`
        mt-4 flex justify-center items-center gap-4 text-sm
        transition-all duration-300
        ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'}
      `}>
        <span className="text-text-muted">인기 검색어:</span>
        <div className="flex gap-2">
          {['혁오', '검정치마', '페스티벌'].map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchTerm(tag);
                if (onSubmit) onSubmit(tag);
              }}
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                bg-bg-card border border-border
                text-text-secondary hover:text-primary hover:border-primary/50
                transition-all duration-300
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
