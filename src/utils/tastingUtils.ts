import { Tasting, tastingTypeColors, tastingTypeLabels } from '@/types/tasting';

// 날짜 포맷팅
export const formatTastingDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ko-KR');
};

// 평점 계산
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

// 시음 타입 색상 가져오기
export const getTastingTypeColor = (type: keyof typeof tastingTypeColors): string => {
  return tastingTypeColors[type];
};

// 시음 타입 라벨 가져오기
export const getTastingTypeLabel = (type: keyof typeof tastingTypeLabels): string => {
  return tastingTypeLabels[type];
};

// 위스키 이름 가져오기
export const getWhiskyName = (tasting: Tasting): string => {
  return tasting.bottles?.name || tasting.bottle_name || '바/모임 시음';
};

// 브랜드 이름 가져오기
export const getBrandName = (tasting: Tasting): string => {
  return tasting.bottles?.brands?.name || 
         tasting.bottles?.custom_brand || 
         tasting.bottle_brand || '';
};

// 이미지 URL 가져오기
export const getImageUrl = (tasting: Tasting): string | null => {
  return tasting.image_url || tasting.bottles?.image_url || null;
};

// 평점별 별점 개수 계산
export const getRatingStarCount = (rating: number, maxRating: number = 10): number => {
  return Math.min(Math.max(0, Math.round(rating)), maxRating);
};

// 시음 노트 텍스트 가져오기
export const getTastingNotes = (tasting: Tasting): string => {
  const notes = [];
  if (tasting.nose_notes) notes.push(`노즈: ${tasting.nose_notes}`);
  if (tasting.palate_notes) notes.push(`팔레트: ${tasting.palate_notes}`);
  if (tasting.finish_notes) notes.push(`피니시: ${tasting.finish_notes}`);
  if (tasting.additional_notes) notes.push(`추가: ${tasting.additional_notes}`);
  return notes.join('\n');
};

// 시음 기록 검증
export const validateTasting = (tasting: Partial<Tasting>): string[] => {
  const errors: string[] = [];
  
  if (!tasting.tasting_date) {
    errors.push('시음 날짜는 필수입니다.');
  }
  
  if (!tasting.tasting_type) {
    errors.push('시음 타입은 필수입니다.');
  }
  
  if (tasting.overall_rating && (tasting.overall_rating < 0 || tasting.overall_rating > 10)) {
    errors.push('종합 평점은 0-10 사이여야 합니다.');
  }
  
  return errors;
};

// 시음 기록 필터링
export const filterTastings = (
  tastings: Tasting[],
  filters: {
    searchTerm?: string;
    brandFilter?: string;
    ratingMin?: number;
    ratingMax?: number;
  }
): Tasting[] => {
  let filtered = [...tastings];

  // 검색어 필터링
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(tasting => {
      const bottleName = getWhiskyName(tasting).toLowerCase();
      const brandName = getBrandName(tasting).toLowerCase();
      const notes = getTastingNotes(tasting).toLowerCase();
      
      return bottleName.includes(term) ||
             brandName.includes(term) ||
             notes.includes(term);
    });
  }

  // 브랜드 필터링
  if (filters.brandFilter) {
    filtered = filtered.filter(tasting => {
      const brandName = getBrandName(tasting).toLowerCase();
      return brandName.includes(filters.brandFilter!.toLowerCase());
    });
  }

  // 평점 범위 필터링
  if (filters.ratingMin !== undefined || filters.ratingMax !== undefined) {
    filtered = filtered.filter(tasting => {
      const rating = tasting.overall_rating || 0;
      const min = filters.ratingMin ?? 0;
      const max = filters.ratingMax ?? Infinity;
      return rating >= min && rating <= max;
    });
  }

  return filtered;
};

// 시음 기록 정렬
export const sortTastings = (
  tastings: Tasting[],
  sortBy: 'date' | 'rating' | 'name' = 'date',
  order: 'asc' | 'desc' = 'desc'
): Tasting[] => {
  const sorted = [...tastings];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.tasting_date).getTime() - new Date(b.tasting_date).getTime();
        break;
      case 'rating':
        const ratingA = a.overall_rating || 0;
        const ratingB = b.overall_rating || 0;
        comparison = ratingA - ratingB;
        break;
      case 'name':
        const nameA = getWhiskyName(a);
        const nameB = getWhiskyName(b);
        comparison = nameA.localeCompare(nameB);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}; 