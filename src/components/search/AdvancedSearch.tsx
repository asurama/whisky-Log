'use client';

import { useState, useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';

interface SearchFilters {
  searchTerm: string;
  brandFilter: string;
  priceMin: string;
  priceMax: string;
  ageMin: string;
  ageMax: string;
  statusFilter: string;
  vintageMin: string;
  vintageMax: string;
  abvMin: string;
  abvMax: string;
  ratingMin: string;
  ratingMax: string;
  regionFilter: string;
  caskTypeFilter: string;
  dateAddedMin: string;
  dateAddedMax: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  brands: any[];
  currentFilters: SearchFilters;
  searchType: 'bottles' | 'tastings';
}

export default function AdvancedSearch({ 
  onFiltersChange, 
  onSearch,
  brands = [], 
  currentFilters,
  searchType
}: AdvancedSearchProps) {
  const { isMobile } = useDevice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  // 검색 버튼을 눌렀을 때만 필터 적용
  const handleSearchClick = () => {
    onFiltersChange(filters);
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFiltersChange(filters);
      onSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      brandFilter: '',
      priceMin: '',
      priceMax: '',
      ageMin: '',
      ageMax: '',
      statusFilter: '',
      vintageMin: '',
      vintageMax: '',
      abvMin: '',
      abvMax: '',
      ratingMin: '',
      ratingMax: '',
      regionFilter: '',
      caskTypeFilter: '',
      dateAddedMin: '',
      dateAddedMax: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onSearch();
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value: any) => 
      Array.isArray(value) ? value.length > 0 : value !== ''
    );
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value: any) => 
      Array.isArray(value) ? value.length > 0 : value !== ''
    ).length;
  };

  return (
    <div style={{
      backgroundColor: '#1F2937',
      borderRadius: '12px',
      padding: isMobile ? '12px' : '16px',
      marginBottom: '20px',
      border: '1px solid #374151'
    }}>
      {/* 기본 검색 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={searchType === 'bottles' ? "위스키명, 브랜드, 메모로 검색..." : "위스키명, 브랜드, 시음 노트로 검색..."}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: isMobile ? '10px 12px' : '12px 16px',
              borderRadius: '8px',
              border: '1px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: isMobile ? '14px' : '16px'
            }}
          />
          <button
            onClick={handleSearchClick}
            style={{
              padding: isMobile ? '10px 16px' : '12px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔍 검색
          </button>
        </div>
      </div>

      {/* 고급 필터 토글 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '16px' : '0'
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#3B82F6',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔍 고급 필터</span>
          {hasActiveFilters() && (
            <span style={{
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {getActiveFilterCount()}
            </span>
          )}
          <span style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </span>
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 고급 필터 패널 */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px' : '16px',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          {/* 브랜드 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              브랜드
            </label>
            <select
              value={filters.brandFilter}
              onChange={(e) => handleFilterChange('brandFilter', e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '6px 10px' : '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              <option value="">모든 브랜드</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              )) || []}
            </select>
          </div>

          {/* 가격 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              가격 범위 (원)
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
              <input
                type="number"
                placeholder="최대"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
            </div>
          </div>

          {/* 숙성연수 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              숙성연수
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.ageMin}
                onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
              <input
                type="number"
                placeholder="최대"
                value={filters.ageMax}
                onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              상태
            </label>
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '6px 10px' : '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              <option value="">모든 상태</option>
              <option value="unopened">미오픈</option>
              <option value="opened">오픈</option>
            </select>
          </div>

          {/* 빈티지 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              빈티지
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.vintageMin}
                onChange={(e) => handleFilterChange('vintageMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
              <input
                type="number"
                placeholder="최대"
                value={filters.vintageMax}
                onChange={(e) => handleFilterChange('vintageMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              />
            </div>
          </div>

          {/* 캐스크 타입 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              캐스크 타입
            </label>
            <select
              value={filters.caskTypeFilter}
              onChange={(e) => handleFilterChange('caskTypeFilter', e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '6px 10px' : '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              <option value="">모든 캐스크 타입</option>
              <option value="Sherry">Sherry</option>
              <option value="Bourbon">Bourbon</option>
              <option value="Port">Port</option>
              <option value="Madeira">Madeira</option>
              <option value="Wine">Wine</option>
              <option value="Rum">Rum</option>
              <option value="Cognac">Cognac</option>
              <option value="Virgin Oak">Virgin Oak</option>
            </select>
          </div>

          {/* 도수 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9CA3AF' }}>
              도수 (%)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.1"
                placeholder="최소"
                value={filters.abvMin}
                onChange={(e) => handleFilterChange('abvMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                step="0.1"
                placeholder="최대"
                value={filters.abvMax}
                onChange={(e) => handleFilterChange('abvMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* 평점 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9CA3AF' }}>
              평점
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="최소"
                value={filters.ratingMin}
                onChange={(e) => handleFilterChange('ratingMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="최대"
                value={filters.ratingMax}
                onChange={(e) => handleFilterChange('ratingMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#1F2937',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* 지역 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9CA3AF' }}>
              지역
            </label>
            <select
              value={filters.regionFilter}
              onChange={(e) => handleFilterChange('regionFilter', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">모든 지역</option>
              <option value="scotch">스코틀랜드</option>
              <option value="irish">아일랜드</option>
              <option value="american">미국</option>
              <option value="japanese">일본</option>
              <option value="canadian">캐나다</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 캐스크 타입 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9CA3AF' }}>
              캐스크 타입
            </label>
            <select
              value={filters.caskTypeFilter}
              onChange={(e) => handleFilterChange('caskTypeFilter', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">모든 타입</option>
              <option value="sherry">셰리 캐스크</option>
              <option value="bourbon">버번 캐스크</option>
              <option value="port">포트 캐스크</option>
              <option value="wine">와인 캐스크</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 