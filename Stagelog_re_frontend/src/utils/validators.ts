import { VALIDATION_REGEX, ERROR_MESSAGES } from './constants';

/**
 * 필수 입력 검증
 * @param value - 검증할 값
 * @returns 에러 메시지 또는 undefined
 */
export const validateRequired = (value: string): string | undefined => {
  if (!value || value.trim() === '') {
    return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  }
  return undefined;
};

/**
 * 아이디 유효성 검증 (6-12자)
 * @param userId - 아이디
 * @returns 에러 메시지 또는 undefined
 */
export const validateUserId = (userId: string): string | undefined => {
  const requiredError = validateRequired(userId);
  if (requiredError) return requiredError;

  if (!VALIDATION_REGEX.USER_ID.test(userId)) {
    return ERROR_MESSAGES.VALIDATION.INVALID_USER_ID;
  }

  return undefined;
};

/**
 * 닉네임 유효성 검증 (2-20자, 한글/영문/숫자/언더스코어)
 * @param nickname - 닉네임
 * @returns 에러 메시지 또는 undefined
 */
export const validateNickname = (nickname: string): string | undefined => {
  const requiredError = validateRequired(nickname);
  if (requiredError) return requiredError;

  if (!VALIDATION_REGEX.NICKNAME.test(nickname)) {
    return ERROR_MESSAGES.VALIDATION.INVALID_NICKNAME;
  }

  return undefined;
};

/**
 * 이메일 유효성 검증
 * @param email - 이메일
 * @returns 에러 메시지 또는 undefined
 */
export const validateEmail = (email: string): string | undefined => {
  const requiredError = validateRequired(email);
  if (requiredError) return requiredError;

  if (!VALIDATION_REGEX.EMAIL.test(email)) {
    return ERROR_MESSAGES.VALIDATION.INVALID_EMAIL;
  }

  return undefined;
};

/**
 * 비밀번호 유효성 검증 (8-20자, 영문/숫자/특수문자 포함)
 * @param password - 비밀번호
 * @returns 에러 메시지 또는 undefined
 */
export const validatePassword = (password: string): string | undefined => {
  const requiredError = validateRequired(password);
  if (requiredError) return requiredError;

  if (!VALIDATION_REGEX.PASSWORD.test(password)) {
    return ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD;
  }

  return undefined;
};

/**
 * 비밀번호 확인 검증
 * @param password - 비밀번호
 * @param confirmPassword - 비밀번호 확인
 * @returns 에러 메시지 또는 undefined
 */
export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string
): string | undefined => {
  const requiredError = validateRequired(confirmPassword);
  if (requiredError) return requiredError;

  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }

  return undefined;
};

/**
 * 로그인 폼 검증
 * @param userId - 아이디
 * @param password - 비밀번호
 * @returns 유효성 검증 결과 { isValid, errors }
 */
export const validateLoginForm = (userId: string, password: string) => {
  const errors = {
    userId: validateRequired(userId),
    password: validateRequired(password),
  };

  const isValid = !errors.userId && !errors.password;

  return { isValid, errors };
};

/**
 * 회원가입 폼 검증
 * @param formData - 회원가입 폼 데이터
 * @returns 유효성 검증 결과 { isValid, errors }
 */
export const validateSignupForm = (formData: {
  userId: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) => {
  const errors = {
    userId: validateUserId(formData.userId),
    nickname: validateNickname(formData.nickname),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: formData.confirmPassword
      ? validatePasswordConfirm(formData.password, formData.confirmPassword)
      : undefined,
  };

  const isValid = Object.values(errors).every((error) => !error);

  return { isValid, errors };
};

/**
 * 리뷰 제목 검증 (1-100자)
 * @param title - 리뷰 제목
 * @returns 에러 메시지 또는 undefined
 */
export const validateReviewTitle = (title: string): string | undefined => {
  const requiredError = validateRequired(title);
  if (requiredError) return requiredError;

  if (title.length > 100) {
    return '제목은 100자 이내로 입력해주세요.';
  }

  return undefined;
};

/**
 * 리뷰 내용 검증 (1-5000자)
 * @param content - 리뷰 내용
 * @returns 에러 메시지 또는 undefined
 */
export const validateReviewContent = (content: string): string | undefined => {
  const requiredError = validateRequired(content);
  if (requiredError) return requiredError;

  if (content.length > 5000) {
    return '내용은 5000자 이내로 입력해주세요.';
  }

  return undefined;
};

/**
 * 리뷰 폼 검증
 * @param title - 리뷰 제목
 * @param content - 리뷰 내용
 * @returns 유효성 검증 결과 { isValid, errors }
 */
export const validateReviewForm = (title: string, content: string) => {
  const errors = {
    title: validateReviewTitle(title),
    content: validateReviewContent(content),
  };

  const isValid = !errors.title && !errors.content;

  return { isValid, errors };
};
