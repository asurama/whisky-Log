'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { validateWhiskyData } from '@/utils/dataValidation';
import { fileToBase64, validateImageFile, compressImage, uploadImageToSupabase } from '@/utils/imageUtils';
import ResponsiveImageUpload from './ui/ResponsiveImageUpload';
import WhiskybaseSearch from './WhiskybaseSearch';

import { User, Brand, Bottle, BottleFormData } from '@/types';
import { logError, getUserFriendlyMessage } from '@/utils/errorHandler';

interface WhiskyModalProps {
  user: User;
  brands: Brand[];
  editingBottle?: Bottle | null;
  onClose: () => void;
  onBottleSaved?: () => void;
}

export default function WhiskyModal({ user, brands, editingBottle, onClose, onBottleSaved }: WhiskyModalProps) {
  const [formData, setFormData] = useState<BottleFormData>({
    name: '',
    brand_id: '',
    custom_brand: '',
    vintage: '',
    age_years: '',
    retail_price: '',
    purchase_price: '',
    discount_rate: '',
    purchase_location: '',
    purchase_date: '',
    total_volume_ml: '750',
    remaining_volume_ml: '750',
    notes: '',
    abv: '',
    type: 'Single Malt',
    whiskybase_rating: '',
    cask_type: '',
    bottled_year: '',
    description: '',
    whiskybase_url: ''
  });



  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [showWhiskybaseSearch, setShowWhiskybaseSearch] = useState(false);

  useEffect(() => {
    if (editingBottle) {
      // 브랜드 자동 선택 로직
      let selectedBrandId = editingBottle.brand_id || '';
      
      setFormData({
        name: editingBottle.name || '',
        brand_id: selectedBrandId,
        custom_brand: editingBottle.custom_brand || '',
        vintage: editingBottle.vintage?.toString() || '',
        age_years: editingBottle.age_years?.toString() || '',
        retail_price: editingBottle.retail_price?.toString() || '',
        purchase_price: editingBottle.purchase_price?.toString() || '',
        discount_rate: editingBottle.discount_rate?.toString() || '',
        purchase_location: editingBottle.purchase_location || '',
        purchase_date: editingBottle.purchase_date || '',
        total_volume_ml: editingBottle.total_volume_ml?.toString() || '750',
        remaining_volume_ml: editingBottle.remaining_volume_ml?.toString() || '750',
        notes: editingBottle.notes || '',
        abv: editingBottle.abv?.toString() || '',
        type: editingBottle.type || 'Single Malt',
        whiskybase_rating: editingBottle.whiskybase_rating?.toString() || '',
        cask_type: editingBottle.cask_type || '',
        bottled_year: editingBottle.bottled_year?.toString() || '',
        description: editingBottle.description || '',
        whiskybase_url: editingBottle.whiskybase_url || ''
      });
      setCurrentImageUrl(editingBottle.image_url || null);
    }
  }, [editingBottle, brands]);

  // 할인율 자동 계산
  useEffect(() => {
    if (formData.retail_price && formData.purchase_price) {
      const retail = parseFloat(formData.retail_price);
      const purchase = parseFloat(formData.purchase_price);
      if (retail > 0 && purchase > 0) {
        const discount = ((retail - purchase) / retail) * 100;
        setFormData(prev => ({
          ...prev,
          discount_rate: discount.toFixed(2)
        }));
      }
    }
  }, [formData.retail_price, formData.purchase_price]);

  const handleWhiskybaseSelect = (whisky: any) => {
    console.log('🔍 Whiskybase 선택 디버그 - 원본 데이터:', whisky);
    
    // ABV 값에서 % 제거하고 숫자만 추출
    const cleanAbv = whisky.abv ? whisky.abv.replace('%', '').trim() : '';
    
    // 브랜드 매칭: Whiskybase 브랜드명과 기존 브랜드 목록에서 매칭
    const matchedBrand = brands?.find(brand => 
      brand.name.toLowerCase() === whisky.brand.toLowerCase()
    );
    
    console.log('🔍 브랜드 매칭 결과:', {
      whiskyBrand: whisky.brand,
      matchedBrand: matchedBrand ? matchedBrand.name : '매칭 없음',
      matchedBrandId: matchedBrand?.id || '없음'
    });
    
    const newFormData = {
      name: whisky.name,
      brand_id: matchedBrand?.id || '',  // 매칭된 브랜드 ID 설정
      custom_brand: matchedBrand ? '' : whisky.brand,  // 매칭되지 않으면 custom_brand에
      age_years: whisky.age || '',
      abv: cleanAbv,
      type: whisky.type || 'Single Malt',
      whiskybase_rating: whisky.rating || '',
      cask_type: whisky.cask_type || '',
      bottled_year: whisky.bottled_year || '',
      description: whisky.description || '',
      whiskybase_url: whisky.url || '',
      notes: `${whisky.type || ''} ${whisky.region || ''} ${whisky.rating ? `평점: ${whisky.rating}` : ''}`.trim()
    };
    
    console.log('🔍 처리된 폼 데이터:', newFormData);
    
    setFormData(prev => ({
      ...prev,
      ...newFormData
    }));
    setShowWhiskybaseSearch(false);
  };

  const handleImageChange = async (file: File) => {
    if (file) {
      console.log('위스키 이미지 선택:', file.name, file.size, file.type);
      
      // 파일 검증
      if (!validateImageFile(file)) {
        alert('이미지 파일만 업로드 가능하며, 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      try {
        // 이미지 압축
        const compressedFile = await compressImage(file, 800, 600, 0.8);
        setImageFile(compressedFile);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string || '');
        };
        reader.readAsDataURL(compressedFile);
        
        console.log('위스키 이미지 처리 완료');
      } catch (error) {
        console.error('이미지 처리 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 편집된 이미지 처리 함수 추가
  const handleImageEdit = async (editedFile: File) => {
    console.log('=== 위스키 이미지 편집 처리 시작 ===');
    console.log('편집된 파일:', {
      name: editedFile.name,
      size: editedFile.size,
      type: editedFile.type
    });

    try {
      // 편집된 이미지를 압축 (카드 표시용으로 적절한 크기)
      const compressedFile = await compressImage(editedFile, 400, 300, 0.85);
      console.log('✅ 이미지 압축 완료:', compressedFile.size, 'bytes');
      
      // 상태 업데이트
      setImageFile(compressedFile);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setImagePreview(previewUrl || '');
        console.log('✅ 미리보기 생성 완료, 길이:', previewUrl.length);
      };
      reader.readAsDataURL(compressedFile);
      
      // 기존 이미지 URL 초기화 (새로 업로드할 예정)
      setCurrentImageUrl(null);
      
      console.log('✅ 위스키 이미지 편집 처리 완료 - 모달 유지됨');
      
      // 폼 제출 방지 - 이미지 편집만 완료하고 모달은 유지
      return;
    } catch (error) {
      console.error('❌ 위스키 이미지 편집 처리 오류:', error);
      alert('편집된 이미지 처리 중 오류가 발생했습니다.');
    }
  };



  // 이미지 삭제 함수 추가
  const handleImageDelete = async () => {
    console.log('=== 위스키 이미지 삭제 시작 ===');
    
    if (!confirm('이미지를 삭제하시겠습니까?')) {
      console.log('삭제 취소됨');
      return;
    }

    try {
      // Supabase Storage에서 기존 이미지 삭제
      if (currentImageUrl && currentImageUrl.includes('supabase.co')) {
        const imagePath = currentImageUrl.split('/').pop();
        if (imagePath) {
          const { error } = await supabase.storage
            .from('whisky-bottles')
            .remove([imagePath]);
          
          if (error) {
            console.error('Supabase Storage 삭제 오류:', error);
          } else {
            console.log('✅ Supabase Storage에서 이미지 삭제 완료');
          }
        }
      }

      // 상태 초기화
      setImageFile(null);
      setImagePreview('');
      setCurrentImageUrl(null);
      
      console.log('✅ 위스키 이미지 삭제 완료 - 상태 초기화됨');
    } catch (error) {
      console.error('❌ 위스키 이미지 삭제 오류:', error);
      alert('이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    // 새 이미지가 선택되지 않았으면 기존 이미지 URL 반환
    if (!imageFile) {
      console.log('새 이미지가 없어서 기존 이미지 URL 사용:', currentImageUrl);
      return currentImageUrl;
    }
    
    try {
      console.log('위스키 이미지 업로드 시작:', imageFile.name);
      
      // Supabase Storage에 업로드
      const imageUrl = await uploadImageToSupabase(imageFile, 'whisky-bottles');
      console.log('위스키 이미지 업로드 성공:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(`이미지 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n위스키는 저장됩니다.`);
      return currentImageUrl;
    }
  };

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
    

    
    setUploading(true);
    
    try {
      // 이미지 업로드 (새 이미지가 있는 경우에만)
      let imageUrl = currentImageUrl;
      if (imageFile) {
        console.log('새 이미지 업로드 시작...');
        imageUrl = await uploadImage();
        console.log('이미지 업로드 완료:', imageUrl);
      }
      
      const bottleData = validateWhiskyData({
        user_id: user.id,
        name: formData.name,
        brand_id: formData.brand_id || null,
        custom_brand: null,
        vintage: formData.vintage,
        age_years: formData.age_years,
        retail_price: formData.retail_price,
        purchase_price: formData.purchase_price,
        discount_rate: formData.discount_rate,
        purchase_location: formData.purchase_location,
        purchase_date: formData.purchase_date,
        total_volume_ml: formData.total_volume_ml,
        remaining_volume_ml: formData.remaining_volume_ml,
        notes: formData.notes,
        image_url: imageUrl,
        abv: formData.abv
      });
      
      if (editingBottle) {
        // 수정
        const { error } = await supabase
          .from('bottles')
          .update(bottleData)
          .eq('id', editingBottle.id);
        
        if (error) throw error;
        
        alert('위스키가 성공적으로 수정되었습니다!');
      } else {
        // 추가
        const { error } = await supabase
          .from('bottles')
          .insert(bottleData);
        
        if (error) throw error;
        alert('위스키가 성공적으로 추가되었습니다!');
      }
      
      // 목록 새로고침 및 모달 닫기
      if (onBottleSaved) {
        onBottleSaved();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      logError(error, 'WhiskyModal');
      alert(getUserFriendlyMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-black bg-opacity-80 flex items-start justify-center p-4 pb-20 overflow-y-auto" style={{
      paddingTop: 'calc(1rem + env(safe-area-inset-top))',
      paddingBottom: 'calc(1rem + 72px + env(safe-area-inset-bottom))',
      width: '100%',
      height: '100%'
    }}>
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl overflow-y-auto relative my-auto shadow-2xl" style={{
        maxHeight: 'calc(100vh - 2rem - 72px - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      }}>
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800 z-10 pb-3 border-b border-gray-700" style={{
          paddingTop: '4px',
          marginTop: '-4px'
        }}>
          <h2 className="text-xl font-semibold text-white m-0">
            {editingBottle ? '위스키 수정' : '위스키 추가'}
          </h2>
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold transition-colors duration-200"
            style={{
              width: '36px',
              height: '36px',
              fontSize: '18px',
              backgroundColor: 'rgba(75, 85, 99, 0.8)',
              position: 'relative',
              zIndex: 20
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mobile-form">
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* 기본 정보 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>
                  위스키명 *
                </label>
                <button
                  type="button"
                  onClick={() => setShowWhiskybaseSearch(!showWhiskybaseSearch)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  🔍 Whiskybase 검색
                </button>
              </div>
              
              {showWhiskybaseSearch && (
                <div style={{ marginBottom: '12px' }}>
                  <WhiskybaseSearch 
                    onSelectWhisky={handleWhiskybaseSelect}
                    disabled={uploading}
                    initialSearchTerm={formData.custom_brand || (formData.brand_id ? brands.find(b => b.id === formData.brand_id)?.name : '')}
                  />
                </div>
              )}
              
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px',
                }}
                required
              />
            </div>

            {/* 브랜드 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                브랜드 *
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  brand_id: e.target.value,
                  custom_brand: ''
                }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px',
                }}
                required
              >
                <option value="">브랜드 선택</option>
                {brands?.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              
              {brands?.length === 0 && (
                <div style={{
                  marginTop: '8px',
                    padding: '12px',
                  backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  fontSize: '14px',
                  color: '#9CA3AF'
                }}>
                  브랜드가 없습니다. <strong>데이터 관리 → 브랜드 관리</strong>에서 브랜드를 추가해주세요.
                </div>
              )}
            </div>

            {/* 빈티지 & 숙성연수 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  빈티지
                </label>
                <input
                  type="number"
                  value={formData.vintage}
                  onChange={(e) => setFormData(prev => ({ ...prev, vintage: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  숙성연수
                </label>
                <input
                  type="number"
                  value={formData.age_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, age_years: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            {/* 위스키 타입 & Whiskybase 평점 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  위스키 타입
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                >
                  <option value="Single Malt">Single Malt</option>
                  <option value="Blended">Blended</option>
                  <option value="Pure Malt">Pure Malt</option>
                  <option value="Single Grain">Single Grain</option>
                  <option value="Blended Malt">Blended Malt</option>
                  <option value="Blended Grain">Blended Grain</option>
                  <option value="Bourbon">Bourbon</option>
                  <option value="Rye">Rye</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Whiskybase 평점
                </label>
                <input
                  type="text"
                  value={formData.whiskybase_rating ? `${formData.whiskybase_rating}/10` : ''}
                  readOnly
                  placeholder="Whiskybase 검색으로 자동 입력"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#1F2937',
                    color: '#9CA3AF',
                    fontSize: '16px',
                    cursor: 'not-allowed'
                  }}
                />
                {formData.whiskybase_rating && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#6B7280' }}>
                    Whiskybase 검색으로 자동 입력됨
                  </div>
                )}
              </div>
            </div>

            {/* 캐스크 타입 & 병입년도 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  캐스크 타입
                </label>
                <input
                  type="text"
                  placeholder="예: Sherry Oak, Bourbon, Port"
                  value={formData.cask_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, cask_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  병입년도
                </label>
                <input
                  type="number"
                  placeholder="예: 2020"
                  value={formData.bottled_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, bottled_year: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            {/* 가격 정보 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  시중가 (원)
                </label>
                <input
                  type="number"
                  value={formData.retail_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, retail_price: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  구매가 (원)
                </label>
                <input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            {/* 할인율 */}
            {formData.discount_rate && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  할인율 (%)
                </label>
                <input
                  type="number"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            )}

            {/* 구매 정보 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  구매장소
                </label>
                <input
                  type="text"
                  value={formData.purchase_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_location: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  구매일
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            {/* 용량 정보 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  총 용량 (ml)
                </label>
                <input
                  type="number"
                  value={formData.total_volume_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_volume_ml: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  남은 용량 (ml)
                </label>
                <input
                  type="number"
                  value={formData.remaining_volume_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, remaining_volume_ml: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            {/* 도수 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                도수 (%)
              </label>
              <input
                type="text"
                placeholder="예: 40 또는 43.5"
                value={formData.abv}
                onChange={(e) => {
                  // 숫자와 소수점만 허용
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setFormData(prev => ({ ...prev, abv: value }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px',
                }}
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                이미지
              </label>
              <ResponsiveImageUpload
                onImageSelect={handleImageChange}
                onImageEdit={handleImageEdit}
                onImageDelete={handleImageDelete}
                currentImage={imagePreview || currentImageUrl}
                disabled={uploading}
              />
            </div>

            {/* 메모 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px',
                }}
              />
            </div>

            {/* 상세 설명 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                상세 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="위스키에 대한 상세한 설명을 입력하세요..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px',
                }}
              />
            </div>

            {/* Whiskybase URL */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Whiskybase URL
              </label>
              <input
                type="url"
                value={formData.whiskybase_url}
                onChange={(e) => setFormData(prev => ({ ...prev, whiskybase_url: e.target.value }))}
                placeholder="https://www.whiskybase.com/..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px',
                }}
              />
              {formData.whiskybase_url && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={formData.whiskybase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#60A5FA',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🔗 Whiskybase에서 보기
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 - 하단에 고정 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #374151',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#1F2937',
            zIndex: 10,
            paddingBottom: '16px', // 추가 하단 여백
          }}>
            <button
              type="submit"
              disabled={uploading}
              className="mobile-button"
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#3B82F6',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {uploading ? '저장중...' : (editingBottle ? '수정' : '추가')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mobile-button"
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#6B7280',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 