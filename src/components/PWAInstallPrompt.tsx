'use client';

import { useState, useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const { isMobile } = useDevice();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA 설치 가능 여부 확인
    const checkInstallable = () => {
      // 이미 설치되어 있는지 확인
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }

      // 설치 프롬프트 이벤트 리스너
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      // 앱 설치 완료 이벤트 리스너
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowPrompt(false);
        console.log('✅ PWA 설치 완료');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    };

    // 설치 상태 확인
    const checkInstallStatus = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          if (registrations.length > 0) {
            console.log('🔧 Service Worker 등록됨');
          }
        });
      }
    };

    checkInstallable();
    checkInstallStatus();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ 설치 프롬프트를 사용할 수 없습니다.');
      return;
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();
      
      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ 사용자가 PWA 설치를 수락했습니다.');
        setIsInstalled(true);
      } else {
        console.log('❌ 사용자가 PWA 설치를 거부했습니다.');
      }
    } catch (error) {
      console.error('PWA 설치 중 오류:', error);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  // 이미 설치되어 있거나 프롬프트를 표시할 필요가 없으면 렌더링하지 않음
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '80px' : '20px',
      left: '20px',
      right: '20px',
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '20px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '24px',
          color: '#3B82F6'
        }}>
          📱
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: 'white'
          }}>
            앱으로 설치하기
          </h3>
          
          <p style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '13px' : '14px',
            color: '#9CA3AF',
            lineHeight: '1.5'
          }}>
            Whisky Log를 홈 화면에 추가하여 더 빠르고 편리하게 사용하세요.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleInstallClick}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                padding: isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              설치하기
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                border: '1px solid #4B5563',
                padding: isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              나중에
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>
      </div>
      
      {/* 설치 혜택 */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          fontSize: isMobile ? '12px' : '13px',
          color: '#93C5FD',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div>✨ 홈 화면에서 바로 접근</div>
          <div>🚀 더 빠른 로딩 속도</div>
          <div>📱 네이티브 앱 같은 경험</div>
          <div>🔒 오프라인에서도 사용 가능</div>
        </div>
      </div>
    </div>
  );
} 