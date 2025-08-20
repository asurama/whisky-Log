'use client';

import { useState, useEffect } from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'text' | 'image' | 'grid';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type, count = 1, className = '' }: SkeletonLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 약간의 지연으로 자연스러운 로딩 효과
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div
            className={`skeleton-card ${className}`}
            style={{
              backgroundColor: '#374151',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #4B5563',
              animation: isVisible ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}
          >
            {/* 이미지 스켈레톤 */}
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#4B5563',
                borderRadius: '8px',
                marginBottom: '16px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            
            {/* 제목 스켈레톤 */}
            <div
              style={{
                width: '70%',
                height: '24px',
                backgroundColor: '#4B5563',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            
            {/* 부제목 스켈레톤 */}
            <div
              style={{
                width: '50%',
                height: '16px',
                backgroundColor: '#4B5563',
                borderRadius: '4px',
                marginBottom: '16px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            
            {/* 태그 스켈레톤 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '24px',
                  backgroundColor: '#4B5563',
                  borderRadius: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  width: '80px',
                  height: '24px',
                  backgroundColor: '#4B5563',
                  borderRadius: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            </div>
            
            {/* 버튼 스켈레톤 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  height: '36px',
                  backgroundColor: '#4B5563',
                  borderRadius: '6px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '36px',
                  backgroundColor: '#4B5563',
                  borderRadius: '6px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div
            className={`skeleton-list ${className}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  border: '1px solid #4B5563'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4B5563',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '60%',
                      height: '16px',
                      backgroundColor: '#4B5563',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                  <div
                    style={{
                      width: '40%',
                      height: '12px',
                      backgroundColor: '#4B5563',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div
            className={`skeleton-text ${className}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: index === count - 1 ? '60%' : '100%',
                  height: '16px',
                  backgroundColor: '#4B5563',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            ))}
          </div>
        );

      case 'image':
        return (
          <div
            className={`skeleton-image ${className}`}
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#4B5563',
              borderRadius: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        );

      case 'grid':
        return (
          <div
            className={`skeleton-grid ${className}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px'
            }}
          >
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#374151',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #4B5563',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              >
                {/* 이미지 스켈레톤 */}
                <div
                  style={{
                    width: '100%',
                    height: '150px',
                    backgroundColor: '#4B5563',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                
                {/* 제목 스켈레톤 */}
                <div
                  style={{
                    width: '70%',
                    height: '20px',
                    backgroundColor: '#4B5563',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                
                {/* 부제목 스켈레톤 */}
                <div
                  style={{
                    width: '50%',
                    height: '14px',
                    backgroundColor: '#4B5563',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                
                {/* 태그 스켈레톤 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '20px',
                      backgroundColor: '#4B5563',
                      borderRadius: '10px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                  <div
                    style={{
                      width: '70px',
                      height: '20px',
                      backgroundColor: '#4B5563',
                      borderRadius: '10px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderSkeleton()}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
} 