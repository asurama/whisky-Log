'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { initializeAutoBackup, cleanupAutoBackup } from '@/utils/autoBackup';
import { getEnhancedBackupManager } from '@/utils/enhancedBackup';
import WhiskyCollection from '@/components/WhiskyCollection';
import TastingList from '@/components/TastingList';
import Statistics from '@/components/Statistics';
import AdvancedStatistics from '@/components/AdvancedStatistics';
import PredictionAnalysis from '@/components/PredictionAnalysis';
import BrandManager from '@/components/BrandManager';
import Recommendations from '@/components/Recommendations';
import Wishlist from '@/components/Wishlist';
import DataExport from '@/components/DataExport';
import { useDevice } from '@/hooks/useDevice';
import MobileTabNavigation from '@/components/ui/MobileTabNavigation';
import DesktopTabNavigation from '@/components/ui/DesktopTabNavigation';
import UserProfile from '@/components/UserProfile';
import WhiskyModal from '@/components/WhiskyModal';
import TastingModal from '@/components/TastingModal';
import TastingHistory from '@/components/TastingHistory';
import WhiskyDetailModal from '@/components/WhiskyDetailModal';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

import { User, Brand, Bottle, Tasting } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collection' | 'tastings' | 'statistics' | 'predictions' | 'recommendations' | 'wishlist' | 'export'>('collection');
  
  // 위스키 컬렉션 모달 상태들
  const [showWhiskyModal, setShowWhiskyModal] = useState(false);
  const [showTastingModal, setShowTastingModal] = useState(false);
  const [showTastingHistory, setShowTastingHistory] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [editingTasting, setEditingTasting] = useState<Tasting | null>(null);
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  
  // 모든 모달 상태 초기화 함수
  const closeAllModals = () => {
    setShowWhiskyModal(false);
    setShowTastingModal(false);
    setShowTastingHistory(false);
    setShowDetailModal(false);
    setEditingBottle(null);
    setEditingTasting(null);
    setSelectedBottle(null);
  };

  const handleTabChange = (tabId: string) => {
    // 탭 변경 시 모든 모달 닫기
    closeAllModals();
    setActiveTab(tabId as 'collection' | 'tastings' | 'statistics' | 'predictions' | 'recommendations' | 'wishlist' | 'export');
  };

  // 브랜드 데이터 가져오기
  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('브랜드 로딩 오류:', error);
    } finally {
      setBrandsLoading(false);
    }
  };

  // 브랜드 업데이트 콜백 - 수정된 브랜드 정보를 받아서 상태 업데이트
  const handleBrandsUpdate = (updatedBrand?: Brand, deletedBrandId?: string) => {
    if (updatedBrand) {
      // 브랜드 추가 또는 수정
      setBrands(prev => {
        const existingIndex = prev.findIndex((brand: any) => brand.id === updatedBrand.id);
        if (existingIndex >= 0) {
          // 브랜드 수정 - 기존 브랜드를 업데이트된 브랜드로 교체
          const newBrands = [...prev];
          newBrands[existingIndex] = updatedBrand;
          console.log('브랜드 수정 완료:', updatedBrand);
          return newBrands;
        } else {
          // 브랜드 추가 - 새 브랜드를 목록에 추가
          console.log('브랜드 추가 완료:', updatedBrand);
          return [...prev, updatedBrand];
        }
      });
    } else if (deletedBrandId) {
      // 브랜드 삭제 - 해당 브랜드 제거
              setBrands((prev: any[]) => prev.filter((brand: any) => brand.id !== deletedBrandId));
      console.log('브랜드 삭제 완료:', deletedBrandId);
    }
  };
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  // 디바이스 타입 감지
  const { isMobile, isTablet, isDesktop } = useDevice();
  
  // 탭 데이터 정의
  const tabs = [
    { id: 'collection', label: '위스키 컬렉션', icon: '🥃' },
    { id: 'tastings', label: '시음 기록', icon: '📝' },
    { id: 'statistics', label: '통계', icon: '📊' },
    { id: 'predictions', label: '취향', icon: '🎯' },
    { id: 'recommendations', label: '추천', icon: '🎯' },
    { id: 'wishlist', label: '위시리스트', icon: '❤️' },

    { id: 'export', label: '데이터 관리', icon: '⚙️' },
  ];

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user as User | null);
      setLoading(false);
      
              // 사용자가 로그인되어 있으면 자동 백업 초기화 및 브랜드 데이터 가져오기
      if (session?.user) {
        initializeAutoBackup();
        // 강화된 백업 시스템 초기화
        const enhancedBackupManager = getEnhancedBackupManager();
        enhancedBackupManager.startAutoBackup();
          // 브랜드 데이터 가져오기
          fetchBrands();
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user as User | null);
        setLoading(false);
        
        // 로그인 상태 변경 시 자동 백업 관리
        if (session?.user) {
          initializeAutoBackup();
          // 강화된 백업 시스템 초기화
          const enhancedBackupManager = getEnhancedBackupManager();
          enhancedBackupManager.startAutoBackup();
        } else {
          cleanupAutoBackup();
          // 강화된 백업 시스템 정리
          const enhancedBackupManager = getEnhancedBackupManager();
          enhancedBackupManager.stopAutoBackup();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      cleanupAutoBackup();
      // 강화된 백업 시스템 정리
      const enhancedBackupManager = getEnhancedBackupManager();
      enhancedBackupManager.stopAutoBackup();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (isSignUp) {
        // 회원가입
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://asurama.github.io/whisky-Log/'
          }
        });
        
        if (error) throw error;
        setAuthMessage('이메일을 확인하여 계정을 활성화해주세요.');
      } else {
        // 로그인
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥃</div>
          <p>로딩중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gradient-bg" style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 패턴 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />

        {/* 회원가입 특별 배경 효과 */}
        {isSignUp && (
          <>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              fontSize: '120px',
              opacity: 0.1,
              animation: 'float 6s ease-in-out infinite',
              transform: 'rotate(-15deg)'
            }}>
              🥃
            </div>
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '10%',
              fontSize: '80px',
              opacity: 0.1,
              animation: 'float 8s ease-in-out infinite reverse',
              transform: 'rotate(15deg)'
            }}>
              🍷
            </div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              fontSize: '60px',
              opacity: 0.1,
              animation: 'float 7s ease-in-out infinite',
              transform: 'rotate(10deg)'
            }}>
              🍸
            </div>
          </>
        )}

        <div className="glass" style={{
          padding: isSignUp ? '40px' : '32px',
          borderRadius: '20px',
          width: '90%',
          maxWidth: isSignUp ? '500px' : '400px',
          position: 'relative',
          zIndex: 10,
          border: isSignUp ? '2px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isSignUp 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.1)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          transform: isSignUp ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}>
          {/* 회원가입 특별 헤더 */}
          {isSignUp && (
            <div style={{
              textAlign: 'center',
              marginBottom: '30px',
              padding: '20px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                환영합니다!
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#d1d5db',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                위스키 로그와 함께 특별한 여정을 시작하세요
              </p>
            </div>
          )}

          {/* 로그인 헤더 */}
          {!isSignUp && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥃</div>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '24px',
                fontWeight: '600',
                color: 'white'
              }}>
                로그인
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                위스키 로그에 오신 것을 환영합니다!
              </p>
            </div>
          )}
          
          {/* 이메일/비밀번호 폼 */}
          <form onSubmit={handleEmailAuth} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: '#d1d5db',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                이메일
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: '#d1d5db',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                비밀번호
              </label>
              <input
                type="password"
                placeholder={isSignUp ? "최소 6자 이상" : "비밀번호"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>

            {/* 회원가입 시 추가 정보 */}
            {isSignUp && (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>✨</span>
                  <span style={{ 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    회원가입 혜택
                  </span>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#9ca3af',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  <li>무제한 위스키 컬렉션 관리</li>
                  <li>상세한 시음 기록 작성</li>
                  <li>개인화된 통계 및 분석</li>
                  <li>데이터 백업 및 동기화</li>
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                opacity: authLoading ? 0.6 : 1,
                marginBottom: '16px',
                background: isSignUp 
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                transition: 'all 0.3s ease',
                transform: authLoading ? 'scale(0.98)' : 'scale(1)',
                boxShadow: isSignUp 
                  ? '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
                  : '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
              }}
            >
              {authLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  처리중...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isSignUp ? '🎉 회원가입 시작하기' : '🔐 로그인'}
                </div>
              )}
            </button>
          </form>

          {/* 메시지 */}
          {authMessage && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: authMessage.includes('확인') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: authMessage.includes('확인') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              color: authMessage.includes('확인') ? '#10b981' : '#ef4444',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {authMessage}
            </div>
          )}

          {/* 모드 전환 */}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthMessage('');
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#9ca3af',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>

          {/* 구분선 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: '14px' }}>또는</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          {/* Google 로그인 */}
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: 'https://asurama.github.io/whisky-Log/'
              }
            })}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#4285f4',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(66, 133, 244, 0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        </div>

        {/* CSS 애니메이션 */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-15deg); }
            50% { transform: translateY(-20px) rotate(-15deg); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      margin: 0, 
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* PWA 설치 프롬프트 - 로그인된 사용자에게만 표시 */}
      {user && <PWAInstallPrompt />}
      
      {/* 배경 패턴 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* 헤더 */}
      <div className="glass" style={{
        padding: isMobile ? '12px 16px' : '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        flexWrap: 'nowrap',
        minHeight: 'fit-content'
      }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '8px' : '12px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            flexShrink: 0
          }}
          onClick={() => setActiveTab('collection')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div style={{
            width: isMobile ? '24px' : '36px',
            height: isMobile ? '24px' : '36px',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            flexShrink: 0,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <img 
              src="/whisky-Log/icons/icon-192x192.png" 
              alt="Whisky Log"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? '14px' : '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            lineHeight: isMobile ? '1.1' : '1.4',
            letterSpacing: isMobile ? '-0.5px' : 'normal'
          }}>
            Whisky Log
          </h1>
        </div>
        <div style={{ flexShrink: 0 }}>
          <UserProfile user={user} onTabChange={handleTabChange} />
        </div>
      </div>

              {/* 디바이스별 탭 네비게이션 */}
        {isMobile ? (
          <MobileTabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            zIndex={showWhiskyModal || showTastingModal || showTastingHistory || showDetailModal ? 100 : 1000}
          />
        ) : (
          <DesktopTabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

      {/* 컨텐츠 */}
      <div className={isMobile ? 'mobile-scrollable mobile-content-fixed' : ''} style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingBottom: isMobile ? 'calc(72px + env(safe-area-inset-bottom))' : '0', // 모바일에서만 하단 패딩
        // 모바일 브라우저 주소창 변화 대응 - 더 강력한 고정
        minHeight: isMobile ? 'calc(100vh - 72px - env(safe-area-inset-bottom))' : 'auto',
        maxHeight: isMobile ? 'calc(100vh - 72px - env(safe-area-inset-bottom))' : 'auto',
        // 스크롤 성능 최적화
        WebkitOverflowScrolling: 'touch',
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
        // 추가 고정 속성
        position: 'relative',
        top: 0,
        // 확대/축소 대응
        transformOrigin: isMobile ? 'top center' : 'initial',
        WebkitTransformOrigin: isMobile ? 'top center' : 'initial',
      }}>
        {activeTab === 'collection' && <WhiskyCollection 
          user={user} 
          brands={brands} 
          onShowWhiskyModal={(bottle) => {
            setEditingBottle(bottle || null);
            setShowWhiskyModal(true);
          }}
          onShowTastingModal={(bottle) => {
            setSelectedBottle(bottle);
            setShowTastingModal(true);
          }}
          onShowTastingHistory={(bottle) => {
            setSelectedBottle(bottle);
            setShowTastingHistory(true);
          }}
          onShowDetailModal={(bottle) => {
            setSelectedBottle(bottle);
            setShowDetailModal(true);
          }}
        />}
        {activeTab === 'tastings' && <TastingList 
          user={user} 
          brands={brands} 
          onShowTastingModal={(tasting) => {
            if (tasting && tasting.id) {
              // 기존 시음 기록 수정
              setEditingTasting(tasting);
              setSelectedBottle(tasting.bottles || null);
            } else if (tasting && tasting.bottles) {
              // 새로운 시음 기록 추가 (특정 보틀 선택)
              setEditingTasting(null);
              setSelectedBottle(tasting.bottles);
            } else {
              // 새로운 시음 기록 추가 (보틀 없음)
              setEditingTasting(null);
              setSelectedBottle(null);
            }
            setShowTastingModal(true);
          }}
        />}
        {activeTab === 'statistics' && <AdvancedStatistics user={user} brands={brands} />}
        {activeTab === 'predictions' && <PredictionAnalysis user={user} brands={brands} />}
        {activeTab === 'recommendations' && <Recommendations user={user} brands={brands} />}
        {activeTab === 'wishlist' && <Wishlist user={user} brands={brands} />}

        {activeTab === 'export' && <DataExport user={user} onBrandsUpdate={handleBrandsUpdate} brands={brands} />}
      </div>

      {/* 위스키 컬렉션 모달들 */}
      {showWhiskyModal && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            top: typeof window !== 'undefined' ? window.scrollY + 'px' : '0px',
            left: 0,
            right: 0,
            bottom: typeof window !== 'undefined' ? `calc(100vh - ${window.scrollY}px)` : '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <WhiskyModal
              user={user}
              brands={brands}
              editingBottle={editingBottle}
              onClose={() => {
                setShowWhiskyModal(false);
                setEditingBottle(null);
              }}
              onBottleSaved={() => {
                setShowWhiskyModal(false);
                setEditingBottle(null);
                // 페이지 새로고침으로 데이터 업데이트
                window.location.reload();
              }}
            />
          </div>
        ) : (
          <WhiskyModal
            user={user}
            brands={brands}
            editingBottle={editingBottle}
            onClose={() => {
              setShowWhiskyModal(false);
              setEditingBottle(null);
            }}
            onBottleSaved={() => {
              setShowWhiskyModal(false);
              setEditingBottle(null);
              // 페이지 새로고침으로 데이터 업데이트
              window.location.reload();
            }}
          />
        )
      )}

      {showTastingModal && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TastingModal
              user={user}
              bottle={selectedBottle}
              editingTasting={editingTasting}
              onClose={() => {
                setShowTastingModal(false);
                setSelectedBottle(null);
                setEditingTasting(null);
              }}
              onTastingAdded={() => {
                setShowTastingModal(false);
                setSelectedBottle(null);
                setEditingTasting(null);
                // 페이지 새로고침으로 데이터 업데이트
                window.location.reload();
              }}
            />
          </div>
        ) : (
          <TastingModal
            user={user}
            bottle={selectedBottle}
            editingTasting={editingTasting}
            onClose={() => {
              setShowTastingModal(false);
              setSelectedBottle(null);
              setEditingTasting(null);
            }}
            onTastingAdded={() => {
              setShowTastingModal(false);
              setSelectedBottle(null);
              setEditingTasting(null);
              // 페이지 새로고침으로 데이터 업데이트
              window.location.reload();
            }}
          />
        )
      )}

      {showTastingHistory && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            top: typeof window !== 'undefined' ? window.scrollY + 'px' : '0px',
            left: 0,
            right: 0,
            bottom: typeof window !== 'undefined' ? `calc(100vh - ${window.scrollY}px)` : '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TastingHistory
              user={user}
              bottle={selectedBottle}
              onClose={() => {
                setShowTastingHistory(false);
                setSelectedBottle(null);
              }}
            />
          </div>
        ) : (
          <TastingHistory
            user={user}
            bottle={selectedBottle}
            onClose={() => {
              setShowTastingHistory(false);
              setSelectedBottle(null);
            }}
          />
        )
      )}

      {showDetailModal && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            top: typeof window !== 'undefined' ? window.scrollY + 'px' : '0px',
            left: 0,
            right: 0,
            bottom: typeof window !== 'undefined' ? `calc(100vh - ${window.scrollY}px)` : '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <WhiskyDetailModal
              bottle={selectedBottle}
              isOpen={showDetailModal}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedBottle(null);
              }}
              onEdit={(bottle) => {
                setEditingBottle(bottle);
                setShowDetailModal(false);
                setShowWhiskyModal(true);
              }}
              onAddTasting={(bottle) => {
                setSelectedBottle(bottle);
                setShowDetailModal(false);
                setShowTastingModal(true);
              }}
            />
          </div>
        ) : (
          <WhiskyDetailModal
            bottle={selectedBottle}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedBottle(null);
            }}
            onEdit={(bottle) => {
              setEditingBottle(bottle);
              setShowDetailModal(false);
              setShowWhiskyModal(true);
            }}
            onAddTasting={(bottle) => {
              setSelectedBottle(bottle);
              setShowDetailModal(false);
              setShowTastingModal(true);
            }}
          />
        )
      )}
    </div>
  );
}