'use client';

import { useState } from 'react';
import { useToast } from '../Toast';
import ImageOptimizer from '../ImageOptimizer';
import { useDevice } from '@/hooks/useDevice';

interface WhiskyCardProps {
  bottle: any;
  onEdit: (bottle: any) => void;
  onDelete: (id: string) => void;
  onAddTasting: (bottle: any) => void;
  onViewTastings: (bottle: any) => void;
  onImageChange: (bottle: any) => void;
  onClick?: () => void;
}

export default function WhiskyCard({ 
  bottle, 
  onEdit, 
  onDelete, 
  onAddTasting, 
  onViewTastings, 
  onImageChange,
  onClick
}: WhiskyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { showToast } = useToast();
  const { isMobile, isTablet } = useDevice();

  const handleDelete = async () => {
    if (confirm('정말로 이 위스키를 삭제하시겠습니까?')) {
      try {
        onDelete(bottle.id);
        showToast('위스키가 삭제되었습니다.', 'success');
      } catch (error) {
        showToast('삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const getStatusBadge = () => {
    if (bottle.bottle_status === 'empty') {
      return <span style={{ backgroundColor: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>빈병</span>;
    } else if (bottle.bottle_status === 'low') {
      return <span style={{ backgroundColor: '#F59E0B', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>부족</span>;
    } else if (bottle.bottle_status === 'opened') {
      return <span style={{ backgroundColor: '#10B981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>오픈</span>;
    } else if (bottle.bottle_status === 'unopened') {
      return <span style={{ backgroundColor: '#6B7280', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>미오픈</span>;
    }
    return null;
  };

  return (
    <div
      className="mobile-card"
      style={{
        backgroundColor: '#1F2937',
        borderRadius: '12px',
        padding: isMobile ? '16px' : isTablet ? '18px' : '20px',
        border: '1px solid #374151',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 25px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        touchAction: 'pan-y', // 세로 스크롤만 허용
        minHeight: bottle.image_url ? 'auto' : '280px', // 이미지가 없을 때 최소 높이 설정
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 상태 배지는 이미지 위에 오버레이로 표시됨 */}

      {/* 이미지 영역 */}
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <div
          style={{
            width: '100%',
            height: isMobile ? '160px' : isTablet ? '170px' : '180px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={(e) => {
            e.stopPropagation();
            // 이미지 클릭 시 상세보기로 변경
            if (onClick) {
              onClick();
            }
          }}
        >
          {bottle.image_url ? (
            <>
              <ImageOptimizer
                src={bottle.image_url}
                alt={bottle.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#374151'
                }}
              />
              
              {/* 상태 배지 오버레이 */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                backdropFilter: 'blur(8px)'
              }}>
                {bottle.bottle_status === 'empty' ? '빈병' :
                 bottle.bottle_status === 'low' ? '부족' :
                 bottle.bottle_status === 'opened' ? '오픈' :
                 bottle.bottle_status === 'unopened' ? '미오픈' : '상태'}
              </div>
            </>
          ) : (
            <>
              {/* 이미지 없을 때 플레이스홀더 */}
              <div style={{
                fontSize: '48px',
                color: '#6B7280',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🥃</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>이미지 없음</span>
              </div>
              
              {/* 상태 배지 오버레이 */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                backdropFilter: 'blur(8px)'
              }}>
                {bottle.bottle_status === 'empty' ? '빈병' :
                 bottle.bottle_status === 'low' ? '부족' :
                 bottle.bottle_status === 'opened' ? '오픈' :
                 bottle.bottle_status === 'unopened' ? '미오픈' : '상태'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 정보 */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '4px',
          lineHeight: '1.3'
        }}>
          {bottle.name}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#9CA3AF',
          marginBottom: '4px'
        }}>
          {bottle.brands?.name || bottle.custom_brand}
        </p>
        
        {/* 용량 정보 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <span className="tag tag-info" style={{
            fontSize: '12px',
            color: '#9CA3AF',
            backgroundColor: '#374151',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {bottle.remaining_volume_ml}ml / {bottle.total_volume_ml}ml
          </span>
          {bottle.abv && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {bottle.abv}%
            </span>
          )}
        </div>

        {/* 추가 정보 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {bottle.age_years && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {bottle.age_years}년
            </span>
          )}
          {bottle.vintage && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {bottle.vintage}년 빈티지
            </span>
          )}
          {bottle.bottled_year && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {bottle.bottled_year}년 병입
            </span>
          )}
          {bottle.cask_type && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {bottle.cask_type}
            </span>
          )}
          {bottle.retail_price && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF',
              backgroundColor: '#374151',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              ₩{Number(bottle.retail_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* 버튼들 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="mobile-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(bottle);
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
            fontWeight: '500'
          }}
        >
          ✏️ 수정
        </button>
        
        <button
          type="button"
          className="mobile-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddTasting(bottle);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#10B981',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          🍷 시음 추가
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          type="button"
          className="mobile-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewTastings(bottle);
          }}
          disabled={!bottle.tasting_count || bottle.tasting_count === 0}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: bottle.tasting_count && bottle.tasting_count > 0 ? '#8B5CF6' : '#6B7280',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: bottle.tasting_count && bottle.tasting_count > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500',
            opacity: bottle.tasting_count && bottle.tasting_count > 0 ? 1 : 0.6
          }}
        >
          📊 기록 보기 ({bottle.tasting_count || 0})
        </button>
        
        <button
          type="button"
          className="mobile-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            width: '44px',
            height: '36px',
            padding: '0',
            backgroundColor: '#EF4444',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
} 