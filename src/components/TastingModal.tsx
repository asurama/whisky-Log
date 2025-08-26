'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fileToBase64, validateImageFile, compressImage, uploadImageToSupabase } from '@/utils/imageUtils';
import ResponsiveImageUpload from './ui/ResponsiveImageUpload';

import { User, Bottle, Tasting, TastingFormData } from '@/types';

interface TastingModalProps {
  user: User;
  bottle?: Bottle | null;
  editingTasting?: Tasting | null;
  onClose: () => void;
  onTastingAdded: () => void;
}

export default function TastingModal({ user, bottle, editingTasting, onClose, onTastingAdded }: TastingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TastingFormData>({
    bottle_name: bottle?.name || '',
    tasting_type: bottle ? 'bottle' : 'bar',
    tasting_date: new Date().toISOString().split('T')[0],
    tasting_time: new Date().toTimeString().slice(0, 5),
    location: '',
    consumed_volume_ml: '',
    nose_rating: '',
    palate_rating: '',
    finish_rating: '',
    overall_rating: '',
    nose_notes: '',
    palate_notes: '',
    finish_notes: '',
    additional_notes: '',
    companions: '',
    image_url: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (editingTasting) {
      setFormData({
        bottle_name: editingTasting.bottles?.name || editingTasting.bottle_name || '',
        tasting_type: editingTasting.tasting_type || 'bottle',
        tasting_date: editingTasting.tasting_date || new Date().toISOString().split('T')[0],
        tasting_time: editingTasting.tasting_time || new Date().toTimeString().slice(0, 5),
        location: editingTasting.location || '',
        consumed_volume_ml: editingTasting.consumed_volume_ml?.toString() || '',
        nose_rating: editingTasting.nose_rating?.toString() || '',
        palate_rating: editingTasting.palate_rating?.toString() || '',
        finish_rating: editingTasting.finish_rating?.toString() || '',
        overall_rating: editingTasting.overall_rating?.toString() || '',
        nose_notes: editingTasting.nose_notes || '',
        palate_notes: editingTasting.palate_notes || '',
        finish_notes: editingTasting.finish_notes || '',
        additional_notes: editingTasting.additional_notes || '',
        companions: editingTasting.companions || '',
        image_url: editingTasting.image_url || ''
      });
      
      if (editingTasting.image_url) {
        setImagePreview(editingTasting.image_url || '');
      }
    }
  }, [editingTasting]);

  // 보틀 용량 업데이트 함수
  const updateBottleVolume = async (bottleId: string, newConsumedVolume: number, oldConsumedVolume?: number) => {
    try {
      const { data: bottleData, error: bottleError } = await supabase
        .from('bottles')
        .select('remaining_volume_ml, total_volume_ml')
        .eq('id', bottleId)
        .single();

      if (bottleError) throw bottleError;

      let newRemainingVolume = bottleData.remaining_volume_ml;

      if (editingTasting && oldConsumedVolume) {
        newRemainingVolume = newRemainingVolume + oldConsumedVolume - newConsumedVolume;
      } else {
        newRemainingVolume = newRemainingVolume - newConsumedVolume;
      }

      newRemainingVolume = Math.max(0, newRemainingVolume);

      const { error: updateError } = await supabase
        .from('bottles')
        .update({ 
          remaining_volume_ml: newRemainingVolume,
          bottle_status: newRemainingVolume === 0 ? 'empty' : 'opened'
        })
        .eq('id', bottleId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('보틀 용량 업데이트 오류:', error);
    }
  };

  const handleImageSelect = async (file: File) => {
    try {
      if (!validateImageFile(file)) {
        alert('유효한 이미지 파일을 선택해주세요. (JPG, PNG, GIF, 최대 5MB)');
        return;
      }

      let processedFile = file;
      try {
        processedFile = await compressImage(file, 800, 600, 0.8);
      } catch (compressError) {
        processedFile = file;
      }

      setSelectedImage(processedFile);

      try {
        const base64 = await fileToBase64(processedFile);
        setImagePreview(base64 || '');
      } catch (previewError) {
        alert('이미지 미리보기를 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  const handleImageDelete = async () => {
    if (!confirm('정말로 이 이미지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (formData.image_url && formData.image_url.startsWith('http')) {
        const { deleteImageFromSupabase } = await import('@/utils/imageUtils');
        await deleteImageFromSupabase(formData.image_url);
      }

      setSelectedImage(null);
      setImagePreview('');
      setFormData(prev => ({
        ...prev,
        image_url: ''
      }));
    } catch (error) {
      console.error('이미지 삭제 오류:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('시음 기록 추가 시작...');
      console.log('사용자 ID:', user.id);
      console.log('보틀 정보:', bottle);
      
      let finalImageUrl = formData.image_url;

      if (selectedImage) {
        console.log('이미지 업로드 시작...');
        const uploadedUrl = await uploadImageToSupabase(selectedImage, 'tastings');
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log('이미지 업로드 완료:', uploadedUrl);
        }
      }

      const tastingData = {
        user_id: user.id,
        bottle_id: bottle?.id || null,
        bottle_name: formData.bottle_name,
        tasting_type: formData.tasting_type,
        tasting_date: formData.tasting_date,
        tasting_time: formData.tasting_time,
        location: formData.location,
        consumed_volume_ml: formData.consumed_volume_ml ? parseFloat(formData.consumed_volume_ml) : null,
        nose_rating: formData.nose_rating ? parseInt(formData.nose_rating) : null,
        palate_rating: formData.palate_rating ? parseInt(formData.palate_rating) : null,
        finish_rating: formData.finish_rating ? parseInt(formData.finish_rating) : null,
        overall_rating: formData.overall_rating ? parseFloat(parseFloat(formData.overall_rating).toFixed(1)) : null,
        nose_notes: formData.nose_notes,
        palate_notes: formData.palate_notes,
        finish_notes: formData.finish_notes,
        companions: formData.companions,
        additional_notes: formData.additional_notes,
        image_url: finalImageUrl
      };

      console.log('저장할 시음 데이터:', tastingData);

      if (editingTasting) {
        const { error } = await supabase
          .from('tastings')
          .update(tastingData)
          .eq('id', editingTasting.id);

        if (error) throw error;
        
        if (bottle?.id && formData.consumed_volume_ml) {
          await updateBottleVolume(bottle.id, parseFloat(formData.consumed_volume_ml), editingTasting.consumed_volume_ml);
        }
        
        alert('시음 기록이 수정되었습니다!');
      } else {
        console.log('데이터베이스에 시음 기록 삽입 시작...');
        const { data, error } = await supabase
          .from('tastings')
          .insert(tastingData)
          .select();

        if (error) {
          console.error('시음 기록 삽입 오류:', error);
          console.error('오류 상세 정보:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('시음 기록 삽입 성공:', data);
        
        if (bottle?.id && formData.consumed_volume_ml) {
          console.log('보틀 용량 업데이트 시작...');
          await updateBottleVolume(bottle.id, parseFloat(formData.consumed_volume_ml));
        }
        
        alert('시음 기록이 추가되었습니다!');
      }

      if (onTastingAdded) {
        onTastingAdded();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('시음 기록 처리 오류:', error);
      alert(editingTasting ? '시음 기록 수정 중 오류가 발생했습니다.' : '시음 기록 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black bg-opacity-80 flex items-center justify-center p-4 overflow-y-auto" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl overflow-y-auto shadow-2xl" style={{
        maxHeight: 'calc(100vh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        margin: 'auto'
      }}>
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800 z-10 pb-3 border-b border-gray-700" style={{
          paddingTop: '4px',
          marginTop: '-4px'
        }}>
          <h2 className="text-xl font-semibold text-white m-0">
            {editingTasting ? '시음 기록 수정' : '시음 기록 추가'}
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
            {/* 위스키 정보 (보유 위스키인 경우에만 표시) */}
            {bottle && bottle.name && (
              <div style={{ padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'white' }}>{bottle.name}</h3>
                <p style={{ margin: '0', color: '#9CA3AF', fontSize: '14px' }}>
                  {bottle.brands?.name || bottle.custom_brand || '알 수 없는 브랜드'}
                </p>
              </div>
            )}

            {/* 시음 타입 선택 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                시음 타입
              </label>
              <select
                value={formData.tasting_type}
                onChange={(e) => handleInputChange('tasting_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px'
                }}
              >
                <option value="bottle">구매한 보틀</option>
                <option value="bar">바</option>
                <option value="event">행사/모임</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* 시음 날짜 & 시간 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  시음 날짜
                </label>
                <input
                  type="date"
                  value={formData.tasting_date}
                  onChange={(e) => handleInputChange('tasting_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  시음 시간
                </label>
                <input
                  type="time"
                  value={formData.tasting_time}
                  onChange={(e) => handleInputChange('tasting_time', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* 장소 & 소비량 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  장소
                </label>
                <input
                  type="text"
                  placeholder="바 이름, 집, 행사장 등"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  소비량 (ml)
                </label>
                <input
                  type="number"
                  placeholder="예: 30"
                  value={formData.consumed_volume_ml}
                  onChange={(e) => handleInputChange('consumed_volume_ml', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* 평점 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  코 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  value={formData.nose_rating}
                  onChange={(e) => handleInputChange('nose_rating', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  입 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  value={formData.palate_rating}
                  onChange={(e) => handleInputChange('palate_rating', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  피니시 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  value={formData.finish_rating}
                  onChange={(e) => handleInputChange('finish_rating', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* 종합 평점 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                종합 평점 (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                placeholder="1.0-10.0"
                value={formData.overall_rating}
                onChange={(e) => handleInputChange('overall_rating', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 코 노트 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                코 노트
              </label>
              <textarea
                placeholder="향, 아로마, 코에서 느껴지는 향기..."
                value={formData.nose_notes}
                onChange={(e) => handleInputChange('nose_notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 입 노트 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                입 노트
              </label>
              <textarea
                placeholder="맛, 질감, 입에서 느껴지는 풍미..."
                value={formData.palate_notes}
                onChange={(e) => handleInputChange('palate_notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 피니시 노트 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                피니시 노트
              </label>
              <textarea
                placeholder="여운, 지속성, 마시고 난 후의 느낌..."
                value={formData.finish_notes}
                onChange={(e) => handleInputChange('finish_notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 동반자 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                동반자
              </label>
              <input
                type="text"
                placeholder="친구, 가족, 동료 등"
                value={formData.companions}
                onChange={(e) => handleInputChange('companions', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 추가 노트 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                추가 노트
              </label>
              <textarea
                placeholder="기타 특별한 느낌이나 기억을 적어주세요..."
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  resize: 'vertical',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                이미지
              </label>
              <ResponsiveImageUpload
                onImageSelect={handleImageSelect}
                onImageEdit={handleImageSelect}
                onImageDelete={handleImageDelete}
                currentImage={imagePreview || formData.image_url}
                disabled={loading}
              />
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
              paddingBottom: '16px'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (onClose) {
                    onClose();
                  }
                }}
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
                  fontWeight: '600'
                }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="mobile-button"
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {loading ? '저장중...' : (editingTasting ? '수정' : '저장')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 