'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import { formatTastingForShare, showShareOptions } from '@/utils/shareUtils';
import AdvancedSearch from './search/AdvancedSearch';
import { useDevice } from '@/hooks/useDevice';

interface TastingListProps {
  user: any;
  brands?: any[];
  onShowTastingModal?: (tasting: any) => void;
}

export default function TastingList({ user, brands: propBrands, onShowTastingModal }: TastingListProps) {
  const [tastings, setTastings] = useState<any[]>([]);
  const [bottles, setBottles] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBottleButtons, setShowBottleButtons] = useState(false); // 위스키별 시음 버튼 토글
  const { isMobile, isTablet, isTabletLandscape } = useDevice();
  const [searchFilters, setSearchFilters] = useState<any>({
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
  const [filteredTastings, setFilteredTastings] = useState<any[]>([]);
  const [selectedTasting, setSelectedTasting] = useState<any>(null);
  const [showTastingModal, setShowTastingModal] = useState(false);

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

    // 브랜드 필터링 (시음 기록용) - 브랜드 이름 기반
    if (searchFilters.brandFilter) {
      // 브랜드 ID로 브랜드 이름 찾기
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

  // 검색 모드 초기화
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
      console.log('=== 시음 기록 공유 시작 ===');
      console.log('시음 기록 ID:', tasting.id);
      console.log('시음 기록 데이터:', tasting);
      
      const shareData = formatTastingForShare(tasting);
      console.log('포맷된 공유 데이터:', shareData);
      
      // 공유 데이터 검증
      if (!shareData.text || shareData.text.length < 10) {
        console.warn('공유 텍스트가 너무 짧습니다:', shareData.text);
        alert('공유할 내용이 부족합니다.');
        return;
      }
      
      console.log('공유 옵션 표시 시작');
      showShareOptions(shareData);
      console.log('=== 시음 기록 공유 완료 ===');
    } catch (error) {
      console.error('시음 기록 공유 오류:', error);
      alert('공유 기능을 사용할 수 없습니다. 오류: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  };

  const [showBottleSelectModal, setShowBottleSelectModal] = useState(false);
  const [bottleSearchTerm, setBottleSearchTerm] = useState('');

  const openAddModal = () => {
    // 위스키가 없으면 알림
    if (bottles.length === 0) {
      alert('먼저 위스키를 추가해주세요.');
      return;
    }
    
    // 위스키가 하나뿐이면 자동 선택
    if (bottles.length === 1) {
      if (onShowTastingModal) {
        onShowTastingModal({ bottles: bottles[0] });
      }
      return;
    }
    
    // 위스키가 여러 개면 선택 모달 표시
    setShowBottleSelectModal(true);
    setBottleSearchTerm(''); // 검색어 초기화
  };

  const handleBottleSelect = (bottle: any) => {
    if (onShowTastingModal) {
      onShowTastingModal({ bottles: bottle });
    }
    setShowBottleSelectModal(false);
  };

  // 검색어에 따른 보틀 필터링
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
      onShowTastingModal(null); // bottle 없이 모달 열기
    }
  };

  const openEditModal = (tasting: any) => {
    if (onShowTastingModal) {
      // page.tsx에서 관리하는 모달 사용 (시음 기록 추가/수정용)
      onShowTastingModal(tasting);
    }
  };

  const openBottleTastingModal = (bottle: any) => {
    if (onShowTastingModal) {
      // page.tsx에서 관리하는 모달 사용 (보틀 시음 추가용)
      onShowTastingModal({ bottles: bottle });
    }
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
      <div style={{
        marginBottom: '20px'
      }}>
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
          <div
            key={tasting.id}
            className="fade-in"
            style={{
              animationDelay: `${index * 0.1}s`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#1F2937',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #374151'
            }}
            onClick={() => {
              console.log('시음기록 상세보기 클릭됨:', tasting.id);
              setSelectedTasting(tasting);
              setShowTastingModal(true);
              console.log('showTastingModal 상태 설정됨');
              // 현재 스크롤 위치를 저장 (더 정확한 위치)
              if (typeof window !== 'undefined') {
                const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                sessionStorage.setItem('scrollPosition', scrollPosition.toString());
                console.log('스크롤 위치 저장:', scrollPosition);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
                          {/* 이미지 섹션 */}
              <div style={{
                position: 'relative',
                marginBottom: '20px',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '180px',
                background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
              }}>
                {(tasting.image_url || tasting.bottles?.image_url) ? (
                  <img
                    src={tasting.image_url || tasting.bottles?.image_url}
                    alt={tasting.bottles?.name || '시음 기록'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#6b7280'
                  }}>
                    🍷
                  </div>
                )}
              
              {/* 시음 타입 배지 */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: tasting.tasting_type === 'bar' ? 'rgba(16, 185, 129, 0.9)' : 
                               tasting.tasting_type === 'meeting' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                color: 'white',
                backdropFilter: 'blur(8px)'
              }}>
                {tasting.tasting_type === 'bar' ? '바' : 
                 tasting.tasting_type === 'meeting' ? '모임' : '보틀'}
              </div>
              
              {/* 날짜 배지 */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                backdropFilter: 'blur(8px)'
              }}>
                {new Date(tasting.tasting_date).toLocaleDateString('ko-KR')}
              </div>
            </div>

            {/* 정보 섹션 */}
            <div>
              {/* 제목과 브랜드 */}
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.3'
              }}>
                {tasting.bottles?.name || tasting.bottle_name || '바/모임 시음'}
              </h3>
              
              <p style={{ 
                margin: '0 0 16px 0', 
                color: '#9CA3AF',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {tasting.bottles?.brands?.name || tasting.bottles?.custom_brand || tasting.bottle_brand || ''}
              </p>

              {/* 평점 정보 */}
              <div style={{ 
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(75, 85, 99, 0.3)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px' 
                }}>
                  {tasting.nose_rating && (
                    <div>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>노즈</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                          {tasting.nose_rating}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          gap: '2px' 
                        }}>
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: i < tasting.nose_rating ? '#FBBF24' : '#374151'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tasting.palate_rating && (
                    <div>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>팔레트</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                          {tasting.palate_rating}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          gap: '2px' 
                        }}>
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: i < tasting.palate_rating ? '#FBBF24' : '#374151'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tasting.finish_rating && (
                    <div>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>피니시</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                          {tasting.finish_rating}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          gap: '2px' 
                        }}>
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: i < tasting.finish_rating ? '#FBBF24' : '#374151'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tasting.overall_rating && (
                    <div>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>종합</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <span style={{ color: '#FBBF24', fontSize: '18px', fontWeight: '700' }}>
                          {tasting.overall_rating}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          gap: '2px' 
                        }}>
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: i < Math.round(tasting.overall_rating) ? '#FBBF24' : '#374151'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 메모 정보 */}
              {(tasting.nose_notes || tasting.palate_notes || tasting.finish_notes || tasting.additional_notes) && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '14px',
                    color: '#9CA3AF',
                    fontWeight: '600'
                  }}>
                    시음 노트
                  </h4>
                  <div style={{ 
                    padding: '12px',
                    backgroundColor: 'rgba(17, 24, 39, 0.3)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#D1D5DB'
                  }}>
                    {tasting.nose_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#FBBF24' }}>노즈:</strong> {tasting.nose_notes}
                      </div>
                    )}
                    {tasting.palate_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#FBBF24' }}>팔레트:</strong> {tasting.palate_notes}
                      </div>
                    )}
                    {tasting.finish_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#FBBF24' }}>피니시:</strong> {tasting.finish_notes}
                      </div>
                    )}
                    {tasting.additional_notes && (
                      <div>
                        <strong style={{ color: '#FBBF24' }}>추가:</strong> {tasting.additional_notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEditModal(tasting);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShareTasting(tasting);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#34d399',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  }}
                >
                  📤 공유
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteTasting(tasting.id);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          </div>
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



      {/* 시음기록 확대 모달 */}
      {console.log('모달 렌더링 조건:', { showTastingModal, selectedTasting: !!selectedTasting })}
      {showTastingModal && selectedTasting && (
        <div style={{
          position: 'fixed',
          top: isMobile ? (() => {
            const savedPosition = sessionStorage.getItem('scrollPosition');
            return savedPosition ? `${parseInt(savedPosition)}px` : '0px';
          })() : '0px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999,
          padding: '20px',
          paddingBottom: isMobile ? '80px' : '20px',
          overflowY: 'auto',
          transform: 'translateZ(0)'
        }}>
          <div style={{ color: 'white', fontSize: '24px' }}>
            모달이 나타났습니다! {selectedTasting.id}
          </div>
        </div>
      )}
      {showTastingModal && selectedTasting && (
        <div style={{
          position: 'fixed',
          top: isMobile ? (() => {
            const savedPosition = sessionStorage.getItem('scrollPosition');
            return savedPosition ? `${parseInt(savedPosition)}px` : '0px';
          })() : '0px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999,
          padding: '20px',
          paddingBottom: isMobile ? '80px' : '20px',
          overflowY: 'auto',
          transform: 'translateZ(0)'
        }}>
          {/* 기존 카드를 그대로 확대해서 보여주기 */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            transform: 'scale(1.05)',
            transformOrigin: 'center center',
            marginTop: 'auto',
            marginBottom: 'auto',
            // PC에서 더 자연스러운 모달 표시
            transition: 'transform 0.3s ease'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                setShowTastingModal(false);
                setSelectedTasting(null);
                // 저장된 스크롤 위치로 복원
                const savedPosition = sessionStorage.getItem('scrollPosition');
                if (savedPosition) {
                  window.scrollTo(0, parseInt(savedPosition));
                  sessionStorage.removeItem('scrollPosition');
                }
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999999999,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              ×
            </button>

            {/* 기존 카드 내용을 그대로 복사 */}
            <div
              className="card hover-lift fade-in"
              style={{
                cursor: 'default',
                transform: 'none',
                boxShadow: 'none'
              }}
            >
              {/* 이미지 섹션 */}
              <div style={{
                position: 'relative',
                marginBottom: '20px',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '180px',
                background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
              }}>
                {(selectedTasting.image_url || selectedTasting.bottles?.image_url) ? (
                  <img
                    src={selectedTasting.image_url || selectedTasting.bottles?.image_url}
                    alt={selectedTasting.bottles?.name || '시음 기록'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#6b7280'
                  }}>
                    🍷
                  </div>
                )}
                
                {/* 시음 타입 배지 */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: selectedTasting.tasting_type === 'bar' ? 'rgba(16, 185, 129, 0.9)' : 
                                 selectedTasting.tasting_type === 'meeting' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}>
                  {selectedTasting.tasting_type === 'bar' ? '바' : 
                   selectedTasting.tasting_type === 'meeting' ? '모임' : '보틀'}
                </div>
                
                {/* 날짜 배지 */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}>
                  {new Date(selectedTasting.tasting_date).toLocaleDateString('ko-KR')}
                </div>
              </div>

              {/* 정보 섹션 */}
              <div>
                {/* 제목과 브랜드 */}
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  lineHeight: '1.3'
                }}>
                  {selectedTasting.bottles?.name || selectedTasting.bottle_name || '바/모임 시음'}
                </h3>
                
                <p style={{ 
                  margin: '0 0 16px 0', 
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {selectedTasting.bottles?.brands?.name || selectedTasting.bottles?.custom_brand || selectedTasting.bottle_brand || ''}
                </p>

                {/* 평점 정보 */}
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid rgba(75, 85, 99, 0.3)'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '12px' 
                  }}>
                    {selectedTasting.nose_rating && (
                      <div>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>노즈</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                            {selectedTasting.nose_rating}
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px' 
                          }}>
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: i < selectedTasting.nose_rating ? '#FBBF24' : '#374151'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTasting.palate_rating && (
                      <div>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>팔레트</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                            {selectedTasting.palate_rating}
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px' 
                          }}>
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: i < selectedTasting.palate_rating ? '#FBBF24' : '#374151'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTasting.finish_rating && (
                      <div>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>피니시</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                            {selectedTasting.finish_rating}
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px' 
                          }}>
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: i < selectedTasting.finish_rating ? '#FBBF24' : '#374151'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTasting.overall_rating && (
                      <div>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>종합</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: '#FBBF24', fontSize: '18px', fontWeight: '700' }}>
                            {selectedTasting.overall_rating}
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px' 
                          }}>
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: i < Math.round(selectedTasting.overall_rating) ? '#FBBF24' : '#374151'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 메모 정보 */}
                {(selectedTasting.nose_notes || selectedTasting.palate_notes || selectedTasting.finish_notes || selectedTasting.additional_notes) && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '14px',
                      color: '#9CA3AF',
                      fontWeight: '600'
                    }}>
                      시음 노트
                    </h4>
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: 'rgba(17, 24, 39, 0.3)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: '#D1D5DB'
                    }}>
                      {selectedTasting.nose_notes && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#FBBF24' }}>노즈:</strong> {selectedTasting.nose_notes}
                        </div>
                      )}
                      {selectedTasting.palate_notes && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#FBBF24' }}>팔레트:</strong> {selectedTasting.palate_notes}
                        </div>
                      )}
                      {selectedTasting.finish_notes && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#FBBF24' }}>피니시:</strong> {selectedTasting.finish_notes}
                        </div>
                      )}
                      {selectedTasting.additional_notes && (
                        <div>
                          <strong style={{ color: '#FBBF24' }}>추가:</strong> {selectedTasting.additional_notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  position: 'relative',
                  zIndex: 10
                }}>
                                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEditModal(selectedTasting);
                    setShowTastingModal(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  ✏️ 수정
                </button>
                                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShareTasting(selectedTasting);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#34d399',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  }}
                >
                  📤 공유
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteTasting(selectedTasting.id);
                    setShowTastingModal(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  🗑️ 삭제
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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