'use client';

import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  showText?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#3B82F6',
  text = '로딩중...',
  showText = true 
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '12px'
    }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `2px solid ${color}20`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          flexShrink: 0
        }}
      />
      {showText && (
        <div style={{
          fontSize: '14px',
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          {text}{dots}
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 