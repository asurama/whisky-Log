'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import WishlistModal from './WishlistModal';

interface WishlistProps {
  user: any;
  brands?: any[];
}

export default function Wishlist({ user, brands: propBrands }: WishlistProps) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
      if (propBrands) {
        setBrands(propBrands);
      } else {
        fetchBrands();
      }
    }
  }, [user, propBrands]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          brands(name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'wishlist')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error('위시리스트 로딩 오류:', error);
    } finally {
      setLoading(false);
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

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('정말로 이 항목을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      fetchWishlist();
      alert('위시리스트에서 삭제되었습니다!');
    } catch (error) {
      console.error('위시리스트 삭제 오류:', error);
      alert('위시리스트 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleMoveToBottles = async (item: any) => {
    if (!confirm('이 위스키를 구매 완료로 처리하시겠습니까?')) return;
    
    try {
      // 위시리스트 아이템을 bottles 테이블로 이동
      const bottleData = {
        user_id: user.id,
        name: item.name,
        brand_id: item.brand_id,
        custom_brand: item.custom_brand,
        vintage: item.vintage,
        age_years: item.age_years,
        retail_price: item.retail_price,
        purchase_price: null, // 구매가격은 나중에 수정
        purchase_location: item.purchase_location,
        purchase_date: null, // 구매일은 나중에 수정
        total_volume_ml: item.total_volume_ml,
        remaining_volume_ml: item.total_volume_ml,
        bottle_status: 'unopened',
        notes: item.notes,
        abv: item.abv
      };
      
      const { error: bottleError } = await supabase
        .from('bottles')
        .insert(bottleData);
      
      if (bottleError) throw bottleError;
      
      // 위시리스트에서 삭제
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', item.id);
      
      if (deleteError) throw deleteError;
      
      fetchWishlist();
      alert('구매 완료! 위스키 컬렉션에 추가되었습니다.');
    } catch (error) {
      console.error('구매 완료 처리 오류:', error);
      alert('구매 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingItem(null);
    fetchWishlist();
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return '낮음';
      case 2: return '보통';
      case 3: return '높음';
      default: return '보통';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#6B7280';
      case 2: return '#F59E0B';
      case 3: return '#EF4444';
      default: return '#F59E0B';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>위시리스트 로딩중...</p>
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
        <h2>위시리스트 ({wishlist.length}개)</h2>
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
          위시리스트 추가
        </button>
      </div>

      {/* 위시리스트 목록 */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {wishlist.map(item => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#1F2937',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #374151'
            }}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                  {item.name}
                </h3>
                <p style={{ margin: '0 0 8px 0', color: '#9CA3AF' }}>
                  {item.brands?.name || item.custom_brand}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.vintage && (
                    <span style={{
                      backgroundColor: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {item.vintage}
                    </span>
                  )}
                  {item.age_years && (
                    <span style={{
                      backgroundColor: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {item.age_years}년
                    </span>
                  )}
                  <span style={{
                    backgroundColor: getPriorityColor(item.priority),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {getPriorityLabel(item.priority)}
                  </span>
                </div>
              </div>
              
              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleMoveToBottles(item)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  구매완료
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3B82F6',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 정보 */}
            <div style={{ marginBottom: '16px' }}>
              {item.retail_price && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  시중가: {item.retail_price.toLocaleString()}원
                </p>
              )}
              {item.total_volume_ml && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  용량: {item.total_volume_ml}ml
                </p>
              )}
              {item.purchase_location && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  구매 예정 장소: {item.purchase_location}
                </p>
              )}
              {item.abv && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  도수: {item.abv}%
                </p>
              )}
            </div>

            {/* 메모 */}
            {item.notes && (
              <div>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>메모:</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{item.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 위시리스트가 없을 때 */}
      {wishlist.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#9CA3AF'
        }}>
          <p>위시리스트가 비어있습니다.</p>
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
            첫 번째 위시리스트 추가하기
          </button>
        </div>
      )}

      {/* 모달 */}
      {showAddModal && (
        <WishlistModal
          user={user}
          brands={brands}
          editingItem={editingItem}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
} 