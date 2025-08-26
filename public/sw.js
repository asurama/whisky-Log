const CACHE_NAME = 'whisky-log-v7.0.0';
const STATIC_CACHE = 'whisky-log-static-v7.0.0';
const DYNAMIC_CACHE = 'whisky-log-dynamic-v7.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/whisky-Log/',
  '/whisky-Log/index.html',
  '/whisky-Log/manifest.json',
  '/whisky-Log/icons/icon-72x72.png',
  '/whisky-Log/icons/icon-96x96.png',
  '/whisky-Log/icons/icon-128x128.png',
  '/whisky-Log/icons/icon-144x144.png',
  '/whisky-Log/icons/icon-152x152.png',
  '/whisky-Log/icons/icon-192x192.png',
  '/whisky-Log/icons/icon-192x192-maskable.png',
  '/whisky-Log/icons/icon-384x384.png',
  '/whisky-Log/icons/icon-512x512.png',
  '/whisky-Log/icons/icon-512x512-maskable.png',
  '/whisky-Log/static/css/',
  '/whisky-Log/static/js/',
  '/whisky-Log/_next/static/'
];

// 캐시할 API 엔드포인트들
const API_CACHE_PATTERNS = [
  '/api/whiskybase',
  '/api/whiskybase-db'
];

// 설치 이벤트 - 정적 파일들을 캐시
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 정적 파일 캐싱 중...');
        // chrome-extension URL을 필터링하여 안전한 파일만 캐시
        const safeFiles = STATIC_FILES.filter(url => 
          !url.startsWith('chrome-extension://') && 
          !url.startsWith('moz-extension://') &&
          !url.startsWith('safari-extension://') &&
          !url.startsWith('edge-extension://') &&
          !url.startsWith('opera-extension://')
        );
        return cache.addAll(safeFiles);
      })
      .then(() => {
        console.log('✅ 정적 파일 캐싱 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ 정적 파일 캐싱 실패:', error);
      })
  );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ 이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ 캐시 정리 완료');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // 지원되지 않는 스키마 요청은 무시
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-extension://') ||
      request.url.startsWith('edge-extension://') ||
      request.url.startsWith('opera-extension://') ||
      request.url.includes('chrome-extension') ||
      request.url.includes('moz-extension') ||
      request.url.includes('safari-extension') ||
      request.url.includes('edge-extension') ||
      request.url.includes('opera-extension')) {
    console.log('🚫 확장 프로그램 요청 무시:', request.url);
    return;
  }
  
  // 정적 파일 캐시 처리
  if (STATIC_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // 성공적인 응답을 캐시 (chrome-extension 체크 추가)
              if (response.status === 200 && !request.url.includes('chrome-extension')) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    // chrome-extension 스키마 체크 추가
                    if (!request.url.startsWith('chrome-extension://')) {
                      cache.put(request, responseClone);
                    }
                  });
              }
              return response;
            })
            .catch(() => {
              // 오프라인 시 기본 아이콘 반환
              if (request.destination === 'image') {
                return caches.match('/whisky-Log/next.svg');
              }
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // 기타 요청은 네트워크 우선
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 백그라운드 동기화 시작');
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 함수
async function doBackgroundSync() {
  try {
    // 오프라인 중 저장된 데이터를 서버에 동기화
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
      await clearOfflineData();
    }
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error);
  }
}

// 오프라인 데이터 가져오기
async function getOfflineData() {
  // IndexedDB에서 오프라인 데이터 가져오기
  return [];
}

// 오프라인 데이터 동기화
async function syncOfflineData(data) {
  // 서버에 데이터 전송
  console.log('📤 오프라인 데이터 동기화:', data);
}

// 오프라인 데이터 정리
async function clearOfflineData() {
  // 동기화 완료 후 오프라인 데이터 삭제
  console.log('🧹 오프라인 데이터 정리 완료');
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 푸시 알림 수신');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/next.svg',
    badge: '/next.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/next.svg'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/next.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Whisky Log', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 알림 클릭됨');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 