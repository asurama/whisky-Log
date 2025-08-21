// 예측 분석 유틸리티
export interface PredictionData {
  nextPurchaseRecommendation: {
    brand: string;
    confidence: number;
    reason: string;
  };
  consumptionForecast: {
    monthlyAverage: number;
    nextMonthPrediction: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  budgetRecommendation: {
    suggestedBudget: number;
    confidence: number;
    reasoning: string;
  };
  collectionGap: {
    missingCategories: string[];
    recommendations: string[];
  };
}

export class PredictionAnalyzer {
  // 다음 구매 추천
  static predictNextPurchase(bottles: any[], tastings: any[]): PredictionData['nextPurchaseRecommendation'] {
    // 사용자의 선호도 분석
    const brandPreferences = this.analyzeBrandPreferences(bottles, tastings);
    const pricePreferences = this.analyzePricePreferences(bottles);
    const ratingPreferences = this.analyzeRatingPreferences(tastings);

    // 가장 높은 선호도를 가진 브랜드 찾기
    const topBrand = brandPreferences[0];
    
    return {
      brand: topBrand?.brand || 'Macallan',
      confidence: Math.min(topBrand?.score || 0.7, 0.95),
      reason: `과거 구매 패턴과 평점을 기반으로 ${topBrand?.brand} 브랜드를 추천합니다.`
    };
  }

  // 소비량 예측
  static predictConsumption(tastings: any[]): PredictionData['consumptionForecast'] {
    if (tastings.length === 0) {
      return {
        monthlyAverage: 0,
        nextMonthPrediction: 0,
        trend: 'stable'
      };
    }

    // 월별 소비량 계산
    const monthlyConsumption = this.calculateMonthlyConsumption(tastings);
    
    if (monthlyConsumption.length < 2) {
      return {
        monthlyAverage: monthlyConsumption[0]?.volume || 0,
        nextMonthPrediction: monthlyConsumption[0]?.volume || 0,
        trend: 'stable'
      };
    }

    // 평균 소비량
    const totalVolume = monthlyConsumption.reduce((sum, month) => sum + month.volume, 0);
    const monthlyAverage = totalVolume / monthlyConsumption.length;

    // 트렌드 분석
    const recentMonths = monthlyConsumption.slice(-3);
    const trend = this.analyzeTrend(recentMonths);

    // 다음 달 예측 (간단한 선형 회귀)
    const nextMonthPrediction = this.predictNextMonth(recentMonths);

    return {
      monthlyAverage: Math.round(monthlyAverage),
      nextMonthPrediction: Math.round(nextMonthPrediction),
      trend
    };
  }

  // 예산 추천
  static predictBudget(bottles: any[], wishlist: any[]): PredictionData['budgetRecommendation'] {
    const recentPurchases = bottles
      .filter(bottle => {
        const purchaseDate = new Date(bottle.created_at);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return purchaseDate >= threeMonthsAgo;
      });

    const totalRecentSpending = recentPurchases.reduce((sum, bottle) => 
      sum + (bottle.purchase_price || 0), 0
    );

    const monthlyAverage = totalRecentSpending / 3;
    const suggestedBudget = Math.round(monthlyAverage * 1.2); // 20% 증가

    return {
      suggestedBudget,
      confidence: 0.8,
      reasoning: `최근 3개월 평균 지출 ${Math.round(monthlyAverage).toLocaleString()}원을 기반으로 월 ${suggestedBudget.toLocaleString()}원을 추천합니다.`
    };
  }

  // 컬렉션 갭 분석
  static analyzeCollectionGap(bottles: any[], tastings: any[]): PredictionData['collectionGap'] {
    const missingCategories: string[] = [];
    const recommendations: string[] = [];

    // 지역별 분석
    const regions = this.getRegions(bottles);
    if (!regions.includes('Scotland')) {
      missingCategories.push('스코틀랜드 위스키');
      recommendations.push('Macallan, Glenfiddich, Balvenie 등 스코틀랜드 위스키 추가');
    }
    if (!regions.includes('Japan')) {
      missingCategories.push('일본 위스키');
      recommendations.push('Yamazaki, Nikka, Hakushu 등 일본 위스키 추가');
    }
    if (!regions.includes('USA')) {
      missingCategories.push('미국 위스키');
      recommendations.push('Bourbon, Rye 위스키 추가');
    }

    // 가격대별 분석
    const priceRanges = this.getPriceRanges(bottles);
    if (!priceRanges.includes('premium')) {
      missingCategories.push('프리미엄 위스키');
      recommendations.push('고급 위스키로 컬렉션 업그레이드');
    }

    // 연령별 분석
    const ageRanges = this.getAgeRanges(bottles);
    if (!ageRanges.includes('aged')) {
      missingCategories.push('숙성 위스키');
      recommendations.push('15년 이상 숙성된 위스키 추가');
    }

    return {
      missingCategories,
      recommendations
    };
  }

