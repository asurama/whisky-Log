// 에러 타입 정의
export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, any>;
}

// 에러 생성 함수
export function createError(
  message: string,
  code?: string,
  status?: number,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.status = status;
  error.context = context;
  return error;
}

// 에러 분류 함수
export function classifyError(error: unknown): AppError {
  if (error instanceof Error) {
    return error as AppError;
  }
  
  if (typeof error === 'string') {
    return createError(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return createError(
      String(error.message),
      'code' in error ? String(error.code) : undefined,
      'status' in error ? Number(error.status) : undefined,
      'context' in error ? error.context as Record<string, any> : undefined
    );
  }
  
  return createError('알 수 없는 오류가 발생했습니다');
}

// 에러 로깅 함수
export function logError(error: unknown, context?: string): void {
  const appError = classifyError(error);
  
  console.error(`[${context || 'App'}] Error:`, {
    message: appError.message,
    code: appError.code,
    status: appError.status,
    context: appError.context,
    stack: appError.stack
  });
}

// 사용자 친화적 에러 메시지 생성
export function getUserFriendlyMessage(error: unknown): string {
  const appError = classifyError(error);
  
  // 코드별 사용자 친화적 메시지
  switch (appError.code) {
    case 'NETWORK_ERROR':
      return '네트워크 연결을 확인해주세요.';
    case 'AUTH_ERROR':
      return '로그인이 필요합니다.';
    case 'PERMISSION_ERROR':
      return '권한이 없습니다.';
    case 'VALIDATION_ERROR':
      return '입력 정보를 확인해주세요.';
    case 'NOT_FOUND':
      return '요청한 정보를 찾을 수 없습니다.';
    case 'RATE_LIMIT':
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    default:
      return appError.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

// 에러 복구 가능 여부 확인
export function isRecoverableError(error: unknown): boolean {
  const appError = classifyError(error);
  
  // 복구 불가능한 에러들
  const nonRecoverableCodes = ['AUTH_ERROR', 'PERMISSION_ERROR'];
  
  return !nonRecoverableCodes.includes(appError.code || '');
}

// 에러 재시도 로직
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 재시도 가능한 에러인지 확인
      if (!isRecoverableError(error)) {
        throw error;
      }
      
      // 지수 백오프
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// 비동기 에러 핸들러
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
}

// React 컴포넌트용 에러 핸들러
export function handleComponentError(error: unknown, componentName: string): void {
  logError(error, componentName);
  
  // 개발 환경에서는 에러를 다시 던져서 React DevTools에서 확인할 수 있도록 함
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
}

// API 에러 처리
export function handleApiError(response: Response): never {
  const error = createError(
    `API 요청 실패: ${response.status} ${response.statusText}`,
    'API_ERROR',
    response.status
  );
  
  logError(error, 'API');
  throw error;
}

// 폼 검증 에러 처리
export function createValidationError(field: string, message: string): AppError {
  return createError(
    message,
    'VALIDATION_ERROR',
    400,
    { field }
  );
}

// 데이터베이스 에러 처리
export function handleDatabaseError(error: unknown, operation: string): never {
  const appError = classifyError(error);
  appError.code = 'DATABASE_ERROR';
  appError.context = { operation };
  
  logError(appError, 'Database');
  throw appError;
} 