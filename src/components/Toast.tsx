'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  };

  const hideToast = (id: string) => {
            setToasts((prev: any[]) => prev.filter((toast: any) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: string) => void;
}

function ToastContainer({ toasts, onHide }: ToastContainerProps) {
  const getToastStyle = (type: Toast['type']) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '280px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      animation: 'slideIn 0.3s ease-out',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    const typeStyles = {
      success: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        color: 'white',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        color: 'white',
        borderColor: 'rgba(245, 158, 11, 0.3)'
      },
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={getToastStyle(toast.type)}
          onClick={() => onHide(toast.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{getIcon(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(toast.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '12px',
              opacity: 0.7,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            ×
          </button>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 