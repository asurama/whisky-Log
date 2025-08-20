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
}

interface SimpleSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  brands: any[];
  currentFilters: SearchFilters;
}

export default function SimpleSearch({ 
  onFiltersChange, 
  brands, 
  currentFilters 
}: SimpleSearchProps) {
  const { isMobile } = useDevice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
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
      abvMax: ''
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value: any) => value !== '');
  };

  return (
    <div className="glass" style={{
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* 기본 검색 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            fontSize: '18px',
            color: '#9CA3AF'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="위스키명, 브랜드, 메모로 검색..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="input-field"
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              fontSize: '16px',
              borderRadius: '12px'
            }}
          />
        </div>
      </div>

      {/* 고급 필터 토글 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '20px' : '0'
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#3B82F6',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ fontSize: '16px' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
          고급 필터
        </button>
        
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
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
          gap: '16px',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'
        }}>
          {/* 브랜드 필터 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              브랜드
            </label>
            <select
              value={filters.brandFilter}
              onChange={(e) => handleFilterChange('brandFilter', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">모든 브랜드</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* 가격 범위 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              가격 범위 (원)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9CA3AF', alignSelf: 'center' }}>~</span>
              <input
                type="number"
                placeholder="최대"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* 숙성연수 범위 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              숙성연수 (년)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.ageMin}
                onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9CA3AF', alignSelf: 'center' }}>~</span>
              <input
                type="number"
                placeholder="최대"
                value={filters.ageMax}
                onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              상태
            </label>
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #374151',
                borderRadius: '6px',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">모든 상태</option>
              <option value="unopened">미오픈</option>
              <option value="opened">오픈</option>
            </select>
          </div>

          {/* 빈티지 범위 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              빈티지 (년)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="최소"
                value={filters.vintageMin}
                onChange={(e) => handleFilterChange('vintageMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9CA3AF', alignSelf: 'center' }}>~</span>
              <input
                type="number"
                placeholder="최대"
                value={filters.vintageMax}
                onChange={(e) => handleFilterChange('vintageMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* 도수 범위 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
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
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9CA3AF', alignSelf: 'center' }}>~</span>
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
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {hasActiveFilters() && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#374151',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#9CA3AF'
        }}>
          <strong>활성 필터:</strong>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filters.searchTerm && (
              <span style={{
                backgroundColor: '#3B82F6',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                검색: {filters.searchTerm}
              </span>
            )}
            {filters.brandFilter && (
              <span style={{
                backgroundColor: '#10B981',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                브랜드: {brands.find(b => b.id === filters.brandFilter)?.name || filters.brandFilter}
              </span>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <span style={{
                backgroundColor: '#F59E0B',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                가격: {filters.priceMin || '0'}~{filters.priceMax || '∞'}원
              </span>
            )}
            {(filters.ageMin || filters.ageMax) && (
              <span style={{
                backgroundColor: '#8B5CF6',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                숙성: {filters.ageMin || '0'}~{filters.ageMax || '∞'}년
              </span>
            )}
            {filters.statusFilter && (
              <span style={{
                backgroundColor: filters.statusFilter === 'opened' ? '#059669' : '#DC2626',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                상태: {filters.statusFilter === 'opened' ? '오픈' : '미오픈'}
              </span>
            )}
            {(filters.vintageMin || filters.vintageMax) && (
              <span style={{
                backgroundColor: '#7C3AED',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                빈티지: {filters.vintageMin || '0'}~{filters.vintageMax || '∞'}년
              </span>
            )}
            {(filters.abvMin || filters.abvMax) && (
              <span style={{
                backgroundColor: '#EC4899',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                도수: {filters.abvMin || '0'}~{filters.abvMax || '∞'}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 