'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';

interface RecommendationsProps {
  user: any;
  brands?: any[];
}

interface Recommendation {
  id: string;
  name: string;
  brand: string;
  reason: string;
  confidence: number;
  price?: number;
  image_url?: string;
}

export default function Recommendations({ user, brands: propBrands }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);

      // 사용자의 위스키 데이터 가져오기
      const { data: bottles } = await supabase
        .from('bottles')
        .select('*')
        .eq('user_id', user.id);

      // 시음 기록 가져오기
      const { data: tastings } = await supabase
        .from('tastings')
        .select('*')
        .eq('user_id', user.id);

      // 브랜드 데이터
      const brands = propBrands || [];
      const { data: fetchedBrands } = await supabase
        .from('brands')
        .select('*');

      const allBrands = brands.length > 0 ? brands : (fetchedBrands || []);

      if (bottles && tastings) {
        const recs = calculateRecommendations(bottles, tastings, allBrands);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('추천 생성 오류:', error);
      showToast('추천을 생성하는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendations = (bottles: any[], tastings: any[], brands: any[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // 1. 평점이 높은 브랜드 기반 추천
    const brandRatings = tastings.reduce((acc: any, tasting) => {
      if (tasting.rating && tasting.bottle_brand) {
        if (!acc[tasting.bottle_brand]) {
          acc[tasting.bottle_brand] = { total: 0, count: 0 };
        }
        acc[tasting.bottle_brand].total += tasting.rating;
        acc[tasting.bottle_brand].count += 1;
      }
      return acc;
    }, {});

    const topBrands = Object.entries(brandRatings)
      .map(([brand, data]: [string, any]) => ({
        brand,
        avgRating: data.total / data.count
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 3);

    // 인기 브랜드에서 추천
    topBrands.forEach(({ brand }: { brand: string }) => {
      const popularWhiskies = getPopularWhiskiesByBrand(brand);
      popularWhiskies.forEach((whisky: any) => {
        if (!bottles.some((b: any) => b.name === whisky.name)) {
          recommendations.push({
            id: `brand-${whisky.name}`,
            name: whisky.name,
            brand: whisky.brand,
            reason: `좋아하는 브랜드 ${brand}의 인기 위스키`,
            confidence: 85,
            price: whisky.price
          });
        }
      });
    });

    // 2. 가격대 기반 추천
    const userPriceRange = calculateUserPriceRange(bottles);
    const priceBasedRecs = getRecommendationsByPriceRange(userPriceRange);
    priceBasedRecs.forEach((rec: any) => {
      if (!recommendations.some((r: any) => r.name === rec.name)) {
        recommendations.push({
          id: `price-${rec.name}`,
          name: rec.name,
          brand: rec.brand,
          reason: `선호하는 가격대의 인기 위스키`,
          confidence: 75,
          price: rec.price
        });
      }
    });

    // 3. 숙성연수 기반 추천
    const userAgePreference = calculateUserAgePreference(bottles);
    const ageBasedRecs = getRecommendationsByAge(userAgePreference);
    ageBasedRecs.forEach((rec: any) => {
      if (!recommendations.some((r: any) => r.name === rec.name)) {
        recommendations.push({
          id: `age-${rec.name}`,
          name: rec.name,
          brand: rec.brand,
          reason: `선호하는 숙성연수의 위스키`,
          confidence: 70,
          price: rec.price
        });
      }
    });

    // 4. 지역별 추천
    const userRegionPreference = calculateUserRegionPreference(bottles, brands);
    const regionBasedRecs = getRecommendationsByRegion(userRegionPreference);
    regionBasedRecs.forEach((rec: any) => {
      if (!recommendations.some((r: any) => r.name === rec.name)) {
        recommendations.push({
          id: `region-${rec.name}`,
          name: rec.name,
          brand: rec.brand,
          reason: `선호하는 지역의 위스키`,
          confidence: 65,
          price: rec.price
        });
      }
    });

    // 중복 제거 및 정렬
    const uniqueRecs = recommendations.filter((rec: any, index: number, self: any[]) => 
      index === self.findIndex((r: any) => r.name === rec.name)
    );

    return uniqueRecs
      .sort((a: any, b: any) => b.confidence - a.confidence)
      .slice(0, 10);
  };

  // 헬퍼 함수들
  const getPopularWhiskiesByBrand = (brand: string) => {
    const popularWhiskies: any = {
      'Macallan': [
        { name: 'The Macallan 12 Double Cask', brand: 'Macallan', price: 180000 },
        { name: 'The Macallan 18 Sherry Oak', brand: 'Macallan', price: 850000 },
        { name: 'The Macallan Fine Oak 15', brand: 'Macallan', price: 320000 }
      ],
      'Glenfiddich': [
        { name: 'Glenfiddich 12', brand: 'Glenfiddich', price: 65000 },
        { name: 'Glenfiddich 15 Solera', brand: 'Glenfiddich', price: 120000 },
        { name: 'Glenfiddich 18', brand: 'Glenfiddich', price: 280000 }
      ],
      'Glenlivet': [
        { name: 'The Glenlivet 12', brand: 'Glenlivet', price: 55000 },
        { name: 'The Glenlivet 15', brand: 'Glenlivet', price: 95000 },
        { name: 'The Glenlivet 18', brand: 'Glenlivet', price: 220000 }
      ]
    };
    return popularWhiskies[brand] || [];
  };

  const calculateUserPriceRange = (bottles: any[]) => {
    const prices = bottles
      .map((b: any) => b.purchase_price || b.retail_price)
      .filter((p: number) => p > 0);
    
    if (prices.length === 0) return 'medium';
    
    const avgPrice = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
    
    if (avgPrice < 80000) return 'low';
    if (avgPrice < 200000) return 'medium';
    return 'high';
  };

  const getRecommendationsByPriceRange = (range: string) => {
    const recommendations: any = {
      low: [
        { name: 'Glenfiddich 12', brand: 'Glenfiddich', price: 65000 },
        { name: 'The Glenlivet 12', brand: 'Glenlivet', price: 55000 },
        { name: 'Jameson Irish Whiskey', brand: 'Jameson', price: 45000 }
      ],
      medium: [
        { name: 'Glenfiddich 15 Solera', brand: 'Glenfiddich', price: 120000 },
        { name: 'The Glenlivet 15', brand: 'Glenlivet', price: 95000 },
        { name: 'The Macallan 12 Double Cask', brand: 'Macallan', price: 180000 }
      ],
      high: [
        { name: 'The Macallan 18 Sherry Oak', brand: 'Macallan', price: 850000 },
        { name: 'Glenfiddich 21', brand: 'Glenfiddich', price: 650000 },
        { name: 'The Glenlivet 25', brand: 'Glenlivet', price: 1200000 }
      ]
    };
    return recommendations[range] || [];
  };

  const calculateUserAgePreference = (bottles: any[]) => {
    const ages = bottles
      .map((b: any) => b.age_years)
      .filter((a: number) => a > 0);
    
    if (ages.length === 0) return 'medium';
    
    const avgAge = ages.reduce((sum: number, a: number) => sum + a, 0) / ages.length;
    
    if (avgAge < 12) return 'young';
    if (avgAge < 18) return 'medium';
    return 'old';
  };

  const getRecommendationsByAge = (age: string) => {
    const recommendations: any = {
      young: [
        { name: 'Glenfiddich 12', brand: 'Glenfiddich', price: 65000 },
        { name: 'The Glenlivet 12', brand: 'Glenlivet', price: 55000 },
        { name: 'Jameson Irish Whiskey', brand: 'Jameson', price: 45000 }
      ],
      medium: [
        { name: 'Glenfiddich 15 Solera', brand: 'Glenfiddich', price: 120000 },
        { name: 'The Glenlivet 15', brand: 'Glenlivet', price: 95000 },
        { name: 'The Macallan 12 Double Cask', brand: 'Macallan', price: 180000 }
      ],
      old: [
        { name: 'The Macallan 18 Sherry Oak', brand: 'Macallan', price: 850000 },
        { name: 'Glenfiddich 21', brand: 'Glenfiddich', price: 650000 },
        { name: 'The Glenlivet 25', brand: 'Glenlivet', price: 1200000 }
      ]
    };
    return recommendations[age] || [];
  };

  const calculateUserRegionPreference = (bottles: any[], brands: any[]) => {
    // 간단한 지역 선호도 계산
    return 'scotch'; // 기본값
  };

  const getRecommendationsByRegion = (region: string) => {
    const recommendations: any = {
      scotch: [
        { name: 'Glenfiddich 12', brand: 'Glenfiddich', price: 65000 },
        { name: 'The Glenlivet 12', brand: 'Glenlivet', price: 55000 },
        { name: 'The Macallan 12 Double Cask', brand: 'Macallan', price: 180000 }
      ]
    };
    return recommendations[region] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          추천을 분석하는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
        🎯 맞춤 추천
      </h2>

      {recommendations.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#9CA3AF',
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤔</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            아직 충분한 데이터가 없습니다
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            더 많은 위스키를 추가하고 시음 기록을 남겨보세요!
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                backgroundColor: '#1F2937',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #374151',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    {rec.name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#9CA3AF',
                    marginBottom: '8px'
                  }}>
                    {rec.brand}
                  </p>
                </div>
                <div style={{
                  backgroundColor: `rgba(${rec.confidence > 80 ? '16, 185, 129' : rec.confidence > 60 ? '245, 158, 11' : '239, 68, 68'}, 0.2)`,
                  color: rec.confidence > 80 ? '#10B981' : rec.confidence > 60 ? '#F59E0B' : '#EF4444',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {rec.confidence}% 일치
                </div>
              </div>

              <p style={{ 
                fontSize: '14px', 
                color: '#D1D5DB',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                {rec.reason}
              </p>

              {rec.price && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#F59E0B' 
                  }}>
                    {formatCurrency(rec.price)}원
                  </span>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3B82F6',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                    }}
                  >
                    위시리스트 추가
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 