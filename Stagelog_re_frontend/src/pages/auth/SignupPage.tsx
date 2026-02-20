import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { SignupRequest } from '../../types/auth.types';
import { ROUTES } from '../../utils/constants';
import { authAPI } from '../../api/auth.api';

/**
 * 회원가입 페이지 - Neon Night 테마
 * 풀스크린 다크 배경 + 글래스 카드 + 프로그레스 인디케이터
 */
const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupRequest>({
    userId: '',
    password: '',
    email: '',
    nickname: '',
  });

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignupRequest | 'passwordConfirm', string>>>({});
  const [userIdChecked, setUserIdChecked] = useState<boolean | null>(null); // null: 미확인, true: 사용가능, false: 중복
  const [checkingUserId, setCheckingUserId] = useState(false);

  const { mutate: signup, isPending } = useSignup();

  // 입력 진행률 계산
  const getProgress = () => {
    let filled = 0;
    if (formData.userId) filled++;
    if (formData.email) filled++;
    if (formData.nickname) filled++;
    if (formData.password) filled++;
    if (passwordConfirm) filled++;
    return (filled / 5) * 100;
  };

  // userId 중복 확인
  const handleCheckUserId = useCallback(async () => {
    const userId = formData.userId.trim();
    if (!userId) return;
    if (!/^[a-zA-Z0-9_]{2,20}$/.test(userId)) {
      setErrors((prev) => ({ ...prev, userId: '아이디는 2-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.' }));
      return;
    }

    setCheckingUserId(true);
    try {
      const response = await authAPI.checkUserId(userId);
      const exists = response.data;
      setUserIdChecked(!exists);
      if (exists) {
        setErrors((prev) => ({ ...prev, userId: '이미 사용 중인 아이디입니다.' }));
      } else {
        setErrors((prev) => ({ ...prev, userId: undefined }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, userId: '중복 확인 중 오류가 발생했습니다.' }));
    } finally {
      setCheckingUserId(false);
    }
  }, [formData.userId]);

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupRequest | 'passwordConfirm', string>> = {};

    // 아이디 검사 (2-20자, 영문/숫자/언더스코어)
    if (!formData.userId.trim()) {
      newErrors.userId = 'id는 필수입니다.';
    } else if (!/^[a-zA-Z0-9_]{2,20}$/.test(formData.userId)) {
      newErrors.userId = '아이디는 2-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.';
    } else if (userIdChecked === false) {
      newErrors.userId = '이미 사용 중인 아이디입니다.';
    } else if (userIdChecked === null) {
      newErrors.userId = '아이디 중복 확인을 해주세요.';
    }

    // 비밀번호 검사 (8-20자, 영문+숫자+특수문자 포함)
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호는 필수입니다.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(formData.password)) {
      newErrors.password = '비밀번호는 8-20자의 영문, 숫자, 특수문자를 포함해야 합니다.';
    }

    // 비밀번호 확인 검사
    if (formData.password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 이메일 검사
    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수입니다.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 닉네임 검사 (2-20자, 한글/영문/숫자/언더스코어)
    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임은 필수입니다.';
    } else if (!/^[가-힣a-zA-Z0-9_]{2,20}$/.test(formData.nickname)) {
      newErrors.nickname = '닉네임은 2-20자의 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    signup(formData);
  };

  const handleChange = (field: keyof SignupRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    // userId 변경 시 중복 확인 상태 초기화
    if (field === 'userId') {
      setUserIdChecked(null);
    }
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
    if (errors.passwordConfirm) {
      setErrors({ ...errors, passwordConfirm: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-mesh" />

      {/* 글로우 오브 - 좌상단 (악센트) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

      {/* 글로우 오브 - 우하단 (프라이머리) */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

      {/* 글로우 오브 - 중앙 (세컨더리) */}
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

      {/* 노이즈 오버레이 */}
      <div className="noise-overlay" />

      {/* 회원가입 카드 */}
      <div className="relative w-full max-w-md animate-scale-in">
        {/* 카드 글로우 효과 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50" />

        {/* 카드 본체 */}
        <div className="relative glass-strong rounded-3xl p-8 md:p-10">
          {/* 프로그레스 바 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-bg-surface rounded-t-3xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ease-out"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {/* 로고 & 헤더 */}
          <div className="text-center mb-8 mt-2">
            <Link to={ROUTES.HOME} className="inline-block group">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                <span className="text-gradient glow-text-primary group-hover:glow-text-accent transition-all duration-500">
                  Stagelog
                </span>
              </h1>
            </Link>
            <p className="text-text-secondary text-sm mt-2">
              새로운 계정을 만들어보세요
            </p>
            <div className="flex justify-center items-center gap-2 mt-3">
              <span className="text-xs text-text-muted">진행률</span>
              <span className="text-xs font-semibold text-primary">{Math.round(getProgress())}%</span>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 아이디 + 중복확인 */}
            <div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="아이디"
                    type="text"
                    placeholder="아이디 (2-20자, 영문/숫자/_)"
                    value={formData.userId}
                    onChange={handleChange('userId')}
                    error={errors.userId}
                    required
                    disabled={isPending}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckUserId}
                  disabled={isPending || checkingUserId || !formData.userId.trim()}
                  className="px-3 py-2.5 text-xs font-medium rounded-lg border border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {checkingUserId ? '확인중...' : '중복확인'}
                </button>
              </div>
              {userIdChecked === true && !errors.userId && (
                <p className="text-xs text-green-400 mt-1">사용 가능한 아이디입니다.</p>
              )}
            </div>

            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              required
              disabled={isPending}
            />

            <Input
              label="닉네임"
              type="text"
              placeholder="닉네임 (2-20자)"
              value={formData.nickname}
              onChange={handleChange('nickname')}
              error={errors.nickname}
              helperText="한글, 영문, 숫자, 언더스코어 사용 가능"
              required
              disabled={isPending}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호 (8-20자)"
              value={formData.password}
              onChange={handleChange('password')}
              error={errors.password}
              helperText="영문, 숫자, 특수문자 포함"
              required
              disabled={isPending}
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              error={errors.passwordConfirm}
              required
              disabled={isPending}
            />

            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              loading={isPending}
              disabled={isPending}
            >
              회원가입
            </Button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              이미 계정이 있으신가요?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-accent hover:text-accent-light transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>

          {/* 하단 장식 */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-accent/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
        </div>
      </div>

      {/* 바닥 장식 라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default SignupPage;
