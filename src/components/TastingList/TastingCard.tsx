import React from 'react';
import { useDevice } from '@/hooks/useDevice';
import { Tasting, TastingCardProps } from '@/types/tasting';
import { cardStyles, buttonStyles } from '@/styles/common';

export default function TastingCard({
  tasting,
  index,
  onCardClick,
  onEditClick,
  onShareClick,
  onDeleteClick
}: TastingCardProps) {
  const { isMobile } = useDevice();

  return (
    <div
      className="fade-in"
      style={{
        ...cardStyles.container,
        animationDelay: `${index * 0.1}s`
      }}
      onClick={() => onCardClick(tasting)}
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
                          backgroundColor: i < (tasting.nose_rating || 0) ? '#FBBF24' : '#374151'
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
                          backgroundColor: i < (tasting.palate_rating || 0) ? '#FBBF24' : '#374151'
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
                          backgroundColor: i < (tasting.finish_rating || 0) ? '#FBBF24' : '#374151'
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
                          backgroundColor: i < Math.round(tasting.overall_rating || 0) ? '#FBBF24' : '#374151'
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
              onEditClick(tasting);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            style={buttonStyles.editButton}
          >
            ✏️ 수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onShareClick(tasting);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
            style={buttonStyles.success}
          >
            📤 공유
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteClick(tasting.id);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            style={buttonStyles.danger}
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
} 