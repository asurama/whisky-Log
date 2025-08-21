'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';

interface StatsData {
  totalBottles: number;
  totalTastings: number;
  totalWishlist: number;
  averageRating: number;
  totalValue: number;
  topBrands: Array<{ name: string; count: number; totalValue: number }>;
  topRatedBottles: Array<{ name: string; rating: number; brand: string }>;
  recentTastings: Array<{ name: string; date: string; rating: number }>;
  priceDistribution: Array<{ range: string; count: number }>;
  monthlyConsumption: Array<{ month: string; volume: number }>;
  regionStats: Array<{ region: string; count: number; avgRating: number }>;
  ageDistribution: Array<{ age: string; count: number }>;
  abvDistribution: Array<{ abv: string; count: number }>;
  vintageAnalysis: Array<{ year: string; count: number; avgPrice: number }>;
}

export default function AdvancedStatistics({ user, brands }: { user: any; brands?: any[] }) {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, 1month, 3months, 6months, 1year
  const [selectedView, setSelectedView] = useState('overview'); // overview, trends, insights
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAdvancedStatistics();
    }
  }, [user, selectedPeriod]);

  const fetchAdvancedStatistics = async () => {
    setLoading(true);
    try {
      const [bottlesResult, tastingsResult, wishlistResult] = await Promise.all([
        supabase.from('bottles').select(`
          *,
          brands (name)
        `).eq('user_id', user.id),
        supabase.from('tastings').select(`
          *,
          bottles (
            name,
            brands (name),
            custom_brand
          )
        `).eq('user_id', user.id),
        supabase.from('wishlist').select('*').eq('user_id', user.id)
      ]);

      if (bottlesResult.error) throw bottlesResult.error;
      if (tastingsResult.error) throw tastingsResult.error;
      if (wishlistResult.error) throw wishlistResult.error;

      const bottles = bottlesResult.data || [];
      const tastings = tastingsResult.error ? [] : tastingsResult.data || [];
      const wishlist = wishlistResult.data || [];

      // 기간 필터링
      const filteredData = filterDataByPeriod(bottles, tastings, wishlist, selectedPeriod);
      
      const stats = calculateAdvancedStatistics(filteredData);
      setStatsData(stats);
    } catch (error) {
      console.error('통계 데이터 가져오기 실패:', error);
      showToast('통계 데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPeriod = (bottles: any[], tastings: any[], wishlist: any[], period: string) => {
    const now = new Date();
    let cutoffDate: Date;

    switch (period) {
      case '1month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return { bottles, tastings, wishlist };
    }

    const filteredBottles = bottles.filter(bottle => 
      new Date(bottle.created_at) >= cutoffDate
    );
    const filteredTastings = tastings.filter(tasting => 
      new Date(tasting.tasting_date) >= cutoffDate
    );
    const filteredWishlist = wishlist.filter(item => 
      new Date(item.created_at) >= cutoffDate
    );

    return { bottles: filteredBottles, tastings: filteredTastings, wishlist: filteredWishlist };
  };

  const calculateAdvancedStatistics = (data: any): StatsData => {
    const { bottles, tastings, wishlist } = data;

    // 기본 통계
    const totalBottles = bottles.length;
    const totalTastings = tastings.length;
    const totalWishlist = wishlist.length;
    
    // 평균 평점
    const ratings = tastings
      .filter((t: any) => t.overall_rating)
      .map((t: any) => t.overall_rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 0;

    // 총 가치
    const totalValue = bottles
      .filter((b: any) => b.purchase_price)
      .reduce((sum: number, bottle: any) => sum + (bottle.purchase_price || 0), 0);

    // 상위 브랜드
    const brandStats = bottles.reduce((acc: any, bottle: any) => {
      // 브랜드명 우선순위: brands.name > custom_brand > '기타'
      let brandName = '기타';
      if (bottle.brands?.name) {
        brandName = bottle.brands.name;
      } else if (bottle.custom_brand && bottle.custom_brand.trim()) {
        brandName = bottle.custom_brand.trim();
      }
      
      if (!acc[brandName]) {
        acc[brandName] = { count: 0, totalValue: 0 };
      }
      acc[brandName].count++;
      acc[brandName].totalValue += bottle.purchase_price || 0;
      return acc;
    }, {});

    const topBrands = Object.entries(brandStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        count: stats.count,
        totalValue: stats.totalValue
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // 상위 평점 보틀
    const topRatedBottles = tastings
      .filter((t: any) => t.overall_rating && t.bottles?.name)
      .map((t: any) => {
        // 브랜드명 우선순위: brands.name > custom_brand > '기타'
        let brandName = '기타';
        if (t.bottles.brands?.name) {
          brandName = t.bottles.brands.name;
        } else if (t.bottles.custom_brand && t.bottles.custom_brand.trim()) {
          brandName = t.bottles.custom_brand.trim();
        }
        
        return {
          name: t.bottles.name,
          rating: t.overall_rating,
          brand: brandName
        };
      })
      .sort((a: any, b: any) => b.rating - a.rating)
      .slice(0, 5);

    // 최근 시음
    const recentTastings = tastings
      .filter((t: any) => t.tasting_date)
      .map((t: any) => ({
        name: t.bottles?.name || t.bottle_name || 'Unknown',
        date: t.tasting_date,
        rating: t.overall_rating || 0
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // 가격 분포
    const priceRanges = [
      { min: 0, max: 50000, label: '5만원 이하' },
      { min: 50000, max: 100000, label: '5-10만원' },
      { min: 100000, max: 200000, label: '10-20만원' },
      { min: 200000, max: 500000, label: '20-50만원' },
      { min: 500000, max: Infinity, label: '50만원 이상' }
    ];

    const priceDistribution = priceRanges.map(range => ({
      range: range.label,
      count: bottles.filter((b: any) => 
        b.purchase_price && 
        b.purchase_price >= range.min && 
        b.purchase_price < range.max
      ).length
    }));

    // 월별 소비량
    const monthlyConsumption = calculateMonthlyConsumption(tastings);

    // 지역별 통계 (브랜드 국가 기준)
    const regionStats = calculateRegionStats(bottles);

    // 연령 분포
    const ageDistribution = calculateAgeDistribution(bottles);

    // 도수 분포
    const abvDistribution = calculateAbvDistribution(bottles);

    // 빈티지 분석
    const vintageAnalysis = calculateVintageAnalysis(bottles);

    return {
      totalBottles,
      totalTastings,
      totalWishlist,
      averageRating: Math.round(averageRating * 10) / 10,
      totalValue,
      topBrands,
      topRatedBottles,
      recentTastings,
      priceDistribution,
      monthlyConsumption,
      regionStats,
      ageDistribution,
      abvDistribution,
      vintageAnalysis
    };
  };

  const calculateMonthlyConsumption = (tastings: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    tastings.forEach((tasting: any) => {
      if (tasting.tasting_date && tasting.consumed_volume_ml) {
        const date = new Date(tasting.tasting_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + tasting.consumed_volume_ml;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, volume]) => ({ month, volume }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 최근 6개월
  };

  const calculateRegionStats = (bottles: any[]) => {
    const regionData: { [key: string]: { count: number; ratings: number[] } } = {};
    
    bottles.forEach((bottle: any) => {
      // 브랜드 국가 정보가 있다면 사용, 없으면 기본값
      const region = bottle.brands?.country || 'Unknown';
      if (!regionData[region]) {
        regionData[region] = { count: 0, ratings: [] };
      }
      regionData[region].count++;
    });

    return Object.entries(regionData)
      .map(([region, data]) => ({
        region,
        count: data.count,
        avgRating: data.ratings.length > 0 
          ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length 
          : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateAgeDistribution = (bottles: any[]) => {
    const ageRanges = [
      { min: 0, max: 3, label: '3년 이하' },
      { min: 3, max: 5, label: '3-5년' },
      { min: 5, max: 10, label: '5-10년' },
      { min: 10, max: 15, label: '10-15년' },
      { min: 15, max: Infinity, label: '15년 이상' }
    ];

    return ageRanges.map(range => ({
      age: range.label,
      count: bottles.filter(b => 
        b.age_years && 
        b.age_years >= range.min && 
        b.age_years < range.max
      ).length
    }));
  };

  const calculateAbvDistribution = (bottles: any[]) => {
    const abvRanges = [
      { min: 0, max: 40, label: '40% 이하' },
      { min: 40, max: 43, label: '40-43%' },
      { min: 43, max: 46, label: '43-46%' },
      { min: 46, max: 50, label: '46-50%' },
      { min: 50, max: Infinity, label: '50% 이상' }
    ];

    return abvRanges.map(range => ({
      abv: range.label,
      count: bottles.filter(b => 
        b.abv && 
        b.abv >= range.min && 
        b.abv < range.max
      ).length
    }));
  };

  const calculateVintageAnalysis = (bottles: any[]) => {
    const vintageData: { [key: string]: { count: number; totalPrice: number } } = {};
    
    bottles.forEach((bottle: any) => {
      if (bottle.vintage) {
        const year = bottle.vintage.toString();
        if (!vintageData[year]) {
          vintageData[year] = { count: 0, totalPrice: 0 };
        }
        vintageData[year].count++;
        vintageData[year].totalPrice += bottle.purchase_price || 0;
      }
    });

    return Object.entries(vintageData)
      .map(([year, data]) => ({
        year,
        count: data.count,
        avgPrice: data.totalPrice / data.count
      }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, 10); // 최근 10년
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#9CA3AF'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>📊</div>
        통계를 계산하고 있습니다...
      </div>
    );
  }

  if (!statsData) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#9CA3AF'
      }}>
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          📊 고급 통계 및 분석
        </h2>
        
        {/* 기간 선택 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'all', label: '전체' },
            { value: '1month', label: '1개월' },
            { value: '3months', label: '3개월' },
            { value: '6months', label: '6개월' },
            { value: '1year', label: '1년' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedPeriod === period.value ? '#3B82F6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 뷰 선택 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {[
          { value: 'overview', label: '개요', icon: '📈' },
          { value: 'trends', label: '트렌드', icon: '📊' },
          { value: 'insights', label: '인사이트', icon: '💡' }
        ].map(view => (
          <button
            key={view.value}
            onClick={() => setSelectedView(view.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedView === view.value ? '#10B981' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>

      {/* 개요 뷰 */}
      {selectedView === 'overview' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* 주요 지표 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#374151',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥃</div>
              <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                {statsData.totalBottles}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>총 보틀</div>
            </div>
            
            <div style={{
              backgroundColor: '#374151',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍷</div>
              <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                {statsData.totalTastings}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>총 시음</div>
            </div>
            
            <div style={{
              backgroundColor: '#374151',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                {statsData.averageRating}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>평균 평점</div>
            </div>
            
            <div style={{
              backgroundColor: '#374151',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                {formatCurrency(statsData.totalValue)}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>총 가치</div>
            </div>
          </div>

          {/* 상위 브랜드 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🏆 상위 브랜드
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.topBrands.map((brand, index) => (
                <div key={brand.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: index < 3 ? '#F59E0B' : '#6B7280',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontWeight: '500' }}>{brand.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>
                      {brand.count}개
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {formatCurrency(brand.totalValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 상위 평점 보틀 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              ⭐ 상위 평점 보틀
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.topRatedBottles.map((bottle, index) => (
                <div key={bottle.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {bottle.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {bottle.brand}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {bottle.rating}점
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 트렌드 뷰 */}
      {selectedView === 'trends' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* 월별 소비량 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              📈 월별 소비량
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.monthlyConsumption.map(item => (
                <div key={item.month} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.month}</span>
                  <span style={{ fontWeight: '600' }}>
                    {item.volume}ml
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 가격 분포 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              💰 가격 분포
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.priceDistribution.map(item => (
                <div key={item.range} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.range}</span>
                  <span style={{ fontWeight: '600' }}>
                    {item.count}개
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 연령 분포 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🕰️ 연령 분포
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.ageDistribution.map(item => (
                <div key={item.age} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.age}</span>
                  <span style={{ fontWeight: '600' }}>
                    {item.count}개
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 인사이트 뷰 */}
      {selectedView === 'insights' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* 지역별 통계 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🌍 지역별 통계
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.regionStats.map(item => (
                <div key={item.region} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.region}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600' }}>
                      {item.count}개
                    </div>
                    {item.avgRating > 0 && (
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        평균 {item.avgRating.toFixed(1)}점
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 도수 분포 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🍶 도수 분포
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.abvDistribution.map(item => (
                <div key={item.abv} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.abv}</span>
                  <span style={{ fontWeight: '600' }}>
                    {item.count}개
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 빈티지 분석 */}
          <div style={{
            backgroundColor: '#374151',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🍇 빈티지 분석
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {statsData.vintageAnalysis.map(item => (
                <div key={item.year} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  borderRadius: '8px'
                }}>
                  <span>{item.year}년</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600' }}>
                      {item.count}개
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      평균 {formatCurrency(item.avgPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 