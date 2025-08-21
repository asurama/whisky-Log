'use client';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title, 
  message, 
  type = 'error', 
  onRetry, 
  className = '' 
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      container: 'bg-red-900/20 border-red-500/50',
      icon: 'text-red-400',
      title: 'text-red-200',
      message: 'text-red-300'
    },
    warning: {
      container: 'bg-yellow-900/20 border-yellow-500/50',
      icon: 'text-yellow-400',
      title: 'text-yellow-200',
      message: 'text-yellow-300'
    },
    info: {
      container: 'bg-blue-900/20 border-blue-500/50',
      icon: 'text-blue-400',
      title: 'text-blue-200',
      message: 'text-blue-300'
    }
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const styles = typeStyles[type];

  return (
    <div className={`p-4 border rounded-lg ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`text-lg ${styles.icon}`}>
          {icons[type]}
        </span>
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium mb-1 ${styles.title}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors duration-200"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 네트워크 에러 메시지
export function NetworkErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="네트워크 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요."
      type="error"
      onRetry={onRetry}
    />
  );
}

// 서버 에러 메시지
export function ServerErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="서버 오류"
      message="일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      type="error"
      onRetry={onRetry}
    />
  );
}

// 권한 에러 메시지
export function PermissionErrorMessage() {
  return (
    <ErrorMessage
      title="권한 없음"
      message="이 작업을 수행할 권한이 없습니다. 관리자에게 문의하세요."
      type="warning"
    />
  );
}

// 데이터 없음 메시지
export function NoDataMessage({ message = "데이터가 없습니다." }: { message?: string }) {
  return (
    <div className="p-8 text-center text-gray-400">
      <div className="text-4xl mb-4">📭</div>
      <p className="text-sm">{message}</p>
    </div>
  );
} 