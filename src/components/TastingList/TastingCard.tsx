'use client';

import { useState } from 'react';
import { useToast } from '../Toast';

interface TastingCardProps {
  tasting: any;
  onEdit: (tasting: any) => void;
  onDelete: (id: string) => void;
}

export default function TastingCard({ tasting, onEdit, onDelete }: TastingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (confirm('정말로 이 시음 기록을 삭제하시겠습니까?')) {
      try {
        onDelete(tasting.id);
        showToast('시음 기록이 삭제되었습니다.', 'success');
      } catch (error) {
        showToast('삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const getTastingTypeLabel = () => {
    switch (tasting.tasting_type) {
      case 'bottle':
        return '보틀 시음';
      case 'bar':
        return '바 시음';
      case 'meeting':
        return '모임 시음';
      default:
        return '기타';
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div
      className="mobile-card"
      style={{
        backgroundColor: '#1F2937',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #374151',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 25px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 시음 유형 배지 */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          backgroundColor: tasting.tasting_type === 'bottle' ? '#10B981' : '#3B82F6',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {getTastingTypeLabel()}
        </span>
      </div>

      {/* 위스키 정보 */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '4px',
          lineHeight: '1.3'
        }}>
          {tasting.bottle_name || tasting.bottles?.name || '알 수 없는 위스키'}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#9CA3AF',
          marginBottom: '4px'
        }}>
          {tasting.bottle_brand || tasting.bottles?.brands?.name || tasting.bottles?.custom_brand || '알 수 없는 브랜드'}
        </p>
      </div>

      {/* 시음 정보 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {tasting.tasting_date && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              📅 {new Date(tasting.tasting_date).toLocaleDateString()}
            </span>
          )}
          {tasting.volume_ml && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              🍷 {tasting.volume_ml}ml
            </span>
          )}
          {tasting.rating && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {getRatingStars(tasting.rating)}
            </span>
          )}
        </div>

        {/* 추가 정보 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tasting.location && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              📍 {tasting.location}
            </span>
          )}
          {tasting.price && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              ₩{Number(tasting.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* 메모 */}
      {tasting.notes && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{
            fontSize: '14px',
            color: '#D1D5DB',
            lineHeight: '1.4',
            fontStyle: 'italic'
          }}>
            "{tasting.notes}"
          </p>
        </div>
      )}

      {/* 버튼들 */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        marginTop: 'auto',
        justifyContent: 'space-between'
      }}>
        <button
          type="button"
          className="mobile-button"
          onClick={() => {
            // 현재 스크롤 위치를 저장
            sessionStorage.setItem('tastingScrollPosition', window.scrollY.toString());
            onEdit(tasting);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#3B82F6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            minWidth: '0'
          }}
        >
          ✏️ 수정
        </button>
        
        <button
          type="button"
          className="mobile-button"
          onClick={handleDelete}
          style={{
            padding: '8px 12px',
            backgroundColor: '#EF4444',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            minWidth: '0'
          }}
        >
          🗑️ 삭제
        </button>
      </div>
    </div>
  );
} 