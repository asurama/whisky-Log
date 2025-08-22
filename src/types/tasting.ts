// 시음 기록 관련 타입 정의
export interface Tasting {
  id: string;
  user_id: string;
  bottle_id?: string;
  tasting_date: string;
  tasting_type: 'bottle' | 'bar' | 'meeting';
  nose_rating?: number;
  palate_rating?: number;
  finish_rating?: number;
  overall_rating?: number;
  nose_notes?: string;
  palate_notes?: string;
  finish_notes?: string;
  additional_notes?: string;
  location?: string;
  price?: number;
  volume_ml?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  bottles?: {
    id: string;
    name: string;
    custom_brand?: string;
    vintage?: number;
    age_years?: number;
    image_url?: string;
    brands?: {
      id: string;
      name: string;
    };
  };
  bottle_name?: string;
  bottle_brand?: string;
}

export interface TastingCardProps {
  tasting: Tasting;
  index: number;
  onCardClick: (tasting: Tasting) => void;
  onEditClick: (tasting: Tasting) => void;
  onShareClick: (tasting: Tasting) => void;
  onDeleteClick: (tastingId: string) => void;
}

export interface TastingDetailModalProps {
  selectedTasting: Tasting;
  onClose: () => void;
  onEdit: (tasting: Tasting) => void;
  onShare: (tasting: Tasting) => void;
  onDelete: (tastingId: string) => void;
}

export interface TastingListProps {
  user: any;
  brands?: any[];
  onShowTastingModal?: (tasting: any) => void;
}

export interface TastingFilters {
  searchTerm: string;
  brandFilter: string;
  priceMin: string;
  priceMax: string;
  ageMin: string;
  ageMax: string;
  statusFilter: string;
  vintageMin: string;
  vintageMax: string;
  abvMin: string;
  abvMax: string;
  ratingMin: string;
  ratingMax: string;
  regionFilter: string;
  caskTypeFilter: string;
  dateAddedMin: string;
  dateAddedMax: string;
}

export interface TastingStats {
  total: number;
  parsed: number;
  saved: number;
  errors: number;
}

// 시음 타입별 색상 매핑
export const tastingTypeColors = {
  bottle: 'rgba(245, 158, 11, 0.9)',
  bar: 'rgba(16, 185, 129, 0.9)',
  meeting: 'rgba(59, 130, 246, 0.9)'
} as const;

// 시음 타입별 라벨
export const tastingTypeLabels = {
  bottle: '보틀',
  bar: '바',
  meeting: '모임'
} as const; 