  // 브랜드 선호도 분석
  private static analyzeBrandPreferences(bottles: any[], tastings: any[]): Array<{brand: string, score: number}> {
    const brandScores: { [key: string]: number } = {};

    // 구매 빈도
    bottles.forEach(bottle => {
      const brand = bottle.brands?.name || bottle.custom_brand || 'Unknown';
      brandScores[brand] = (brandScores[brand] || 0) + 1;
    });

    // 평점 가중치
    tastings.forEach(tasting => {
      if (tasting.overall_rating && tasting.bottles?.brands?.name) {
        const brand = tasting.bottles.brands.name;
        brandScores[brand] = (brandScores[brand] || 0) + (tasting.overall_rating / 10);
      }
    });

    return Object.entries(brandScores)
      .map(([brand, score]) => ({ brand, score }))
      .sort((a, b) => b.score - a.score);
  }

  // 가격 선호도 분석
  private static analyzePricePreferences(bottles: any[]): { min: number, max: number, average: number } {
    const prices = bottles
      .filter(b => b.purchase_price)
      .map(b => b.purchase_price);

    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  }

  // 평점 선호도 분석
  private static analyzeRatingPreferences(tastings: any[]): { average: number, trend: string } {
    const ratings = tastings
      .filter(t => t.overall_rating)
      .map(t => t.overall_rating);

    if (ratings.length === 0) {
      return { average: 0, trend: 'stable' };
    }

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    // 최근 평점 트렌드
    const recentRatings = tastings
      .filter(t => t.overall_rating && t.tasting_date)
      .sort((a, b) => new Date(b.tasting_date).getTime() - new Date(a.tasting_date).getTime())
      .slice(0, 5)
      .map(t => t.overall_rating);

    const recentAverage = recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length;
    
    let trend = 'stable';
    if (recentAverage > average + 0.5) trend = 'improving';
    else if (recentAverage < average - 0.5) trend = 'declining';

    return { average, trend };
  }

  // 월별 소비량 계산
  private static calculateMonthlyConsumption(tastings: any[]): Array<{month: string, volume: number}> {
    const monthlyData: { [key: string]: number } = {};
    
    tastings.forEach(tasting => {
      if (tasting.tasting_date && tasting.consumed_volume_ml) {
        const date = new Date(tasting.tasting_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + tasting.consumed_volume_ml;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, volume]) => ({ month, volume }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // 트렌드 분석
  private static analyzeTrend(months: Array<{month: string, volume: number}>): 'increasing' | 'decreasing' | 'stable' {
    if (months.length < 2) return 'stable';

    const volumes = months.map(m => m.volume);
    const firstHalf = volumes.slice(0, Math.ceil(volumes.length / 2));
    const secondHalf = volumes.slice(Math.ceil(volumes.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  // 다음 달 예측
  private static predictNextMonth(months: Array<{month: string, volume: number}>): number {
    if (months.length < 2) return months[0]?.volume || 0;

    // 간단한 선형 회귀
    const n = months.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = months.reduce((sum, _, i) => sum + months[i].volume, 0);
    const sumXY = months.reduce((sum, _, i) => sum + (i * months[i].volume), 0);
    const sumX2 = months.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return Math.max(0, slope * n + intercept);
  }

  // 지역 분석
  private static getRegions(bottles: any[]): string[] {
    const regions = bottles
      .map(bottle => bottle.brands?.country)
      .filter(region => region)
      .filter((region, index, arr) => arr.indexOf(region) === index);
    
    return regions;
  }

  // 가격대 분석
  private static getPriceRanges(bottles: any[]): string[] {
    const ranges: string[] = [];
    const prices = bottles.map(b => b.purchase_price).filter(p => p);

    if (prices.some(p => p > 200000)) ranges.push('premium');
    if (prices.some(p => p > 100000 && p <= 200000)) ranges.push('mid-range');
    if (prices.some(p => p <= 100000)) ranges.push('entry-level');

    return ranges;
  }

  // 연령대 분석
  private static getAgeRanges(bottles: any[]): string[] {
    const ranges: string[] = [];
    const ages = bottles.map(b => b.age_years).filter(a => a);

    if (ages.some(a => a >= 15)) ranges.push('aged');
    if (ages.some(a => a >= 10 && a < 15)) ranges.push('mature');
    if (ages.some(a => a < 10)) ranges.push('young');

    return ranges;
  }
} 