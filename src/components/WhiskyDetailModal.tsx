'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 터치 효과가 있는 버튼 컴포넌트
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

function TouchButton({ children, onClick, style = {}, disabled = false }: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleTouchEnd = () => {
    if (!disabled) {
      setIsPressed(false);
      onClick?.();
    }
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled) {
      setIsPressed(false);
      onClick?.();
    }
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      style={{
        ...style,
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isPressed ? 0.8 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface WhiskyDetailModalProps {
  bottle: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (bottle: any) => void;
  onAddTasting?: (bottle: any) => void;
}

interface Tasting {
  id: string;
  tasting_date: string;
  rating: number;
  notes: string;
  nose: string;
  palate: string;
  finish: string;
  created_at: string;
  nose_rating?: number;
  palate_rating?: number;
  finish_rating?: number;
  overall_rating?: number;
  nose_notes?: string;
  palate_notes?: string;
  finish_notes?: string;
  additional_notes?: string;
  location?: string;
  consumed_volume_ml?: number;
  companions?: string;
  image_url?: string;
}

export default function WhiskyDetailModal({ 
  bottle, 
  isOpen, 
  onClose, 
  onEdit, 
  onAddTasting 
}: WhiskyDetailModalProps) {
  const [tastings, setTastings] = useState<Tasting[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'tastings'>('details');

  useEffect(() => {
    if (isOpen && bottle?.id) {
      fetchTastings();
    }
  }, [isOpen, bottle?.id]);

  const fetchTastings = async () => {
    if (!bottle?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tastings')
        .select('*')
        .eq('bottle_id', bottle.id)
        .order('tasting_date', { ascending: false });

      if (error) throw error;
      setTastings(data || []);
    } catch (error) {
      console.error('시음기록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '날짜 없음';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '날짜 오류';
    }
  };

  const formatRating = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return '평점 없음';
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) return '평점 오류';
    
    return `${numRating}/10`;
  };

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      '스페이사이드': '#10B981',
      '하이랜드': '#3B82F6',
      '이슬레이': '#8B5CF6',
      '캠벨타운': '#F59E0B',
      '로우랜드': '#EF4444',
      '켄터키': '#DC2626',
      '테네시': '#7C3AED',
      '일본': '#059669'
    };
    
    for (const [key, color] of Object.entries(colors)) {
      if (region?.includes(key)) return color;
    }
    return '#6B7280';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return '#10B981'; // 초록색
    if (rating >= 7) return '#3B82F6'; // 파란색
    if (rating >= 5) return '#F59E0B'; // 주황색
    return '#EF4444'; // 빨간색
  };

  // 평균 평점 계산
  const calculateAverageRating = () => {
    if (tastings.length === 0) return null;
    
    const validRatings = tastings
      .map((t: any) => t.overall_rating || t.rating)
      .filter((r: any) => r !== null && r !== undefined && !isNaN(Number(r)));
    
    if (validRatings.length === 0) return null;
    
    const sum = validRatings.reduce((acc: number, rating: any) => acc + Number(rating), 0);
    return Math.round((sum / validRatings.length) * 10) / 10; // 소수점 첫째자리까지
  };

  const averageRating = calculateAverageRating();

  if (!isOpen || !bottle) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        backgroundColor: '#1F2937',
        border: '1px solid #374151',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        minHeight: '60vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        marginTop: 'env(safe-area-inset-top)',
        marginBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 20px 0 20px',
          borderBottom: '1px solid #374151',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1F2937',
          zIndex: 100,
          paddingTop: 'calc(20px + env(safe-area-inset-top))'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1, marginRight: '12px' }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2',
                wordBreak: 'break-word'
              }}>
                {bottle.name}
              </h2>
              {(bottle.brands?.name || bottle.custom_brand) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: getRegionColor(bottle.brands?.region || bottle.brands?.country || bottle.region),
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {bottle.brands?.name || bottle.custom_brand}
                  </span>
                  {(bottle.brands?.region || bottle.region) && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#374151',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#9CA3AF'
                    }}>
                      {bottle.brands?.region || bottle.region}
                    </span>
                  )}
                </div>
              )}
            </div>
            <TouchButton
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '28px',
                padding: '8px',
                borderRadius: '6px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              ×
            </TouchButton>
          </div>

          {/* 탭 네비게이션 */}
          <div style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '0'
          }}>
            <TouchButton
              onClick={() => setActiveTab('details')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'details' ? '#3B82F6' : 'transparent',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                color: activeTab === 'details' ? 'white' : '#9CA3AF',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              📋 상세정보
            </TouchButton>
            <TouchButton
              onClick={() => setActiveTab('tastings')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'tastings' ? '#3B82F6' : 'transparent',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                color: activeTab === 'tastings' ? 'white' : '#9CA3AF',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              🍷 시음기록 ({tastings.length})
            </TouchButton>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {activeTab === 'details' ? (
            <div>
              {/* 이미지 (가운데 정렬) */}
              {bottle.image_url && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '24px',
                  minHeight: '200px'
                }}>
                  <img
                    src={bottle.image_url}
                    alt={bottle.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </div>
              )}

              {/* 현재 남은량 (상단 강조) */}
              {bottle.current_level !== undefined && bottle.current_level !== null && (
                <div style={{
                  backgroundColor: '#1E293B',
                  border: '2px solid #374151',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
                    📊 현재 남은량
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: bottle.current_level > 50 ? '#10B981' : 
                            bottle.current_level > 20 ? '#F59E0B' : '#EF4444',
                    marginBottom: '12px'
                  }}>
                    {bottle.current_level}%
                  </div>
                  {/* 진행바 표시 */}
                  <div style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: '#374151',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${bottle.current_level}%`,
                      height: '100%',
                      backgroundColor: bottle.current_level > 50 ? '#10B981' : 
                                      bottle.current_level > 20 ? '#F59E0B' : '#EF4444',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280', 
                    marginTop: '8px' 
                  }}>
                    {bottle.current_level > 80 ? '거의 가득함' :
                     bottle.current_level > 50 ? '절반 이상' :
                     bottle.current_level > 20 ? '부족함' : '거의 비어있음'}
                  </div>
                </div>
              )}

              {/* 평균 평점 (시음이 있는 경우) */}
              {averageRating !== null && (
                <div style={{
                  backgroundColor: '#1E293B',
                  border: '2px solid #374151',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
                    ⭐ 평균 평점 ({tastings.length}회 시음)
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: getRatingColor(averageRating),
                    marginBottom: '8px'
                  }}>
                    {averageRating}/10
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280'
                  }}>
                    {averageRating >= 9 ? '매우 우수' :
                     averageRating >= 7 ? '우수' :
                     averageRating >= 5 ? '보통' : '개선 필요'}
                  </div>
                </div>
              )}

              {/* 정보 섹션들 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. 브랜드 정보 섹션 */}
                {(bottle.brands?.name || bottle.brands?.country || bottle.brands?.region || bottle.brands?.description || bottle.custom_brand) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      🏷️ 브랜드 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {/* 브랜드명 */}
                      {(bottle.brands?.name || bottle.custom_brand) && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>브랜드명</div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: 'white',
                            padding: '8px 12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563'
                          }}>
                            {bottle.brands?.name || bottle.custom_brand}
                          </div>
                        </div>
                      )}
                      
                      {/* 국가 */}
                      {(bottle.brands?.country || bottle.country) && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>국가</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'white',
                            padding: '8px 12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            🌍 {bottle.brands?.country || bottle.country}
                          </div>
                        </div>
                      )}
                      
                      {/* 지역 */}
                      {(bottle.brands?.region || bottle.region) && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>지역</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'white',
                            padding: '8px 12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            🏔️ {bottle.brands?.region || bottle.region}
                          </div>
                        </div>
                      )}
                      
                      {/* 브랜드 설명 */}
                      {(bottle.brands?.description) && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>브랜드 설명</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#D1D5DB',
                            padding: '12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {bottle.brands.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. 기본 정보 섹션 */}
                {(bottle.type || bottle.abv || bottle.description) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      🥃 기본 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.type && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>타입</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'white',
                            padding: '8px 12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563'
                          }}>
                            {bottle.type}
                          </div>
                        </div>
                      )}
                      {bottle.abv && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>알코올 도수</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'white',
                            padding: '8px 12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            🍾 {bottle.abv}%
                          </div>
                        </div>
                      )}
                      {bottle.description && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>상세 설명</div>
                          <div style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: '1.5' }}>
                            {bottle.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. 연도 정보 섹션 */}
                {(bottle.vintage || bottle.age_years || bottle.bottled_year) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      📅 연도 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.vintage && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>빈티지</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🍇 {bottle.vintage}년
                          </div>
                        </div>
                      )}
                      {bottle.age_years && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>숙성 연수</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            ⏰ {bottle.age_years}년
                          </div>
                        </div>
                      )}
                      {bottle.bottled_year && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>병입년도</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            📅 {bottle.bottled_year}년
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. 제조 정보 섹션 */}
                {(bottle.distillery || bottle.bottler || bottle.cask_type || bottle.cask_number || bottle.bottle_count) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      🏭 제조 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.distillery && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>증류소</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🏭 {bottle.distillery}
                          </div>
                        </div>
                      )}
                      {bottle.bottler && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>병입업체</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🏢 {bottle.bottler}
                          </div>
                        </div>
                      )}
                      {bottle.cask_type && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>캐스크 타입</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🛢️ {bottle.cask_type}
                          </div>
                        </div>
                      )}
                      {bottle.cask_number && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>캐스크 번호</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🔢 {bottle.cask_number}
                          </div>
                        </div>
                      )}
                      {bottle.bottle_count && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>병 수량</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            📦 {bottle.bottle_count}병
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. 평점 정보 섹션 */}
                {bottle.whiskybase_rating && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      ⭐ 평점 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.whiskybase_rating && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Whiskybase 평점</div>
                          <div style={{ fontSize: '16px', color: '#F59E0B', fontWeight: '600' }}>
                            ⭐ {bottle.whiskybase_rating}/10
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. 태그 섹션 */}
                {bottle.tags && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      🏷️ 태그
                    </div>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {bottle.tags.split(',').map((tag: string, index: number) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          backgroundColor: '#374151',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#9CA3AF'
                        }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 가격 정보 섹션 */}
                {(bottle.retail_price || bottle.purchase_price || bottle.discount_rate) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      💰 가격 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.retail_price && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>시중가</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                            💰 {bottle.retail_price.toLocaleString()}원
                          </div>
                        </div>
                      )}
                      {bottle.purchase_price && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>구매가</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>
                            💳 {bottle.purchase_price.toLocaleString()}원
                          </div>
                        </div>
                      )}
                      {bottle.discount_rate && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>할인율</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#F59E0B' }}>
                            📉 {bottle.discount_rate}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. 구매 정보 섹션 */}
                {(bottle.purchase_location || bottle.purchase_date || bottle.bottle_status) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      📍 구매 정보
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      {bottle.purchase_location && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>구매장소</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🏪 {bottle.purchase_location}
                          </div>
                        </div>
                      )}
                      {bottle.purchase_date && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>구매일</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            📅 {formatDate(bottle.purchase_date)}
                          </div>
                        </div>
                      )}
                      {bottle.bottle_status && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>병상태</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>
                            🍾 {bottle.bottle_status === 'opened' ? '오픈' : 
                               bottle.bottle_status === 'unopened' ? '미오픈' : 
                               bottle.bottle_status === 'low' ? '부족' : 
                               bottle.bottle_status === 'empty' ? '빈병' : '미지정'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. 용량 정보 섹션 */}
                {(bottle.total_volume_ml || bottle.remaining_volume_ml) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    📊 용량 정보
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    {bottle.total_volume_ml && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>총 용량</div>
                        <div style={{ fontSize: '14px', color: 'white' }}>
                          🍾 {bottle.total_volume_ml}ml
                        </div>
                      </div>
                    )}
                    {bottle.remaining_volume_ml && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>남은 용량</div>
                        <div style={{ fontSize: '14px', color: 'white' }}>
                          📊 {bottle.remaining_volume_ml}ml
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>등록일</div>
                      <div style={{ fontSize: '14px', color: 'white' }}>
                        📅 {formatDate(bottle.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* 8. 링크 정보 섹션 */}
                {bottle.whiskybase_url && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      🔗 링크 정보
                    </div>
                    <div>
                      <a
                        href={bottle.whiskybase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                      >
                        🔗 Whiskybase에서 보기
                      </a>
                    </div>
                  </div>
                )}

                {/* 9. Whiskybase 노트 섹션 */}
                {(bottle.nose_notes || bottle.palate_notes || bottle.finish_notes) && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      👃 Whiskybase 노트
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {bottle.nose_notes && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>코 노트</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#D1D5DB',
                            padding: '12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            👃 {bottle.nose_notes}
                          </div>
                        </div>
                      )}
                      {bottle.palate_notes && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>입맛 노트</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#D1D5DB',
                            padding: '12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            👅 {bottle.palate_notes}
                          </div>
                        </div>
                      )}
                      {bottle.finish_notes && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>피니시 노트</div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#D1D5DB',
                            padding: '12px',
                            backgroundColor: '#374151',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            🔥 {bottle.finish_notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 10. 메모 섹션 */}
                {bottle.notes && (
                  <div style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      📝 메모
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#D1D5DB',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {bottle.notes}
                    </div>
                  </div>
                )}
              </div>



              {/* 액션 버튼 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px'
              }}>
                {onEdit && (
                  <TouchButton
                    onClick={() => onEdit(bottle)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      backgroundColor: '#3B82F6',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    ✏️ 수정
                  </TouchButton>
                )}
                {onAddTasting && (
                  <TouchButton
                    onClick={() => onAddTasting(bottle)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      backgroundColor: '#10B981',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    🍷 시음기록 추가
                  </TouchButton>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* 시음기록 헤더 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  시음기록 ({tastings.length}개)
                </h3>
                {onAddTasting && (
                  <TouchButton
                    onClick={() => onAddTasting(bottle)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10B981',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    + 시음기록 추가
                  </TouchButton>
                )}
              </div>

              {/* 시음기록 목록 */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  시음기록을 불러오는 중...
                </div>
              ) : tastings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  아직 시음기록이 없습니다.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {tastings.map((tasting) => (
                    <div
                      key={tasting.id}
                      className="tasting-card" // mobile-card 대신 tasting-card 사용
                      style={{
                        backgroundColor: '#374151',
                        border: '1px solid #4B5563',
                        borderRadius: '12px',
                        padding: '16px',
                        transform: 'scale(1)', // 고정 크기
                        transition: 'none', // 애니메이션 제거
                        cursor: 'default', // 커서 기본값
                        userSelect: 'none', // 텍스트 선택 방지
                        WebkitUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent' // 터치 하이라이트 제거
                      }}
                    >
                      {/* 날짜 */}
                      <div style={{
                        fontSize: '12px',
                        color: '#9CA3AF',
                        marginBottom: '8px'
                      }}>
                        {formatDate(tasting.tasting_date)}
                      </div>

                      {/* 위치 */}
                      {tasting.location && (
                        <div style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          marginBottom: '8px'
                        }}>
                          📍 {tasting.location}
                        </div>
                      )}

                      {/* 평점 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: getRatingColor(tasting.overall_rating || tasting.rating)
                        }}>
                          ⭐ {formatRating(tasting.overall_rating || tasting.rating)}
                        </span>
                        {(tasting.nose_rating || tasting.palate_rating || tasting.finish_rating) && (
                          <div style={{ display: 'flex', gap: '4px', fontSize: '12px' }}>
                            {tasting.nose_rating && (
                              <span style={{ color: '#9CA3AF' }}>👃 {tasting.nose_rating}</span>
                            )}
                            {tasting.palate_rating && (
                              <span style={{ color: '#9CA3AF' }}>👅 {tasting.palate_rating}</span>
                            )}
                            {tasting.finish_rating && (
                              <span style={{ color: '#9CA3AF' }}>🔥 {tasting.finish_rating}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 노트 */}
                      {(tasting.nose_notes || tasting.palate_notes || tasting.finish_notes || tasting.additional_notes) && (
                        <div style={{ marginBottom: '12px' }}>
                          {tasting.nose_notes && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                              👃 코: {tasting.nose_notes}
                            </div>
                          )}
                          {tasting.palate_notes && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                              👅 입: {tasting.palate_notes}
                            </div>
                          )}
                          {tasting.finish_notes && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                              🔥 피니시: {tasting.finish_notes}
                            </div>
                          )}
                          {tasting.additional_notes && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                              📝 추가: {tasting.additional_notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 소비량 */}
                      {tasting.consumed_volume_ml && (
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          marginBottom: '8px'
                        }}>
                          🍷 소비량: {tasting.consumed_volume_ml}ml
                        </div>
                      )}

                      {/* 동반자 */}
                      {tasting.companions && (
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280'
                        }}>
                          👥 동반자: {tasting.companions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 