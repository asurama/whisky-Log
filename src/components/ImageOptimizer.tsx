'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ImageOptimizer({
  src,
  alt,
  className = '',
  style = {},
  placeholder = '🥃',
  onLoad,
  onError
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Intersection Observer로 지연 로딩 구현
    if (imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry: any) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // 50px 전에 미리 로딩
          threshold: 0.1
        }
      );

      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // 이미지 URL 최적화 (Supabase Storage URL인 경우)
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return '';
    
    // Supabase Storage URL인 경우 쿼리 파라미터 추가
    if (originalSrc.includes('supabase.co')) {
      try {
      const url = new URL(originalSrc);
        // 카드용으로 적절한 크기와 품질 설정
        url.searchParams.set('quality', '85'); // 품질 최적화
        url.searchParams.set('width', '300'); // 카드용 적절한 크기
        url.searchParams.set('height', '200'); // 카드용 적절한 크기
        // WebP 포맷은 브라우저 지원 여부에 따라 자동 선택되도록 제거
      return url.toString();
      } catch (error) {
        console.warn('이미지 URL 최적화 실패:', error);
        return originalSrc;
      }
    }
    
    return originalSrc;
  };

  return (
    <div
      ref={imgRef}
      className={`image-optimizer ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#374151',
        ...style
      }}
    >
      {/* 플레이스홀더 */}
      {!isLoaded && !isError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#6b7280',
            backgroundColor: '#374151',
            zIndex: 1
          }}
        >
          {placeholder}
        </div>
      )}

      {/* 실제 이미지 */}
      {isInView && !isError && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...style
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* 에러 상태 */}
      {isError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#6b7280',
            backgroundColor: '#374151'
          }}
        >
          🖼️
        </div>
      )}
    </div>
  );
} 