'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { useDevice } from '@/hooks/useDevice';
import UnifiedModal, { ModalButton, ModalInput } from './ui/UnifiedModal';
import { BrandFormData } from '@/types';

interface Brand {
  id: string;
  name: string;
  country?: string;
  region?: string;
  description?: string;
  user_id?: string | null;
  created_at: string;
  updated_at?: string;
}

interface BrandManagerProps {
  user: any;
  onBrandsUpdate?: (updatedBrand?: any, deletedBrandId?: string) => void;
  brands?: any[];
}

export default function BrandManager({ user, onBrandsUpdate, brands: externalBrands }: BrandManagerProps) {
  const [localBrands, setLocalBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useDevice();
  
  // 로컬 상태의 브랜드 데이터 사용 (외부 데이터는 로컬로 복사됨)
  const brands = localBrands;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    country: '',
    region: '',
    description: ''
  });

  // 커스텀 입력 모드 상태
  const [showCustomCountry, setShowCustomCountry] = useState(false);
  const [showCustomRegion, setShowCustomRegion] = useState(false);

  // 국가 및 지역 옵션
  const countries = [
    '스코틀랜드', '아일랜드', '미국', '캐나다', '일본', '인도', '대만', '호주', '프랑스', '독일', '스웨덴', '네덜란드', '기타'
  ];

  const regions = {
    '스코틀랜드': [
      '스페이사이드 (Speyside)',
      '하이랜드 (Highland)',
      '아일라 (Islay)',
      '캠벨타운 (Campbeltown)',
      '로우랜드 (Lowland)',
      '아일랜드 (Islands)',
      '기타'
    ],
    '일본': [
      '홋카이도 (Hokkaido)',
      '혼슈 (Honshu)',
      '시코쿠 (Shikoku)',
      '큐슈 (Kyushu)',
      '기타'
    ],
    '미국': [
      '켄터키 (Kentucky)',
      '테네시 (Tennessee)',
      '인디애나 (Indiana)',
      '기타'
    ],
    '아일랜드': [
      '코크 (Cork)',
      '더블린 (Dublin)',
      '기타'
    ],
    '캐나다': [
      '앨버타 (Alberta)',
      '온타리오 (Ontario)',
      '기타'
    ],
    '인도': [
      '고아 (Goa)',
      '기타'
    ],
    '대만': [
      '난터우 (Nantou)',
      '기타'
    ],
    '호주': [
      '태즈메이니아 (Tasmania)',
      '기타'
    ],
    '프랑스': [
      '코냑 (Cognac)',
      '아르마냑 (Armagnac)',
      '기타'
    ],
    '독일': [
      '바이에른 (Bavaria)',
      '기타'
    ],
    '스웨덴': [
      '스톡홀름 (Stockholm)',
      '기타'
    ],
    '네덜란드': [
      '기타'
    ],
    '기타': [
      '기타'
    ]
  };



  useEffect(() => {
    if (user && !externalBrands) {
      fetchBrands();
    } else if (externalBrands) {
      // 외부 브랜드 데이터를 로컬 상태로 복사
      setLocalBrands(externalBrands);
      setLoading(false);
    }
  }, [user, externalBrands]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setLocalBrands(data || []);
    } catch (error) {
      console.error('브랜드 로딩 오류:', error);
      showToast('브랜드 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('브랜드 수정 시작:', { editingBrand, formData, externalBrands });
    
    if (!formData.name.trim()) {
      showToast('브랜드명을 입력해주세요.', 'error');
      return;
    }

    try {
      if (editingBrand) {
        // 수정
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name.trim(),
            country: formData.country.trim() || null,
            region: formData.region.trim() || null,
            description: formData.description.trim() || null
          })
          .eq('id', editingBrand.id);
        
        if (error) throw error;
        showToast('브랜드가 성공적으로 수정되었습니다!', 'success');
        
        // 로컬 상태 즉시 업데이트 (수정된 브랜드 정보로)
        const updatedBrand = {
          ...editingBrand,
          name: formData.name.trim(),
          country: formData.country.trim() || null,
          region: formData.region.trim() || null,
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString()
        };
        
        console.log('브랜드 수정 완료:', updatedBrand);
        
        // 로컬 상태 즉시 업데이트 (즉시 UI 반영)
        console.log('로컬 상태 업데이트 실행');
        setLocalBrands(prev => 
          prev.map(brand => 
            brand.id === editingBrand.id ? updatedBrand as Brand : brand
          )
        );
        
        // 부모 컴포넌트의 상태를 직접 업데이트
        if (onBrandsUpdate) {
          console.log('부모에게 수정된 브랜드 정보 전달');
          onBrandsUpdate(updatedBrand);
        }
      } else {
        // 추가 - 중복 체크 먼저 수행
        const trimmedName = formData.name.trim();
        
        // 같은 이름의 브랜드가 이미 존재하는지 확인 (대소문자 구분 없이)
        const { data: existingBrands, error: checkError } = await supabase
          .from('brands')
          .select('id, name')
          .ilike('name', trimmedName);
        
        if (checkError) throw checkError;
        
        if (existingBrands && existingBrands.length > 0) {
          const existingName = existingBrands[0].name;
          showToast(`"${existingName}" 브랜드가 이미 존재합니다. 다른 이름을 사용해주세요.`, 'error');
          return;
        }
        
        // 중복이 없으면 추가
        const { data, error } = await supabase
          .from('brands')
          .insert({
            name: trimmedName,
            country: formData.country.trim() || null,
            region: formData.region.trim() || null,
            description: formData.description.trim() || null
          })
          .select()
          .single();
        
        if (error) throw error;
        showToast('브랜드가 성공적으로 추가되었습니다!', 'success');
        
                  // 로컬 상태 즉시 업데이트 (새로 추가된 브랜드 정보로)
          if (data) {
            const newBrand = {
              ...data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as Brand;
            
            console.log('브랜드 추가 완료:', newBrand);
            
            // 로컬 상태 즉시 업데이트 (즉시 UI 반영)
            console.log('로컬 상태에 새 브랜드 추가 실행');
            setLocalBrands((prev: any[]) => [...prev, newBrand]);
          
          // 부모 컴포넌트의 상태를 직접 업데이트
          if (onBrandsUpdate) {
            console.log('부모에게 새 브랜드 정보 전달');
            onBrandsUpdate(newBrand);
          }
        }
      }
      
      handleModalClose();
    } catch (error) {
      console.error('브랜드 저장 오류:', error);
      
      // 더 구체적인 오류 메시지 제공
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') {
          showToast('같은 이름의 브랜드가 이미 존재합니다. 다른 이름을 사용해주세요.', 'error');
        } else {
          showToast('브랜드 저장 중 오류가 발생했습니다.', 'error');
        }
      } else {
      showToast('브랜드 저장 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    // 사용자가 생성한 브랜드인지 확인 (user_id가 현재 사용자와 일치하는지)
    const brand = brands.find(b => b.id === brandId);
    if (brand && brand.user_id && brand.user_id !== user.id) {
      showToast('다른 사용자가 생성한 브랜드는 삭제할 수 없습니다.', 'error');
      return;
    }
    
    if (!confirm(`정말로 "${brandName}" 브랜드를 삭제하시겠습니까?\n\n⚠️ 주의: 이 브랜드를 사용하는 위스키들이 있다면 영향을 받을 수 있습니다.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);
      
      if (error) throw error;
      
      // 로컬 상태 즉시 업데이트 (즉시 UI 반영)
      console.log('로컬 상태에서 브랜드 삭제 실행');
              setLocalBrands((prev: any[]) => prev.filter((brand: any) => brand.id !== brandId));
      
      // 부모 컴포넌트의 상태를 직접 업데이트
      if (onBrandsUpdate) {
        console.log('부모에게 삭제된 브랜드 ID 전달');
        onBrandsUpdate(undefined, brandId);
      }
      
      showToast('브랜드가 성공적으로 삭제되었습니다!', 'success');
    } catch (error) {
      console.error('브랜드 삭제 오류:', error);
      showToast('브랜드 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const openEditModal = (brand: Brand) => {
    // 사용자가 생성한 브랜드인지 확인 (user_id가 현재 사용자와 일치하는지)
    if (brand.user_id && brand.user_id !== user.id) {
      showToast('다른 사용자가 생성한 브랜드는 수정할 수 없습니다.', 'error');
      return;
    }
    
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      country: brand.country || '',
      region: brand.region || '',
      description: brand.description || ''
    });
    
    // 기존 값이 미리 정의된 옵션에 없는 경우 직접 입력 모드로 설정
    setShowCustomCountry(brand.country ? !countries.includes(brand.country) : false);
    setShowCustomRegion(brand.region ? !regions[brand.country as keyof typeof regions]?.includes(brand.region) : false);
    
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      country: '',
      region: '',
      description: ''
    });
    setShowCustomCountry(false);
    setShowCustomRegion(false);
  };

  const filteredBrands = brands.filter((brand: any) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.country && brand.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (brand.region && brand.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          브랜드 목록을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
          총 {brands.length}개 브랜드
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          브랜드 추가
        </button>
      </div>

      {/* 검색 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="브랜드명, 국가, 지역으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #374151',
            borderRadius: '6px',
            backgroundColor: '#1F2937',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>

      {/* 브랜드 목록 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            style={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: isMobile ? '12px' : '16px',
              transition: 'all 0.2s ease',
              maxWidth: '100%',
              overflowX: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4B5563';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* 브랜드명 및 타입 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{
                margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: 'white'
            }}>
              {brand.name}
            </h3>
              {brand.user_id === null ? (
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: '#059669',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: '500'
                }}>
                  기본
                </span>
              ) : (
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: '500'
                }}>
                  사용자
                </span>
              )}
            </div>

            {/* 국가 및 지역 */}
            {(brand.country || brand.region) && (
              <div style={{ 
                marginBottom: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {brand.country && (
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#374151',
                    borderRadius: '4px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#9CA3AF',
                    whiteSpace: 'nowrap'
                  }}>
                    🌍 {brand.country}
                  </span>
                )}
                {brand.region && (
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#374151',
                    borderRadius: '4px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#9CA3AF',
                    whiteSpace: 'nowrap'
                  }}>
                    🏔️ {brand.region}
                  </span>
                )}
              </div>
            )}

            {/* 설명 */}
            {brand.description && (
              <p style={{
                margin: '0 0 16px 0',
                color: '#9CA3AF',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {brand.description}
              </p>
            )}

            {/* 생성일 */}
            <div style={{
              marginBottom: '16px',
              fontSize: '12px',
              color: '#6B7280'
            }}>
              생성일: {new Date(brand.created_at).toLocaleDateString('ko-KR')}
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => openEditModal(brand)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                title="브랜드 수정"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(brand.id, brand.name)}
                disabled={brand.user_id === null}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: brand.user_id === null ? '#6B7280' : '#EF4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: brand.user_id === null ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: brand.user_id === null ? 0.5 : 1
                }}
                title={brand.user_id === null ? '기본 브랜드는 삭제할 수 없습니다' : '브랜드 삭제'}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 브랜드 추가/수정 모달 */}
      {showAddModal && (
        <UnifiedModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingBrand ? '브랜드 수정' : '브랜드 추가'}
          size="sm"
          variant="form"
        >

            <form onSubmit={handleSubmit}>
              <ModalInput
                label="브랜드명"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                placeholder="예: Macallan"
                required
              />

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  fontWeight: '500'
                }}>
                  국가
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => {
                    const selectedCountry = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      country: selectedCountry,
                      region: ''
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="">국가 선택</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  fontWeight: '500'
                }}>
                  지역
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  disabled={!formData.country}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    opacity: formData.country ? 1 : 0.5
                  }}
                >
                  <option value="">지역 선택</option>
                  {formData.country && regions[formData.country as keyof typeof regions]?.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  fontWeight: '500'
                }}>
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="브랜드에 대한 간단한 설명을 입력하세요..."
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <ModalButton
                  variant="secondary"
                  onClick={handleModalClose}
                >
                  취소
                </ModalButton>
                <ModalButton
                  variant="primary"
                  type="submit"
                >
                  {editingBrand ? '수정' : '추가'}
                </ModalButton>
              </div>
            </form>
          </UnifiedModal>
        )}
      </div>
    );
  } 