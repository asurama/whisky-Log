// 통합 모달 스타일 시스템
export const modalStyles = {
  // 모달 오버레이
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--color-bg-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--spacing-md)'
  },

  // 모달 컨테이너
  container: {
    backgroundColor: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-primary)',
    borderRadius: 'var(--radius-md)',
    width: '95%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 20px 25px -5px var(--color-shadow-heavy)'
  },

  // 모달 헤더
  header: {
    padding: 'var(--spacing-lg) var(--spacing-xl) var(--spacing-md) var(--spacing-xl)',
    borderBottom: '1px solid var(--color-border-primary)',
    backgroundColor: 'var(--color-bg-primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  // 모달 제목
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: 0
  },

  // 닫기 버튼
  closeButton: {
    width: '32px',
    height: '32px',
    backgroundColor: 'var(--color-danger)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-normal)',
    opacity: 0.8
  },

  // 모달 본문
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: 'var(--spacing-xl)',
    backgroundColor: 'var(--color-bg-primary)'
  },

  // 모달 푸터
  footer: {
    padding: 'var(--spacing-md) var(--spacing-xl) var(--spacing-lg) var(--spacing-xl)',
    borderTop: '1px solid var(--color-border-primary)',
    backgroundColor: 'var(--color-bg-primary)',
    display: 'flex',
    gap: 'var(--spacing-md)',
    justifyContent: 'flex-end'
  },

  // 기본 버튼
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'var(--transition-normal)'
  },

  // 주요 버튼 (저장, 확인 등)
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'var(--transition-normal)'
  },

  // 보조 버튼 (취소, 닫기 등)
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'var(--transition-normal)'
  },

  // 위험 버튼 (삭제 등)
  dangerButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--color-danger)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'var(--transition-normal)'
  },

  // 입력 필드
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--color-border-primary)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    transition: 'var(--transition-normal)'
  },

  // 라벨
  label: {
    display: 'block',
    marginBottom: 'var(--spacing-sm)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)'
  },

  // 폼 그룹
  formGroup: {
    marginBottom: 'var(--spacing-md)'
  },

  // 그리드 레이아웃
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--spacing-md)'
  }
};

// 반응형 스타일
export const responsiveModalStyles = {
  mobile: {
    container: {
      ...modalStyles.container,
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100vh',
      borderRadius: '0'
    },
    header: {
      ...modalStyles.header,
      padding: 'var(--spacing-md) var(--spacing-lg) var(--spacing-sm) var(--spacing-lg)'
    },
    content: {
      ...modalStyles.content,
      padding: 'var(--spacing-lg)'
    },
    footer: {
      ...modalStyles.footer,
      padding: 'var(--spacing-sm) var(--spacing-lg) var(--spacing-md) var(--spacing-lg)'
    }
  },
  tablet: {
    container: {
      ...modalStyles.container,
      maxWidth: '80%',
      maxHeight: '85vh'
    }
  },
  desktop: {
    container: {
      ...modalStyles.container,
      maxWidth: '600px',
      maxHeight: '80vh'
    }
  }
};

// 모달 크기 변형
export const modalSizes = {
  sm: {
    maxWidth: '400px'
  },
  md: {
    maxWidth: '600px'
  },
  lg: {
    maxWidth: '800px'
  },
  xl: {
    maxWidth: '1000px'
  }
};

// 모달 타입별 스타일
export const modalVariants = {
  default: {
    ...modalStyles
  },
  form: {
    ...modalStyles,
    content: {
      ...modalStyles.content,
      padding: 'var(--spacing-xl)'
    }
  },
  detail: {
    ...modalStyles,
    container: {
      ...modalStyles.container,
      maxWidth: '900px',
      maxHeight: '85vh'
    },
    content: {
      ...modalStyles.content,
      padding: 'var(--spacing-xl)'
    }
  }
};

// 호버 효과
export const hoverEffects = {
  closeButton: {
    opacity: 1,
    transform: 'scale(1.05)'
  },
  primaryButton: {
    backgroundColor: 'var(--color-primary-dark)',
    transform: 'translateY(-1px)'
  },
  secondaryButton: {
    backgroundColor: 'var(--color-text-muted)',
    transform: 'translateY(-1px)'
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    transform: 'translateY(-1px)'
  }
}; 