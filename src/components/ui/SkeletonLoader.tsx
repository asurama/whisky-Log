'use client';

interface SkeletonProps {
  className?: string;
  count?: number;
}

// 기본 스켈레톤
export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-300 rounded ${className}`}
        />
      ))}
    </>
  );
}

// 위스키 카드 스켈레톤
export function WhiskyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      {/* 이미지 */}
      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4" />
      
      {/* 제목 */}
      <div className="h-6 bg-gray-300 rounded mb-2" />
      
      {/* 브랜드 */}
      <div className="h-4 bg-gray-300 rounded mb-2 w-2/3" />
      
      {/* 정보 */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-1/2" />
        <div className="h-3 bg-gray-300 rounded w-1/3" />
      </div>
    </div>
  );
}

// 검색 결과 스켈레톤
export function SearchResultSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
          {/* 이미지 */}
          <div className="w-12 h-12 bg-gray-300 rounded" />
          
          {/* 정보 */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-300 rounded w-1/3" />
          </div>
          
          {/* 버튼 */}
          <div className="w-16 h-8 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}

// 모달 스켈레톤
export function ModalSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      {/* 제목 */}
      <div className="h-8 bg-gray-300 rounded mb-6" />
      
      {/* 폼 필드들 */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-300 rounded" />
        <div className="h-12 bg-gray-300 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-300 rounded" />
          <div className="h-12 bg-gray-300 rounded" />
        </div>
        <div className="h-24 bg-gray-300 rounded" />
      </div>
      
      {/* 버튼 */}
      <div className="flex space-x-3 mt-6">
        <div className="flex-1 h-12 bg-gray-300 rounded" />
        <div className="flex-1 h-12 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

// 리스트 스켈레톤
export function ListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded animate-pulse">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-1" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
} 