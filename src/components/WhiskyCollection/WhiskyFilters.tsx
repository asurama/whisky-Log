'use client';

import AdvancedSearch from '../search/AdvancedSearch';

interface WhiskyFiltersProps {
  currentFilters: any;
  onFiltersChange: (filters: any) => void;
  onSearch: () => void;
  isSearchMode: boolean;
  onResetSearch: () => void;
  brands: any[];
}

export default function WhiskyFilters({
  currentFilters,
  onFiltersChange,
  onSearch,
  isSearchMode,
  onResetSearch,
  brands
}: WhiskyFiltersProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <AdvancedSearch
        currentFilters={currentFilters}
        onFiltersChange={onFiltersChange}
        onSearch={onSearch}
        searchType="bottles"
        brands={brands}
      />
      
      {isSearchMode && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={onResetSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔄 검색 초기화
          </button>
        </div>
      )}
    </div>
  );
} 