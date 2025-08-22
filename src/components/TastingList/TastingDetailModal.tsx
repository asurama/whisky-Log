import React, { useState, useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';
import { TastingDetailModalProps } from '@/types/tasting';

export default function TastingDetailModal({
  selectedTasting,
  onClose,
  onEdit,
  onShare,
  onDelete
}: TastingDetailModalProps) {
  const { isMobile } = useDevice();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // 모달이 열릴 때 현재 스크롤 위치를 가져옴 (고유한 키 사용)
    const savedScroll = sessionStorage.getItem('tastingDetailScrollPosition');
    if (savedScroll) {
      setScrollPosition(parseInt(savedScroll, 10));
    }
  }, []);

  const getModalPosition = () => {
    if (!isMobile) {
      return {
        top: 0,
        bottom: 0
      };
    }

    return {
      top: `${scrollPosition}px`,
      bottom: `calc(100vh - ${scrollPosition}px)`
    };
  };

  const position = getModalPosition();

  return (
    <div style={{
      position: 'fixed',
      top: position.top,
      left: 0,
      right: 0,
      bottom: position.bottom,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000, // 더 안전한 z-index
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
        transition: 'transform 0.3s ease'
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
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
            zIndex: 10001, // 모달보다 높은 z-index
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
                              backgroundColor: i < (selectedTasting.nose_rating || 0) ? '#FBBF24' : '#374151'
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
                              backgroundColor: i < (selectedTasting.palate_rating || 0) ? '#FBBF24' : '#374151'
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
                              backgroundColor: i < (selectedTasting.finish_rating || 0) ? '#FBBF24' : '#374151'
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
                              backgroundColor: i < (selectedTasting.overall_rating || 0) ? '#FBBF24' : '#374151'
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
                  onEdit(selectedTasting);
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
                  onShare(selectedTasting);
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
                  onDelete(selectedTasting.id);
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
  );
} 