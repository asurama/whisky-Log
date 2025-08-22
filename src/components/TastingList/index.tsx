'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useDevice } from '@/hooks/useDevice';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import TastingCard from './TastingCard';
import TastingDetailModal from './TastingDetailModal';
import { formatTastingForShare, showShareOptions } from '@/utils/shareUtils';
import { Tasting, TastingListProps, TastingFilters } from '@/types/tasting';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TastingList({ user, brands: propBrands, onShowTastingModal }: TastingListProps) {
  const [tastings, setTastings] = useState<Tasting[]>([]);
  const [bottles, setBottles] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBottleButtons, setShowBottleButtons] = useState(false);
  const { isMobile, isTablet, isTabletLandscape } = useDevice();
  const [searchFilters, setSearchFilters] = useState<TastingFilters>({
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
  const [filteredTastings, setFilteredTastings] = useState<Tasting[]>([]);
  const [selectedTasting, setSelectedTasting] = useState<Tasting | null>(null);
  const [showTastingModal, setShowTastingModal] = useState(false);
  const [showBottleSelectModal, setShowBottleSelectModal] = useState(false);
  const [bottleSearchTerm, setBottleSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchTastings();
      fetchBottles();
      if (propBrands) {
        setBrands(propBrands);
      } else {
        fetchBrands();
      }
    }
  }, [user, propBrands]);

  // 검색 및 필터링
  useEffect(() => {
    if (!isSearchMode) {
      setFilteredTastings(tastings);
      return;
    }

    let filtered = tastings;

    // 검색어 필터링
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(tasting => {
        const bottleName = tasting.bottles?.name || tasting.bottle_name || '';
        const brandName = tasting.bottles?.brands?.name || tasting.bottles?.custom_brand || tasting.bottle_brand || '';
        const notes = tasting.nose_notes || tasting.palate_notes || tasting.finish_notes || tasting.additional_notes || '';
        
        return bottleName.toLowerCase().includes(term) ||
               brandName.toLowerCase().includes(term) ||
               notes.toLowerCase().includes(term);
      });
    }

    // 브랜드 필터링
    if (searchFilters.brandFilter) {
      const selectedBrand = brands.find(b => b.id === searchFilters.brandFilter);
      const selectedBrandName = selectedBrand?.name;
      
      if (selectedBrandName) {
        filtered = filtered.filter(tasting => {
          const bottleBrandName = tasting.bottles?.brands?.name || tasting.bottles?.custom_brand || tasting.bottle_brand || '';
          return bottleBrandName.toLowerCase().includes(selectedBrandName.toLowerCase());
        });
      }
    }

    // 평점 범위 필터링
    if (searchFilters.ratingMin || searchFilters.ratingMax) {
      filtered = filtered.filter(tasting => {
        const rating = tasting.overall_rating || 0;
        const min = searchFilters.ratingMin ? parseFloat(searchFilters.ratingMin) : 0;
        const max = searchFilters.ratingMax ? parseFloat(searchFilters.ratingMax) : Infinity;
        return rating >= min && rating <= max;
      });
    }

    setFilteredTastings(filtered);
  }, [tastings, searchFilters, isSearchMode]);

  const fetchTastings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tastings')
        .select(`
          *,
          bottles (
            name,
            custom_brand,
            vintage,
            age_years,
            brands (name)
          )
        `)
        .eq('user_id', user.id)
        .order('tasting_date', { ascending: false });
      
      if (error) throw error;
      setTastings(data || []);
    } catch (error) {
      console.error('시음 기록 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBottles = async () => {
    try {
      const { data, error } = await supabase
        .from('bottles')
        .select(`
          *,
          brands (name)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      setBottles(data || []);
    } catch (error) {
      console.error('위스키 로딩 오류:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('브랜드 로딩 오류:', error);
    }
  };

  const handleDeleteTasting = async (tastingId: string) => {
    if (!confirm('정말로 이 시음 기록을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('tastings')
        .delete()
        .eq('id', tastingId);
      
      if (error) throw error;
      
      fetchTastings();
      alert('시음 기록이 성공적으로 삭제되었습니다!');
    } catch (error) {
      console.error('시음 기록 삭제 오류:', error);
      alert('시음 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    setIsSearchMode(true);
  };

  const handleSearch = () => {
    setIsSearchMode(true);
  };

  const resetSearchMode = () => {
    setIsSearchMode(false);
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
  };

  const handleShareTasting = (tasting: any) => {
    try {
      const shareData = formatTastingForShare(tasting);
      if (!shareData.text || shareData.text.length < 10) {
        alert('공유할 내용이 부족합니다.');
        return;
      }
      showShareOptions(shareData);
    } catch (error) {
      console.error('시음 기록 공유 오류:', error);
      alert('공유 기능을 사용할 수 없습니다.');
    }
  };

  const openAddModal = () => {
    if (bottles.length === 0) {
      alert('먼저 위스키를 추가해주세요.');
      return;
    }
    
    if (bottles.length === 1) {
      if (onShowTastingModal) {
        onShowTastingModal({ bottles: bottles[0] });
      }
      return;
    }
    
    setShowBottleSelectModal(true);
    setBottleSearchTerm('');
  };

  const handleBottleSelect = (bottle: any) => {
    if (onShowTastingModal) {
      onShowTastingModal({ bottles: bottle });
    }
    setShowBottleSelectModal(false);
  };

  const filteredBottles = bottles.filter(bottle => {
    if (!bottleSearchTerm) return true;
    
    const searchTerm = bottleSearchTerm.toLowerCase();
    const bottleName = bottle.name?.toLowerCase() || '';
    const brandName = (bottle.brands?.name || bottle.custom_brand || '').toLowerCase();
    const vintage = bottle.vintage?.toString() || '';
    const ageYears = bottle.age_years?.toString() || '';
    
    return bottleName.includes(searchTerm) ||
           brandName.includes(searchTerm) ||
           vintage.includes(searchTerm) ||
           ageYears.includes(searchTerm);
  });

  const openBarTastingModal = () => {
    if (onShowTastingModal) {
      onShowTastingModal(null);
    }
  };

  const openEditModal = (tasting: any) => {
    if (onShowTastingModal) {
      onShowTastingModal(tasting);
    }
  };

  const openBottleTastingModal = (bottle: any) => {
    if (onShowTastingModal) {
      onShowTastingModal({ bottles: bottle });
    }
  };

  const handleCardClick = (tasting: any) => {
    if (typeof window !== 'undefined') {
      // 고유한 키 사용
      sessionStorage.setItem('tastingDetailScrollPosition', window.scrollY.toString());
    }
    setSelectedTasting(tasting);
    setShowTastingModal(true);
  };

  const handleEditClick = (tasting: any) => {
    openEditModal(tasting);
  };

  const handleShareClick = (tasting: any) => {
    handleShareTasting(tasting);
  };

  const handleDeleteClick = (tastingId: string) => {
    handleDeleteTasting(tastingId);
  };

  const handleCloseModal = () => {
    setShowTastingModal(false);
    setSelectedTasting(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>시음 기록 로딩중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2>시음 목록 ({filteredTastings.length}개)</h2>
          {isSearchMode && (
            <button
              onClick={resetSearchMode}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6B7280',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              검색 초기화
            </button>
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '6px' : '8px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={openAddModal}
            style={{
              padding: isMobile ? '6px 12px' : '8px 16px',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobile ? '보유 위스키 추가' : '보유 위스키 시음 추가'}
          </button>
          <button
            onClick={openBarTastingModal}
            style={{
              padding: isMobile ? '6px 12px' : '8px 16px',
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobile ? '바/모임 추가' : '바/모임 시음 추가'}
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div style={{ marginBottom: '20px' }}>
        <AdvancedSearch
          brands={[]}
          currentFilters={searchFilters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          searchType="tastings"
        />
      </div>

      {/* 위스키별 시음 버튼 */}
      {bottles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setShowBottleButtons(!showBottleButtons)}
          >
            <h3 style={{ margin: 0 }}>위스키별 시음 ({bottles.length}개)</h3>
            <span style={{ fontSize: '18px', color: '#9CA3AF' }}>
              {showBottleButtons ? '▼' : '▶'}
            </span>
          </div>
          
          {showBottleButtons && (
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '12px',
              backgroundColor: 'rgba(55, 65, 81, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(75, 85, 99, 0.5)'
            }}>
              {bottles.map(bottle => (
                <button
                  key={bottle.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openBottleTastingModal(bottle);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4B5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }}
                >
                  {bottle.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 시음 목록 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 
                              isTablet ? 'repeat(2, 1fr)' : 
                              isTabletLandscape ? 'repeat(3, 1fr)' :
                              'repeat(auto-fill, minmax(380px, 1fr))',
        gap: isMobile ? '16px' : isTablet ? '20px' : '24px',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        {filteredTastings.map((tasting, index) => (
          <TastingCard
            key={tasting.id}
            tasting={tasting}
            index={index}
            onCardClick={handleCardClick}
            onEditClick={handleEditClick}
            onShareClick={handleShareClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* 시음 기록이 없을 때 */}
      {tastings.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#9CA3AF'
        }}>
          <p>시음 기록이 없습니다.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button
              onClick={openAddModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3B82F6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              보유 위스키 시음 추가
            </button>
            <button
              onClick={openBarTastingModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10B981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              바/모임 시음 추가
            </button>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {showTastingModal && selectedTasting && (
        <TastingDetailModal
          selectedTasting={selectedTasting}
          onClose={handleCloseModal}
          onEdit={handleEditClick}
          onShare={handleShareClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* 보틀 선택 모달 */}
      {showBottleSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                시음 기록을 추가할 위스키 선택
              </h3>
              <button
                onClick={() => setShowBottleSelectModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* 검색 입력창 */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="위스키명, 브랜드, 빈티지로 검색..."
                value={bottleSearchTerm}
                onChange={(e) => setBottleSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredBottles.length > 0 ? (
                filteredBottles.map((bottle) => (
                  <button
                    key={bottle.id}
                    onClick={() => handleBottleSelect(bottle)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4B5563';
                      e.currentTarget.style.borderColor = '#60A5FA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.borderColor = '#4B5563';
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {bottle.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                      {bottle.brands?.name || bottle.custom_brand}
                      {bottle.vintage && ` • ${bottle.vintage}`}
                      {bottle.age_years && ` • ${bottle.age_years}년`}
                    </div>
                  </button>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9CA3AF',
                  fontSize: '16px'
                }}>
                  {bottleSearchTerm ? (
                    <>
                      <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
                      <div>검색 결과가 없습니다.</div>
                      <div style={{ fontSize: '14px', marginTop: '8px' }}>
                        다른 검색어를 시도해보세요.
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '20px', marginBottom: '8px' }}>📝</div>
                      <div>위스키를 검색해보세요.</div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowBottleSelectModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6B7280',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 