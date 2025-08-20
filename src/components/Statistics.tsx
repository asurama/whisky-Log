'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';

interface StatisticsProps {
  user: any;
}

interface StatsData {
  totalBottles: number;
  totalTastings: number;
  totalBrands: number;
  totalWishlist: number;
  averageRating: number;
  totalValue: number;
  openedBottles: number;
  unopenedBottles: number;
  topBrands: Array<{ name: string; count: number }>;
  topRatedBottles: Array<{ name: string; rating: number }>;
  recentTastings: Array<{ name: string; date: string; rating: number }>;
  priceDistribution: {
    under50k: number;
    under100k: number;
    under200k: number;
    over200k: number;
  };
}

export default function Statistics({ user }: StatisticsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // 위스키 데이터
      const { data: bottles } = await supabase
        .from('bottles')
        .select('*')
        .eq('user_id', user.id);

      // 시음 기록
      const { data: tastings } = await supabase
        .from('tastings')
        .select('*')
        .eq('user_id', user.id);

      // 브랜드 데이터
      const { data: brands } = await supabase
        .from('brands')
        .select('*');

      // 위시리스트
      const { data: wishlist } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (bottles && tastings && brands && wishlist) {
        const statsData = calculateStatistics(bottles, tastings, brands, wishlist);
        setStats(statsData);
      }
    } catch (error) {
      console.error('통계 로딩 오류:', error);
      showToast('통계를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (bottles: any[], tastings: any[], brands: any[], wishlist: any[]): StatsData => {
    // 브랜드별 개수
    const brandCounts = bottles.reduce((acc: any, bottle) => {
      const brandName = bottle.brand_id ? 
        brands.find(b => b.id === bottle.brand_id)?.name || '기타' : 
        bottle.custom_brand || '기타';
      acc[brandName] = (acc[brandName] || 0) + 1;
      return acc;
    }, {});

    const topBrands = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 평점이 있는 시음 기록
    const ratedTastings = tastings.filter((t: any) => t.rating);
    const averageRating = ratedTastings.length > 0 
      ? ratedTastings.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / ratedTastings.length 
      : 0;

    // 최고 평점 위스키
    const bottleRatings = tastings.reduce((acc: Record<string, number[]>, tasting: any) => {
      if (tasting.rating && tasting.bottle_name) {
        if (!acc[tasting.bottle_name]) {
          acc[tasting.bottle_name] = [];
        }
        acc[tasting.bottle_name].push(tasting.rating);
      }
      return acc;
    }, {});

    const topRatedBottles = Object.entries(bottleRatings)
      .map(([name, ratings]) => ({
        name,
        rating: (ratings as number[]).reduce((sum, r) => sum + r, 0) / (ratings as number[]).length
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // 최근 시음 기록
    const recentTastings = tastings
      .filter((t: any) => t.tasting_date)
      .sort((a: any, b: any) => new Date(b.tasting_date).getTime() - new Date(a.tasting_date).getTime())
      .slice(0, 5)
      .map((t: any) => ({
        name: t.bottle_name || '기타',
        date: t.tasting_date,
        rating: t.rating || 0
      }));

    // 가격 분포
    const priceDistribution = bottles.reduce((acc: { under50k: number; under100k: number; under200k: number; over200k: number }, bottle: any) => {
      const price = bottle.purchase_price || bottle.retail_price || 0;
      if (price < 50000) acc.under50k++;
      else if (price < 100000) acc.under100k++;
      else if (price < 200000) acc.under200k++;
      else acc.over200k++;
      return acc;
    }, { under50k: 0, under100k: 0, under200k: 0, over200k: 0 });

    return {
      totalBottles: bottles.length,
      totalTastings: tastings.length,
      totalBrands: new Set(bottles.map((b: any) => b.brand_id || b.custom_brand)).size,
      totalWishlist: wishlist.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalValue: bottles.reduce((sum: number, b: any) => sum + (b.purchase_price || b.retail_price || 0), 0),
      openedBottles: bottles.filter((b: any) => b.bottle_status === 'opened').length,
      unopenedBottles: bottles.filter((b: any) => b.bottle_status === 'unopened').length,
      topBrands,
      topRatedBottles,
      recentTastings,
      priceDistribution
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          통계를 계산하는 중...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>
        통계 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
        📊 컬렉션 통계
      </h2>

      {/* 주요 지표 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3B82F6', marginBottom: '8px' }}>
            {stats.totalBottles}
          </div>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>총 위스키</div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>
            {stats.totalTastings}
          </div>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>총 시음 기록</div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B', marginBottom: '8px' }}>
            {stats.averageRating}
          </div>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>평균 평점</div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8B5CF6', marginBottom: '8px' }}>
            {formatCurrency(stats.totalValue)}
          </div>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>총 가치</div>
        </div>
      </div>

      {/* 상세 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* 브랜드별 분포 */}
        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            🏷️ 인기 브랜드
          </h3>
          {stats.topBrands.map((brand, index) => (
            <div key={brand.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < stats.topBrands.length - 1 ? '1px solid #374151' : 'none'
            }}>
              <span style={{ color: '#D1D5DB' }}>{brand.name}</span>
              <span style={{ color: '#9CA3AF', fontWeight: '600' }}>{brand.count}개</span>
            </div>
          ))}
        </div>

        {/* 최고 평점 위스키 */}
        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            ⭐ 최고 평점
          </h3>
          {stats.topRatedBottles.map((bottle, index) => (
            <div key={bottle.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < stats.topRatedBottles.length - 1 ? '1px solid #374151' : 'none'
            }}>
              <span style={{ color: '#D1D5DB' }}>{bottle.name}</span>
              <span style={{ color: '#F59E0B', fontWeight: '600' }}>{bottle.rating}점</span>
            </div>
          ))}
        </div>

        {/* 최근 시음 기록 */}
        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            🍷 최근 시음
          </h3>
          {stats.recentTastings.map((tasting, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < stats.recentTastings.length - 1 ? '1px solid #374151' : 'none'
            }}>
              <div>
                <div style={{ color: '#D1D5DB', fontSize: '14px' }}>{tasting.name}</div>
                <div style={{ color: '#6B7280', fontSize: '12px' }}>{formatDate(tasting.date)}</div>
              </div>
              <span style={{ color: '#F59E0B', fontWeight: '600' }}>{tasting.rating}점</span>
            </div>
          ))}
        </div>

        {/* 가격 분포 */}
        <div style={{
          backgroundColor: '#1F2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            💰 가격 분포
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#D1D5DB' }}>5만원 미만</span>
              <span style={{ color: '#9CA3AF' }}>{stats.priceDistribution.under50k}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#D1D5DB' }}>5-10만원</span>
              <span style={{ color: '#9CA3AF' }}>{stats.priceDistribution.under100k}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#D1D5DB' }}>10-20만원</span>
              <span style={{ color: '#9CA3AF' }}>{stats.priceDistribution.under200k}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#D1D5DB' }}>20만원 이상</span>
              <span style={{ color: '#9CA3AF' }}>{stats.priceDistribution.over200k}개</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 