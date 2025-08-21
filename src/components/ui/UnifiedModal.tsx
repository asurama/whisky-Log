'use client';

import React, { useEffect, useState } from 'react';
import { modalStyles, responsiveModalStyles, modalSizes, modalVariants, hoverEffects } from './ModalStyles';
import { useDevice } from '@/hooks/useDevice';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'form' | 'detail';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function UnifiedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  footer,
  className = '',
  style = {}
}: UnifiedModalProps) {
  const { isMobile, isTablet } = useDevice();
  const [modalTop, setModalTop] = useState(0);

  // 모달이 열릴 때 스크롤 위치 저장
  useEffect(() => {
    if (isOpen && isMobile && typeof window !== 'undefined') {
      setModalTop(window.scrollY);
    }
  }, [isOpen, isMobile]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열려있을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 반응형 스타일 결정
  const responsiveStyle = isMobile 
    ? responsiveModalStyles.mobile 
    : isTablet 
    ? responsiveModalStyles.tablet 
    : responsiveModalStyles.desktop;

  // 모달 스타일 조합
  const baseStyles = modalVariants[variant];
  const sizeStyles = modalSizes[size];
  const finalStyles = {
    ...baseStyles,
    container: {
      ...baseStyles.container,
      ...responsiveStyle.container,
      ...sizeStyles,
      ...style
    }
  };

  // 모바일용 래퍼 스타일
  const mobileWrapperStyle = isMobile && typeof window !== 'undefined' ? {
    position: 'fixed' as const,
    top: modalTop + 'px',
    left: 0,
    right: 0,
    bottom: `calc(100vh - ${modalTop}px)`,
    zIndex: 999999
  } : {};

  return (
    <div
      style={{
        ...finalStyles.overlay,
        ...mobileWrapperStyle
      }}
      className={className}
      onClick={(e) => {
        // 오버레이 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={finalStyles.container}>
        {/* 헤더 */}
        <div style={finalStyles.header}>
          <h2 style={finalStyles.title}>{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              style={finalStyles.closeButton}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, hoverEffects.closeButton);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="모달 닫기"
            >
              ×
            </button>
          )}
        </div>

        {/* 본문 */}
        <div style={finalStyles.content}>
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div style={finalStyles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// 모달 버튼 컴포넌트
interface ModalButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function ModalButton({
  variant = 'primary',
  onClick,
  disabled = false,
  children,
  className = '',
  style = {},
  type = 'button'
}: ModalButtonProps) {
  const baseStyle = modalStyles[`${variant}Button` as keyof typeof modalStyles] as React.CSSProperties;
  const hoverEffect = hoverEffects[`${variant}Button` as keyof typeof hoverEffects];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && hoverEffect) {
          Object.assign(e.currentTarget.style, hoverEffect);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = baseStyle.backgroundColor as string;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </button>
  );
}

// 모달 입력 필드 컴포넌트
interface ModalInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ModalInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  style = {}
}: ModalInputProps) {
  return (
    <div style={modalStyles.formGroup} className={className}>
      {label && (
        <label style={modalStyles.label}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        style={{
          ...modalStyles.input,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style
        }}
      />
    </div>
  );
} 