import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * 버튼 컴포넌트 - Neon Night 테마
 * 네온 글로우 + 그라데이션 + 시머 효과
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    relative overflow-hidden font-semibold
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary to-primary-dark text-white
      hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]
      focus:ring-primary/50
      btn-neon
    `,
    secondary: `
      bg-bg-surface text-text-primary border border-border
      hover:bg-bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
      focus:ring-primary/30
    `,
    ghost: `
      bg-transparent text-text-secondary
      hover:text-text-primary hover:bg-bg-surface
      focus:ring-primary/30
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02]
      focus:ring-red-500/50
      btn-neon
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || loading ? 'pointer-events-none' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          {/* 커스텀 로딩 스피너 */}
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>처리 중...</span>
        </span>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
};

export default Button;
