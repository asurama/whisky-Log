'use client';

import { useState } from 'react';
import { useDevice } from '@/hooks/useDevice';

interface AdvancedSearchFiltersProps {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  searchType: 'bottles' | 'tastings';
  brands?: any[];
}

export default function AdvancedSearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  searchType,
  brands
}: AdvancedSearchFiltersProps) {
  const { isMobile } = useDevice();
  const [showAdvanced, setShowAdvanced] = useState(false);

    const hasActiveFilters = () => {
    return Object.values(filters).some((value: any) =>
      value !== '' && value !== null && value !== undefined
    );
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined
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
        <input
          type="text"
          placeholder={searchType === 'bottles' ? "위스키명, 브랜드, 메모로 검색..." : "위스키명, 브랜드, 시음 노트로 검색..."}
          value={filters.searchTerm || ''}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          style={{
            width: '100%',
            padding: isMobile ? '10px 12px' : '12px 16px',
            borderRadius: '8px',
            border: '1px solid #4B5563',
            backgroundColor: '#374151',
            color: 'white',
            fontSize: isMobile ? '14px' : '16px'
          }}
        />
      </div>

      {/* 고급 필터 토글 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: showAdvanced ? '16px' : '0'
      }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
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
            transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </span>
        </button>

        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
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
      {showAdvanced && (
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
              value={filters.brandFilter || ''}
              onChange={(e) => onFilterChange('brandFilter', e.target.value)}
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
                value={filters.priceMin || ''}
                onChange={(e) => onFilterChange('priceMin', e.target.value)}
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
                value={filters.priceMax || ''}
                onChange={(e) => onFilterChange('priceMax', e.target.value)}
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.ageMin || ''}
                onChange={(e) => onFilterChange('ageMin', e.target.value)}
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
                value={filters.ageMax || ''}
                onChange={(e) => onFilterChange('ageMax', e.target.value)}
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

          {/* ABV 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              도수 (%)
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.abvMin || ''}
                onChange={(e) => onFilterChange('abvMin', e.target.value)}
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
                value={filters.abvMax || ''}
                onChange={(e) => onFilterChange('abvMax', e.target.value)}
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

          {/* 상태 필터 (위스키 컬렉션만) */}
          {searchType === 'bottles' && (
            <div>
              <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
                상태
              </label>
              <select
                value={filters.statusFilter || ''}
                onChange={(e) => onFilterChange('statusFilter', e.target.value)}
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
                <option value="empty">빈병</option>
              </select>
            </div>
          )}

          {/* 시음 타입 필터 (시음 기록만) */}
          {searchType === 'tastings' && (
            <div>
              <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
                시음 타입
              </label>
              <select
                value={filters.tastingTypeFilter || ''}
                onChange={(e) => onFilterChange('tastingTypeFilter', e.target.value)}
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
                <option value="">모든 타입</option>
                <option value="bottle">보틀 시음</option>
                <option value="bar">바 시음</option>
                <option value="meeting">모임 시음</option>
              </select>
            </div>
          )}

          {/* 평점 범위 (시음 기록만) */}
          {searchType === 'tastings' && (
            <div>
              <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
                평점
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  placeholder="최소"
                  value={filters.ratingMin || ''}
                  onChange={(e) => onFilterChange('ratingMin', e.target.value)}
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
                  min="1"
                  max="10"
                  step="0.1"
                  placeholder="최대"
                  value={filters.ratingMax || ''}
                  onChange={(e) => onFilterChange('ratingMax', e.target.value)}
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
          )}

          {/* 날짜 범위 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              {searchType === 'bottles' ? '구매일' : '시음일'}
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="date"
                value={filters.dateMin || ''}
                onChange={(e) => onFilterChange('dateMin', e.target.value)}
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
                type="date"
                value={filters.dateMax || ''}
                onChange={(e) => onFilterChange('dateMax', e.target.value)}
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

          {/* 지역 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              지역
            </label>
            <select
              value={filters.regionFilter || ''}
              onChange={(e) => onFilterChange('regionFilter', e.target.value)}
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
              <option value="">모든 지역</option>
              <option value="스코틀랜드">스코틀랜드</option>
              <option value="아일랜드">아일랜드</option>
              <option value="미국">미국</option>
              <option value="캐나다">캐나다</option>
              <option value="일본">일본</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 캐스크 타입 필터 */}
          <div>
            <label style={{ display: 'block', marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '13px' : '14px', color: '#9CA3AF' }}>
              캐스크 타입
            </label>
            <select
              value={filters.caskTypeFilter || ''}
              onChange={(e) => onFilterChange('caskTypeFilter', e.target.value)}
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
              <option value="">모든 타입</option>
              <option value="Sherry">Sherry</option>
              <option value="Bourbon">Bourbon</option>
              <option value="Port">Port</option>
              <option value="Madeira">Madeira</option>
              <option value="Wine">Wine</option>
              <option value="Rum">Rum</option>
              <option value="Cognac">Cognac</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 