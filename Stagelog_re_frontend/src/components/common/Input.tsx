import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * 입력 필드 컴포넌트 - Neon Night 테마
 * 다크 배경 + 글로우 포커스 효과
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {/* 라벨 */}
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      {/* 입력 필드 컨테이너 */}
      <div className="relative group">
        <input
          className={`
            w-full px-4 py-3
            bg-bg-surface text-text-primary
            border rounded-xl
            placeholder:text-text-muted
            transition-all duration-300
            focus:outline-none
            ${error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-border hover:border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />

        {/* 포커스 시 글로우 효과 */}
        <div className={`
          absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-300
          group-focus-within:opacity-100
          ${error
            ? 'bg-red-500/10 blur-xl'
            : 'bg-primary/10 blur-xl'
          }
        `} />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* 도움말 텍스트 */}
      {helperText && !error && (
        <p className="text-sm text-text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
