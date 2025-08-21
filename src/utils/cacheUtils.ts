// 데이터 캐싱 유틸리티
import { supabase } from '@/lib/supabase';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live (밀리초)
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5분

  // 데이터 캐시에 저장
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // 캐시에서 데이터 가져오기
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 캐시에서 데이터 제거
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 특정 패턴의 캐시 제거
  deletePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // 모든 캐시 제거
  clear(): void {
    this.cache.clear();
  }

  // 캐시 크기 반환
  size(): number {
    return this.cache.size;
  }

  // 만료된 캐시 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 캐시 인스턴스
export const cacheManager = new CacheManager();

// 캐시 키 생성 함수들
export const cacheKeys = {
  // 브랜드 관련
  brands: () => 'brands:all',
  brand: (id: string) => `brand:${id}`,
  
  // 위스키 관련
  bottles: (userId: string) => `bottles:${userId}`,
  bottle: (id: string) => `bottle:${id}`,
  
  // 시음 기록 관련
  tastings: (userId: string) => `tastings:${userId}`,
  tasting: (id: string) => `tasting:${id}`,
  
  // 위시리스트 관련
  wishlist: (userId: string) => `wishlist:${userId}`,
  
  // 통계 관련
  stats: (userId: string) => `stats:${userId}`,
  
  // Whiskybase 검색 관련
  whiskybaseSearch: (query: string) => `whiskybase:search:${query}`,
};

// 캐시된 데이터 가져오기 함수
export async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5분
): Promise<T> {
  // 캐시에서 먼저 확인
  const cached = cacheManager.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 캐시에 없으면 새로 가져오기
  const data = await fetchFunction();
  cacheManager.set(key, data, ttl);
  return data;
}

// 브랜드 데이터 캐시 관리
export const brandCache = {
  // 모든 브랜드 가져오기 (캐시 적용)
  async getAll(): Promise<any[]> {
    return getCachedData(
      cacheKeys.brands(),
      async () => {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data || [];
      },
      10 * 60 * 1000 // 10분 (브랜드는 자주 변경되지 않음)
    );
  },

  // 브랜드 캐시 무효화
  invalidate(): void {
    cacheManager.deletePattern('brand');
  }
};

// 위스키 데이터 캐시 관리
export const bottleCache = {
  // 사용자의 모든 위스키 가져오기 (캐시 적용)
  async getAll(userId: string): Promise<any[]> {
    return getCachedData(
      cacheKeys.bottles(userId),
      async () => {
        const { data, error } = await supabase
          .from('bottles')
          .select(`
            *,
            brands (id, name, country, region, description),
            tastings (id)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      2 * 60 * 1000 // 2분
    );
  },

  // 위스키 캐시 무효화
  invalidate(userId?: string): void {
    if (userId) {
      cacheManager.delete(cacheKeys.bottles(userId));
    } else {
      cacheManager.deletePattern('bottles');
    }
  }
};

// 시음 기록 캐시 관리
export const tastingCache = {
  // 사용자의 모든 시음 기록 가져오기 (캐시 적용)
  async getAll(userId: string): Promise<any[]> {
    return getCachedData(
      cacheKeys.tastings(userId),
      async () => {
        const { data, error } = await supabase
          .from('tastings')
          .select(`
            *,
            bottles (name, brands (name), custom_brand)
          `)
          .eq('user_id', userId)
          .order('tasting_date', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      2 * 60 * 1000 // 2분
    );
  },

  // 시음 기록 캐시 무효화
  invalidate(userId?: string): void {
    if (userId) {
      cacheManager.delete(cacheKeys.tastings(userId));
    } else {
      cacheManager.deletePattern('tastings');
    }
  }
};

// 정기적인 캐시 정리 (5분마다)
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

// 페이지 언로드 시 캐시 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheManager.clear();
  });
} 