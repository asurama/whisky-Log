// 접근성 관련 유틸리티 함수들

// 키보드 네비게이션 지원
export const handleKeyDown = (
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      onArrowRight?.();
      break;
  }
};

// 포커스 관리
export const focusFirstElement = (containerRef: React.RefObject<HTMLElement>) => {
  if (containerRef.current) {
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
};

export const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
};

// 스크린 리더 지원
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  
  // 메시지 설정
  announcement.textContent = message;
  
  // 잠시 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// 색상 대비 검사
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) {
        return c / 12.92;
      }
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// 접근성 검증
export const validateAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // 이미지 alt 텍스트 검사
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`이미지 ${index + 1}에 alt 텍스트가 없습니다.`);
    }
  });
  
  // 버튼 텍스트 검사
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push(`버튼 ${index + 1}에 텍스트나 aria-label이 없습니다.`);
    }
  });
  
  // 링크 텍스트 검사
  const links = element.querySelectorAll('a');
  links.forEach((link, index) => {
    if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
      issues.push(`링크 ${index + 1}에 텍스트나 aria-label이 없습니다.`);
    }
  });
  
  // 폼 라벨 검사
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = element.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`입력 필드 ${index + 1}에 라벨이 없습니다.`);
      }
    }
  });
  
  return issues;
};

// 접근성 스타일 유틸리티
export const accessibilityStyles = {
  // 포커스 표시
  focusVisible: {
    outline: '2px solid #3B82F6',
    outlineOffset: '2px',
    borderRadius: '4px'
  },
  
  // 스크린 리더 전용 텍스트
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0'
  },
  
  // 고대비 모드 지원
  highContrast: {
    '@media (prefers-contrast: high)': {
      border: '2px solid currentColor',
      backgroundColor: 'transparent'
    }
  },
  
  // 모션 감소 모드 지원
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      transition: 'none'
    }
  }
};

// 접근성 속성 생성기
export const createAccessibilityProps = (options: {
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  tabIndex?: number;
}) => {
  return {
    role: options.role,
    'aria-label': options['aria-label'],
    'aria-describedby': options['aria-describedby'],
    'aria-expanded': options['aria-expanded'],
    'aria-selected': options['aria-selected'],
    'aria-hidden': options['aria-hidden'],
    'aria-live': options['aria-live'],
    'aria-atomic': options['aria-atomic'],
    tabIndex: options.tabIndex
  };
};

// 접근성 메시지 생성기
export const createAccessibilityMessage = (action: string, element: string, context?: string): string => {
  let message = `${action} ${element}`;
  if (context) {
    message += ` ${context}`;
  }
  return message;
};

// 접근성 로깅
export const logAccessibilityEvent = (event: string, details: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[접근성] ${event}:`, details);
  }
};

// 접근성 설정 관리
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private settings: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };

  private constructor() {
    this.settings = {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReader: false
    };
    this.loadSettings();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
    }
  }

  updateSetting<K extends keyof typeof this.settings>(key: K, value: typeof this.settings[K]) {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
  }

  getSettings() {
    return { ...this.settings };
  }

  private applySettings() {
    const root = document.documentElement;
    
    // 고대비 모드
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 모션 감소
    if (this.settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // 폰트 크기
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${this.settings.fontSize}`);
  }
} 