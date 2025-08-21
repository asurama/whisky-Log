'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useDevice } from '@/hooks/useDevice';

interface UserProfileProps {
  user: any;
  onTabChange?: (tab: string) => void;
}

export default function UserProfile({ user, onTabChange }: UserProfileProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { isMobile } = useDevice();

  const handleSignOut = async () => {
    if (confirm('정말로 로그아웃하시겠습니까?')) {
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (!error) {
          // 로컬 스토리지와 세션 스토리지 정리
          localStorage.clear();
          sessionStorage.clear();
          // 페이지 새로고침으로 완전한 로그아웃
          window.location.reload();
        } else {
          console.error('로그아웃 오류:', error);
          alert('로그아웃 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDataReset = async () => {
    const confirmMessage = `⚠️ 경고: 데이터 초기화\n\n이 작업은 되돌릴 수 없습니다!\n\n다음 데이터가 모두 삭제됩니다:\n• 위스키 컬렉션\n• 시음 기록\n• 위시리스트\n• 브랜드 정보\n• 통계 데이터\n• 백업 데이터\n\n정말로 모든 데이터를 초기화하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // 추가 확인
    const finalConfirm = confirm('마지막 확인: 모든 데이터가 영구적으로 삭제됩니다.\n\n계속하시겠습니까?');
    if (!finalConfirm) {
      return;
    }

    try {
      setIsResetting(true);
      
      // 모든 데이터 삭제
      const tables = ['bottles', 'tastings', 'wishlist', 'brands', 'backup_metadata'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error(`${table} 삭제 오류:`, error);
        }
      }

      // 기본 브랜드 다시 추가 (user_id가 null인 브랜드들)
      const { data: defaultBrands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .is('user_id', null);

      if (!brandsError && defaultBrands) {
        for (const brand of defaultBrands) {
          const { error } = await supabase
            .from('brands')
            .insert({
              name: brand.name,
              country: brand.country,
              region: brand.region,
              description: brand.description,
              user_id: user.id
            });
          
          if (error) {
            console.error('기본 브랜드 복원 오류:', error);
          }
        }
      }

      alert('✅ 모든 데이터가 성공적으로 초기화되었습니다!\n\n기본 브랜드만 다시 추가되었습니다.');
      
      // 페이지 새로고침
      window.location.reload();
      
    } catch (error) {
      console.error('데이터 초기화 오류:', error);
      alert('❌ 데이터 초기화 중 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsResetting(false);
      setShowProfile(false);
    }
  };

  const handleDataManagement = () => {
    setShowProfile(false);
    if (onTabChange) {
      onTabChange('export');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: any) => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return user.email.split('@')[0];
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      position: 'relative',
      flexWrap: 'nowrap'
    }}>
      {/* 계정 정보 표시 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '6px' : '8px',
        padding: isMobile ? '6px 10px' : '8px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
      }} onClick={() => setShowProfile(!showProfile)}>
        <div style={{
          width: isMobile ? '20px' : '24px',
          height: isMobile ? '20px' : '24px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {getUserInitials(user.email)}
        </div>
        <div style={{ textAlign: 'left', flexShrink: 1, minWidth: 0 }}>
          <div style={{
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            color: 'white',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isMobile ? getUserDisplayName(user).substring(0, 8) : getUserDisplayName(user)}
          </div>
          {!isMobile && (
            <div style={{
              fontSize: '11px',
              color: '#9CA3AF',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user.email.length > 20 ? user.email.substring(0, 20) + '...' : user.email}
            </div>
          )}
        </div>
        <span style={{ fontSize: '10px', color: '#9CA3AF', flexShrink: 0 }}>
          {showProfile ? '▲' : '▼'}
        </span>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleSignOut}
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          color: '#EF4444',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
          flexShrink: 0
        }}
      >
        {isMobile ? '🔓' : '로그아웃'}
      </button>

      {/* 상세 정보 드롭다운 */}
      {showProfile && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '320px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
        }}>
          {/* 계정 정보 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#D1D5DB',
              marginBottom: '8px',
            }}>
              계정 정보
            </h4>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>가입일:</strong> {formatDate(user.created_at)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>마지막 로그인:</strong> {formatDate(user.last_sign_in_at || user.created_at)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>인증 방법:</strong> {user.app_metadata?.provider || '이메일'}
              </div>
              {user.email_confirmed_at && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>이메일 인증:</strong> {formatDate(user.email_confirmed_at)}
                </div>
              )}
            </div>
          </div>

          {/* 앱 사용 정보 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#D1D5DB',
              marginBottom: '8px',
            }}>
              앱 사용 정보
            </h4>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>계정 상태:</strong> 
                <span style={{ 
                  color: '#10B981', 
                  marginLeft: '4px',
                  fontWeight: '500'
                }}>
                  활성
                </span>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>데이터 동기화:</strong> 
                <span style={{ 
                  color: '#10B981', 
                  marginLeft: '4px',
                  fontWeight: '500'
                }}>
                  활성화됨
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* 데이터 관리로 이동 버튼 */}
            <button
              onClick={handleDataManagement}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                color: '#3B82F6',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              📊 데이터 관리로 이동
            </button>

            {/* 데이터 초기화 버튼 */}
            <button
              onClick={handleDataReset}
              disabled={isResetting}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: isResetting ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: isResetting ? '#9CA3AF' : '#EF4444',
                fontSize: '13px',
                fontWeight: '500',
                cursor: isResetting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isResetting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isResetting) {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isResetting) {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }
              }}
            >
              {isResetting ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                  초기화 중...
                </>
              ) : (
                <>
                  🗑️ 데이터 초기화
                </>
              )}
            </button>
          </div>

          {/* 경고 메시지 */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#EF4444',
            lineHeight: '1.4'
          }}>
            ⚠️ 데이터 초기화는 되돌릴 수 없습니다.
          </div>
        </div>
      )}

      {/* 배경 클릭 시 드롭다운 닫기 */}
      {showProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* 스핀 애니메이션 CSS */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 