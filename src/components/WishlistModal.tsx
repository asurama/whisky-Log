'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import UnifiedModal, { ModalButton, ModalInput } from './ui/UnifiedModal';
import { WishlistFormData } from '@/types';

interface WishlistModalProps {
  user: any;
  brands: any[];
  editingItem?: any;
  onClose: () => void;
}

export default function WishlistModal({ user, brands, editingItem, onClose }: WishlistModalProps) {
  const [modalTop, setModalTop] = useState(0);
  
  // 클라이언트 사이드에서 스크롤 위치 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setModalTop(window.scrollY);
    }
  }, []);

  const [formData, setFormData] = useState<WishlistFormData>({
    name: '',
    brand_id: '',
    custom_brand: '',
    vintage: '',
    age_years: '',
    retail_price: '',
    total_volume_ml: '750',
    purchase_location: '',
    priority: '2',
    notes: '',
    abv: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        brand_id: editingItem.brand_id || '',
        custom_brand: editingItem.custom_brand || '',
        vintage: editingItem.vintage?.toString() || '',
        age_years: editingItem.age_years?.toString() || '',
        retail_price: editingItem.retail_price?.toString() || '',
        total_volume_ml: editingItem.total_volume_ml?.toString() || '750',
        purchase_location: editingItem.purchase_location || '',
        priority: editingItem.priority?.toString() || '2',
        notes: editingItem.notes || '',
        abv: editingItem.abv?.toString() || ''
      });
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('위스키 이름을 입력해주세요.');
      return;
    }
    
    if (!formData.brand_id) {
      alert('브랜드를 선택해주세요.');
      return;
    }
    
    try {
      const wishlistData = {
        user_id: user.id,
        name: formData.name,
        brand_id: formData.brand_id || null,
        custom_brand: null,
        vintage: formData.vintage ? parseInt(formData.vintage) : null,
        age_years: formData.age_years ? parseInt(formData.age_years) : null,
        retail_price: formData.retail_price ? parseFloat(formData.retail_price) : null,
        total_volume_ml: formData.total_volume_ml ? parseFloat(formData.total_volume_ml) : null,
        purchase_location: formData.purchase_location || null,
        priority: parseInt(formData.priority),
        notes: formData.notes || null,
        abv: formData.abv || ''
      };
      
      if (editingItem) {
        // 수정
        const { error } = await supabase
          .from('wishlist')
          .update(wishlistData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        alert('위시리스트가 성공적으로 수정되었습니다!');
      } else {
        // 추가
        const { error } = await supabase
          .from('wishlist')
          .insert(wishlistData);
        
        if (error) throw error;
        alert('위시리스트에 성공적으로 추가되었습니다!');
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('위시리스트 저장 오류:', error);
      alert('위시리스트 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <UnifiedModal
      isOpen={true}
      onClose={onClose}
      title={editingItem ? '위시리스트 수정' : '위시리스트 추가'}
      size="md"
      variant="form"
    >

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* 기본 정보 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                위스키명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white'
                }}
                required
              />
            </div>

            {/* 브랜드 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                브랜드 *
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  brand_id: e.target.value,
                  custom_brand: e.target.value === 'custom' ? prev.custom_brand : ''
                }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  marginBottom: formData.brand_id === 'custom' ? '8px' : '0'
                }}
                required
              >
                <option value="">브랜드 선택</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
                <option value="custom">직접 입력</option>
              </select>
              
              {formData.brand_id === 'custom' && (
                <input
                  type="text"
                  placeholder="브랜드명 입력"
                  value={formData.custom_brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_brand: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                  required
                />
              )}
            </div>

            {/* 빈티지 & 숙성연수 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  빈티지
                </label>
                <input
                  type="number"
                  value={formData.vintage}
                  onChange={(e) => setFormData(prev => ({ ...prev, vintage: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  숙성연수
                </label>
                <input
                  type="number"
                  value={formData.age_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, age_years: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* 가격 & 용량 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  시중가 (원)
                </label>
                <input
                  type="number"
                  value={formData.retail_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, retail_price: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  용량 (ml)
                </label>
                <input
                  type="number"
                  value={formData.total_volume_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_volume_ml: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* 구매 예정 장소 & 우선순위 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  구매 예정 장소
                </label>
                <input
                  type="text"
                  value={formData.purchase_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_location: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  우선순위
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                >
                  <option value="1">낮음</option>
                  <option value="2">보통</option>
                  <option value="3">높음</option>
                </select>
              </div>
            </div>

            {/* 도수 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                도수 (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.abv}
                onChange={(e) => setFormData(prev => ({ ...prev, abv: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white'
                }}
              />
            </div>

            {/* 메모 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#3B82F6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {editingItem ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6B7280',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </UnifiedModal>
    );
  } 