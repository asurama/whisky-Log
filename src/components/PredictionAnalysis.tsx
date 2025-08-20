'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';

interface TasteAnalysis {
  favoriteBrands: Array<{ name: string; count: number; avgRating: number }>;
  favoriteRegions: Array<{ region: string; count: number; avgRating: number }>;
  pricePreference: { min: number; max: number; average: number; range: string };
  agePreference: { min: number; max: number; average: number; range: string };
  abvPreference: { min: number; max: number; average: number; range: string };
  tastingNotes: Array<{ note: string; frequency: number }>;
  consumptionPattern: { monthly: number; weekly: number; preferredTime: string };
  stylePreference: { smoky: number; sweet: number; spicy: number; fruity: number };
  overallTaste: string;
}

export default function TasteAnalysis({ user, brands }: { user: any; brands?: any[] }) {
  const [tasteData, setTasteData] = useState<TasteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTasteData();
    }
  }, [user]);

  const fetchTasteData = async () => {
    setLoading(true);
    try {
      const [bottlesResult, tastingsResult] = await Promise.all([
        supabase.from('bottles').select(`
          *,
          brands (name, region)
        `).eq('user_id', user.id),
        supabase.from('tastings').select(`
          *,
          bottles (
            name,
            brands (name, region),
            custom_brand
          )
        `).eq('user_id', user.id)
      ]);

      if (bottlesResult.error) throw bottlesResult.error;
      if (tastingsResult.error) throw tastingsResult.error;

      const bottles = bottlesResult.data || [];
      const tastings = tastingsResult.data || [];

      const analysis = analyzeTaste(bottles, tastings);
      setTasteData(analysis);
    } catch (error) {
      console.error('취향 분석 데이터 가져오기 실패:', error);
      showToast('취향 분석 데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeTaste = (bottles: any[], tastings: any[]): TasteAnalysis => {
    // 선호 브랜드 분석
    const brandStats = bottles.reduce((acc: any, bottle) => {
      const brandName = bottle.brands?.name || bottle.custom_brand || '기타';
      if (!acc[brandName]) {
        acc[brandName] = { count: 0, totalRating: 0, ratingCount: 0 };
      }
      acc[brandName].count++;
      return acc;
    }, {});

    // 시음 기록에서 브랜드 평점 추가
    tastings.forEach((tasting: any) => {
      if (tasting.overall_rating && tasting.bottles?.brands?.name) {
        const brandName = tasting.bottles.brands.name;
        if (brandStats[brandName]) {
          brandStats[brandName].totalRating += tasting.overall_rating;
          brandStats[brandName].ratingCount++;
        }
      }
    });

    const favoriteBrands = Object.entries(brandStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        count: stats.count,
        avgRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 선호 지역 분석
    const regionStats = bottles.reduce((acc: any, bottle) => {
      const region = bottle.brands?.region || '기타';
      if (!acc[region]) {
        acc[region] = { count: 0, totalRating: 0, ratingCount: 0 };
      }
      acc[region].count++;
      return acc;
    }, {});

    tastings.forEach((tasting: any) => {
      if (tasting.overall_rating && tasting.bottles?.brands?.region) {
        const region = tasting.bottles.brands.region;
        if (regionStats[region]) {
          regionStats[region].totalRating += tasting.overall_rating;
          regionStats[region].ratingCount++;
        }
      }
    });

    const favoriteRegions = Object.entries(regionStats)
      .map(([region, stats]: [string, any]) => ({
        region,
        count: stats.count,
        avgRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 가격 선호도 분석
    const prices = bottles
      .filter((b: any) => b.purchase_price)
      .map((b: any) => b.purchase_price);
    
    const pricePreference = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      range: getPriceRange(prices.reduce((sum, price) => sum + price, 0) / prices.length)
    };

    // 숙성 연도 선호도 분석
    const ages = bottles
      .filter((b: any) => b.age_years)
      .map((b: any) => b.age_years);
    
    const agePreference = {
      min: Math.min(...ages),
      max: Math.max(...ages),
      average: ages.reduce((sum, age) => sum + age, 0) / ages.length,
      range: getAgeRange(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    };

    // 도수 선호도 분석
    const abvs = bottles
      .filter((b: any) => b.abv)
      .map((b: any) => b.abv);
    
    const abvPreference = {
      min: Math.min(...abvs),
      max: Math.max(...abvs),
      average: abvs.reduce((sum, abv) => sum + abv, 0) / abvs.length,
      range: getAbvRange(abvs.reduce((sum, abv) => sum + abv, 0) / abvs.length)
    };

    // 시음 노트 분석
    const notes = tastings
      .filter((t: any) => t.nose_notes || t.palate_notes || t.finish_notes)
      .flatMap((t: any) => [
        ...(t.nose_notes?.split(',').map((n: string) => n.trim()) || []),
        ...(t.palate_notes?.split(',').map((n: string) => n.trim()) || []),
        ...(t.finish_notes?.split(',').map((n: string) => n.trim()) || [])
      ]);

    const noteFrequency = notes.reduce((acc: Record<string, number>, note: string) => {
      acc[note] = (acc[note] || 0) + 1;
      return acc;
    }, {});

    const tastingNotes = Object.entries(noteFrequency)
      .map(([note, frequency]) => ({ note, frequency: frequency as number }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // 소비 패턴 분석
    const monthlyConsumption = tastings.length / Math.max(1, (new Date().getTime() - new Date(bottles[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30));
    const weeklyConsumption = monthlyConsumption / 4;
    
    const consumptionPattern = {
      monthly: Math.round(monthlyConsumption * 10) / 10,
      weekly: Math.round(weeklyConsumption * 10) / 10,
      preferredTime: getPreferredTime(tastings)
    };

    // 스타일 선호도 분석 (시음 노트 기반)
    const stylePreference = {
      smoky: countStyleNotes(notes, ['스모키', '피트', '타르', '불']),
      sweet: countStyleNotes(notes, ['달콤', '바닐라', '꿀', '캐러멜']),
      spicy: countStyleNotes(notes, ['스파이시', '후추', '계피', '정향']),
      fruity: countStyleNotes(notes, ['과일', '사과', '오렌지', '베리'])
    };

    // 전체 취향 요약
    const overallTaste = generateOverallTaste(favoriteBrands, favoriteRegions, stylePreference, pricePreference);

    return {
      favoriteBrands,
      favoriteRegions,
      pricePreference,
      agePreference,
      abvPreference,
      tastingNotes,
      consumptionPattern,
      stylePreference,
      overallTaste
    };
  };

  const getPriceRange = (average: number): string => {
    if (average < 50000) return '저가형 (5만원 미만)';
    if (average < 100000) return '중저가형 (5-10만원)';
    if (average < 200000) return '중가형 (10-20만원)';
    if (average < 500000) return '중고가형 (20-50만원)';
    return '고가형 (50만원 이상)';
  };

  const getAgeRange = (average: number): string => {
    if (average < 5) return '젊은 위스키 (5년 미만)';
    if (average < 12) return '표준 위스키 (5-12년)';
    if (average < 18) return '숙성 위스키 (12-18년)';
    return '고급 위스키 (18년 이상)';
  };

  const getAbvRange = (average: number): string => {
    if (average < 40) return '저도수 (40% 미만)';
    if (average < 46) return '표준도수 (40-46%)';
    if (average < 50) return '고도수 (46-50%)';
    return '캐스크 스트렝스 (50% 이상)';
  };

  const getPreferredTime = (tastings: any[]): string => {
    const times = tastings
      .filter(t => t.tasting_time)
      .map(t => new Date(`2000-01-01T${t.tasting_time}`).getHours());
    
    if (times.length === 0) return '정보 없음';
    
    const avgHour = times.reduce((sum, hour) => sum + hour, 0) / times.length;
    
    if (avgHour < 12) return '오전';
    if (avgHour < 18) return '오후';
    return '저녁';
  };

  const countStyleNotes = (notes: string[], keywords: string[]): number => {
    return notes.filter(note => 
      keywords.some(keyword => note.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
  };

  const generateOverallTaste = (brands: any[], regions: any[], styles: any, price: any): string => {
    const topBrand = brands[0]?.name || '다양한';
    const topRegion = regions[0]?.region || '다양한';
    const priceRange = price.range.split(' ')[0];
    
    let styleDesc = '';
    const maxStyle = Math.max(styles.smoky, styles.sweet, styles.spicy, styles.fruity);
    if (styles.smoky === maxStyle) styleDesc = '스모키한';
    else if (styles.sweet === maxStyle) styleDesc = '달콤한';
    else if (styles.spicy === maxStyle) styleDesc = '스파이시한';
    else if (styles.fruity === maxStyle) styleDesc = '과일향이 나는';
    else styleDesc = '균형잡힌';

    return `${topRegion} 지역의 ${styleDesc} ${priceRange} 위스키를 선호하는 ${topBrand} 브랜드 애호가입니다.`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#9CA3AF'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎯</div>
        취향을 분석하고 있습니다...
      </div>
    );
  }

  if (!tasteData) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#9CA3AF'
      }}>
        취향 분석 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: 'white',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🎯 나의 위스키 취향 분석
      </h1>

      {/* 전체 취향 요약 */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #374151'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '16px'
        }}>
          📝 취향 요약
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#D1D5DB',
          lineHeight: '1.6'
        }}>
          {tasteData.overallTaste}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* 선호 브랜드 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            🏷️ 선호 브랜드
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tasteData.favoriteBrands.map((brand, index) => (
              <div key={brand.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: '500' }}>
                    {index + 1}. {brand.name}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {brand.count}개 보유
                  </div>
                </div>
                <div style={{ color: '#F59E0B', fontWeight: '600' }}>
                  {brand.avgRating > 0 ? `${brand.avgRating.toFixed(1)}/10` : '평점 없음'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 선호 지역 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            🌍 선호 지역
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tasteData.favoriteRegions.map((region, index) => (
              <div key={region.region} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: '500' }}>
                    {index + 1}. {region.region}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {region.count}개 보유
                  </div>
                </div>
                <div style={{ color: '#F59E0B', fontWeight: '600' }}>
                  {region.avgRating > 0 ? `${region.avgRating.toFixed(1)}/10` : '평점 없음'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 가격 선호도 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            💰 가격 선호도
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ color: '#D1D5DB' }}>
              <strong>평균 가격:</strong> {formatCurrency(tasteData.pricePreference.average)}원
            </div>
            <div style={{ color: '#D1D5DB' }}>
              <strong>가격 범위:</strong> {formatCurrency(tasteData.pricePreference.min)}원 - {formatCurrency(tasteData.pricePreference.max)}원
            </div>
            <div style={{ color: '#10B981', fontWeight: '600' }}>
              {tasteData.pricePreference.range}
            </div>
          </div>
        </div>

        {/* 숙성 연도 선호도 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            🕰️ 숙성 연도 선호도
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ color: '#D1D5DB' }}>
              <strong>평균 숙성:</strong> {tasteData.agePreference.average.toFixed(1)}년
            </div>
            <div style={{ color: '#D1D5DB' }}>
              <strong>숙성 범위:</strong> {tasteData.agePreference.min}년 - {tasteData.agePreference.max}년
            </div>
            <div style={{ color: '#10B981', fontWeight: '600' }}>
              {tasteData.agePreference.range}
            </div>
          </div>
        </div>

        {/* 스타일 선호도 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            🎨 스타일 선호도
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#D1D5DB' }}>스모키</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: i < tasteData.stylePreference.smoky ? '#F59E0B' : '#374151'
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#D1D5DB' }}>달콤</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: i < tasteData.stylePreference.sweet ? '#F59E0B' : '#374151'
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#D1D5DB' }}>스파이시</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: i < tasteData.stylePreference.spicy ? '#F59E0B' : '#374151'
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#D1D5DB' }}>과일향</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: i < tasteData.stylePreference.fruity ? '#F59E0B' : '#374151'
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 소비 패턴 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            📊 소비 패턴
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ color: '#D1D5DB' }}>
              <strong>월 평균 시음:</strong> {tasteData.consumptionPattern.monthly}회
            </div>
            <div style={{ color: '#D1D5DB' }}>
              <strong>주 평균 시음:</strong> {tasteData.consumptionPattern.weekly}회
            </div>
            <div style={{ color: '#D1D5DB' }}>
              <strong>선호 시간대:</strong> {tasteData.consumptionPattern.preferredTime}
            </div>
          </div>
        </div>
      </div>

      {/* 자주 사용하는 시음 노트 */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '24px',
        border: '1px solid #374151'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '16px'
        }}>
          📝 자주 사용하는 시음 노트
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {tasteData.tastingNotes.map((note, index) => (
            <span key={note.note} style={{
              padding: '6px 12px',
              backgroundColor: '#374151',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              border: index < 3 ? '1px solid #F59E0B' : 'none'
            }}>
              {note.note} ({note.frequency}회)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 