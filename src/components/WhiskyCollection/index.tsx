'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '../Toast';
import { useDevice } from '@/hooks/useDevice';
import WhiskyCard from './WhiskyCard';
import WhiskyFilters from './WhiskyFilters';
import SkeletonLoader from '../SkeletonLoader';

interface WhiskyCollectionProps {
  user: any;
  brands: any[];
  onShowWhiskyModal: (bottle?: any) => void;
  onShowTastingModal: (bottle: any) => void;
  onShowTastingHistory: (bottle: any) => void;
  onShowDetailModal: (bottle: any) => void;
}

export default function WhiskyCollection({ 
  user, 
  brands, 
  onShowWhiskyModal, 
  onShowTastingModal, 
  onShowTastingHistory, 
  onShowDetailModal 
}: WhiskyCollectionProps) {
  const [bottles, setBottles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isMobile, isTablet, isTabletLandscape, isDesktop } = useDevice();
  const [searchFilters, setSearchFilters] = useState({
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
  });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { showToast } = useToast();

  const ITEMS_PER_PAGE = 12;

  // 위스키 데이터 가져오기
  const fetchBottles = async () => {
    try {
      const { data, error } = await supabase
        .from('bottles')
        .select(`
          *,
          brands (id, name, country, region, description),
          tastings (id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // tasting_count 계산
      const bottlesWithCount = data.map(bottle => {
        const tastingCount = bottle.tastings?.length || 0;
        return {
        ...bottle,
          tasting_count: tastingCount
        };
      });

      setBottles(bottlesWithCount);
    } catch (error) {
      console.error('위스키 데이터 가져오기 오류:', error);
      showToast('데이터를 가져오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBottles();
    }
  }, [user]);

  // 필터링된 위스키 목록
  const filteredBottlesMemo = useMemo(() => {
    if (!isSearchMode) return bottles;

    return bottles.filter(bottle => {
      // 검색어 필터링
      if (searchFilters.searchTerm) {
        const searchLower = searchFilters.searchTerm.toLowerCase();
        const nameMatch = bottle.name.toLowerCase().includes(searchLower);
        const brandMatch = (bottle.brands?.name || bottle.custom_brand || '').toLowerCase().includes(searchLower);
        if (!nameMatch && !brandMatch) return false;
      }

      // 브랜드 필터링
      if (searchFilters.brandFilter) {
        const selectedBrandName = brands.find(b => b.id === searchFilters.brandFilter)?.name || '';
        const bottleBrandName = bottle.brands?.name || bottle.custom_brand || '';
        if (!bottleBrandName.toLowerCase().includes(selectedBrandName.toLowerCase())) {
          return false;
        }
      }

      // 가격 필터링
      if (searchFilters.priceMin && bottle.retail_price < parseFloat(searchFilters.priceMin)) return false;
      if (searchFilters.priceMax && bottle.retail_price > parseFloat(searchFilters.priceMax)) return false;

      // 연도 필터링
      if (searchFilters.ageMin && bottle.age_years < parseInt(searchFilters.ageMin)) return false;
      if (searchFilters.ageMax && bottle.age_years > parseInt(searchFilters.ageMax)) return false;

      // 상태 필터링
      if (searchFilters.statusFilter && bottle.bottle_status !== searchFilters.statusFilter) return false;

      // 빈티지 필터링
      if (searchFilters.vintageMin && bottle.vintage < parseInt(searchFilters.vintageMin)) return false;
      if (searchFilters.vintageMax && bottle.vintage > parseInt(searchFilters.vintageMax)) return false;

      // 도수 필터링
      if (searchFilters.abvMin && bottle.abv < parseFloat(searchFilters.abvMin)) return false;
      if (searchFilters.abvMax && bottle.abv > parseFloat(searchFilters.abvMax)) return false;

      // 캐스크 타입 필터링
      if (searchFilters.caskTypeFilter && bottle.cask_type !== searchFilters.caskTypeFilter) return false;

      return true;
    });
  }, [bottles, searchFilters, isSearchMode, brands]);

  // 페이지네이션된 결과
  const paginatedBottles = filteredBottlesMemo.slice(0, currentPage * ITEMS_PER_PAGE);

  // 더 보기
  const loadMore = () => {
    if (paginatedBottles.length < filteredBottlesMemo.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // 필터 변경 핸들러
  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    setIsSearchMode(true);
    setCurrentPage(1);
  };

  // 검색 핸들러
  const handleSearch = () => {
    setIsSearchMode(true);
    setCurrentPage(1);
  };

  // 검색 초기화
  const resetSearchMode = () => {
    setSearchFilters({
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
    });
    setIsSearchMode(false);
    setCurrentPage(1);
  };

  // 위스키 편집
  const handleEdit = (bottle: any) => {
    onShowWhiskyModal(bottle);
  };

  // 위스키 삭제
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bottles')
        .delete()
        .eq('id', id);

      if (error) throw error;

              setBottles((prev: any[]) => prev.filter((bottle: any) => bottle.id !== id));
      showToast('위스키가 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('위스키 삭제 오류:', error);
      showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 시음 추가
  const handleAddTasting = (bottle: any) => {
    onShowTastingModal(bottle);
  };

  // 상세 모달 열기
  const handleShowDetail = (bottle: any) => {
    onShowDetailModal(bottle);
  };

  // 시음 기록 보기
  const handleViewTastings = (bottle: any) => {
    onShowTastingHistory(bottle);
  };

  // 이미지 변경
  const handleImageChange = (bottle: any) => {
    onShowWhiskyModal(bottle);
  };

  if (loading) {
    return <SkeletonLoader type="grid" count={6} />;
  }

  // brands가 로딩 중이거나 없을 때 처리
  const safeBrands = brands || [];

  return (
    <div style={{ padding: '20px' }}>
      {/* 필터 */}
      <WhiskyFilters
        currentFilters={searchFilters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        isSearchMode={isSearchMode}
        onResetSearch={resetSearchMode}
        brands={safeBrands}
      />

      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
          {isSearchMode ? `${filteredBottlesMemo.length}개` : `${bottles.length}개`}의 위스키
        </span>
        <button
          onClick={() => onShowWhiskyModal()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          위스키 추가
        </button>
      </div>

      {/* 위스키 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 
                              isTablet ? 'repeat(2, 1fr)' : 
                              isTabletLandscape ? 'repeat(3, 1fr)' :
                              'repeat(auto-fill, minmax(320px, 1fr))',
        gap: isMobile ? '16px' : isTablet ? '20px' : '24px',
        marginBottom: '24px',
        maxWidth: '100%',
        overflowX: 'hidden',
        overflowY: 'visible', // 세로 스크롤 허용
        touchAction: 'pan-y', // 모바일에서 세로 스크롤만 허용
        WebkitOverflowScrolling: 'touch', // iOS 스크롤 최적화
        WebkitUserSelect: 'none', // 텍스트 선택 방지
        userSelect: 'none'
      }}>
        {paginatedBottles.map((bottle) => (
          <WhiskyCard
            key={bottle.id}
            bottle={bottle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddTasting={handleAddTasting}
            onViewTastings={handleViewTastings}
            onImageChange={handleImageChange}
            onClick={() => handleShowDetail(bottle)}
          />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {paginatedBottles.length < filteredBottlesMemo.length && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={loadMore}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            더 보기 ({filteredBottlesMemo.length - paginatedBottles.length}개)
          </button>
        </div>
      )}


    </div>
  );
} 