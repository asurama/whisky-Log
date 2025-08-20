import { useState, useEffect } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
  connectionType: string | null;
  effectiveType: string | null;
}

export function useOffline() {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    lastOnline: null,
    lastOffline: null,
    connectionType: null,
    effectiveType: null
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const now = new Date();
      
      setOfflineStatus(prev => ({
        ...prev,
        isOnline,
        isOffline: !isOnline,
        lastOnline: isOnline ? now : prev.lastOnline,
        lastOffline: !isOnline ? now : prev.lastOffline
      }));

      // 온라인 상태로 변경 시 알림
      if (isOnline) {
        console.log('🟢 온라인 상태로 변경됨');
        showOnlineNotification();
      } else {
        console.log('🔴 오프라인 상태로 변경됨');
        showOfflineNotification();
      }
    };

    // 연결 정보 업데이트
    const updateConnectionInfo = () => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        setOfflineStatus(prev => ({
          ...prev,
          connectionType: connection?.type || null,
          effectiveType: connection?.effectiveType || null
        }));
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateConnectionInfo);
    }

    // 초기 상태 설정
    updateOnlineStatus();
    updateConnectionInfo();

    // 클린업
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  // 온라인 알림 표시
  const showOnlineNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Whisky Log', {
        body: '인터넷 연결이 복구되었습니다.',
        icon: '/next.svg',
        badge: '/next.svg',
        tag: 'connection-status'
      });
    }
  };

  // 오프라인 알림 표시
  const showOfflineNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Whisky Log', {
        body: '인터넷 연결이 끊어졌습니다. 오프라인 모드로 전환됩니다.',
        icon: '/next.svg',
        badge: '/next.svg',
        tag: 'connection-status'
      });
    }
  };

  // 연결 상태 확인
  const checkConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // 오프라인 데이터 저장
  const saveOfflineData = async (key: string, data: any) => {
    if ('localStorage' in window) {
      try {
        const offlineData = {
          data,
          timestamp: Date.now(),
          key
        };
        localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
        console.log('💾 오프라인 데이터 저장:', key);
        return true;
      } catch (error) {
        console.error('오프라인 데이터 저장 실패:', error);
        return false;
      }
    }
    return false;
  };

  // 오프라인 데이터 가져오기
  const getOfflineData = async (key: string) => {
    if ('localStorage' in window) {
      try {
        const stored = localStorage.getItem(`offline_${key}`);
        if (stored) {
          const offlineData = JSON.parse(stored);
          console.log('📂 오프라인 데이터 로드:', key);
          return offlineData.data;
        }
      } catch (error) {
        console.error('오프라인 데이터 로드 실패:', error);
      }
    }
    return null;
  };

  // 오프라인 데이터 동기화
  const syncOfflineData = async () => {
    if (!offlineStatus.isOnline) {
      console.log('❌ 온라인 상태가 아닙니다. 동기화를 건너뜁니다.');
      return false;
    }

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
      let syncedCount = 0;

      for (const key of keys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const offlineData = JSON.parse(stored);
            
            // 데이터가 24시간 이내인지 확인
            const isRecent = Date.now() - offlineData.timestamp < 24 * 60 * 60 * 1000;
            
            if (isRecent) {
              // 서버에 데이터 전송
              const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(offlineData)
              });

              if (response.ok) {
                localStorage.removeItem(key);
                syncedCount++;
                console.log('✅ 오프라인 데이터 동기화 완료:', key);
              }
            } else {
              // 오래된 데이터 삭제
              localStorage.removeItem(key);
              console.log('🗑️ 오래된 오프라인 데이터 삭제:', key);
            }
          }
        } catch (error) {
          console.error('개별 오프라인 데이터 동기화 실패:', key, error);
        }
      }

      console.log(`📤 총 ${syncedCount}개의 오프라인 데이터 동기화 완료`);
      return syncedCount > 0;
    } catch (error) {
      console.error('오프라인 데이터 동기화 실패:', error);
      return false;
    }
  };

  // 오프라인 데이터 정리
  const clearOfflineData = () => {
    if ('localStorage' in window) {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
      keys.forEach(key => localStorage.removeItem(key));
      console.log('🧹 오프라인 데이터 정리 완료');
    }
  };

  return {
    ...offlineStatus,
    checkConnection,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    clearOfflineData
  };
} 