// 사용자 타입
export interface User {
  id: string;
  email: string | undefined;
  created_at: string;
}

// 브랜드 타입
export interface Brand {
  id: string;
  name: string;
  country?: string | null;
  region?: string | null;
  description?: string;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

// 위스키 병 타입
export interface Bottle {
  id: string;
  user_id: string;
  name: string;
  brand_id: string | null;
  custom_brand?: string;
  vintage?: number;
  age_years?: number;
  abv?: number;
  retail_price?: number;
  purchase_price?: number;
  discount_rate?: number;
  purchase_location?: string;
  purchase_date?: string;
  bottle_status: 'unopened' | 'opened' | 'empty';
  total_volume_ml: number;
  remaining_volume_ml: number;
  image_url?: string;
  notes?: string;
  type?: string;
  whiskybase_rating?: number;
  cask_type?: string;
  bottled_year?: number;
  description?: string;
  whiskybase_url?: string;
  created_at: string;
  updated_at: string;
  brands?: Brand;
}

// 시음 기록 타입
export interface Tasting {
  id: string;
  user_id: string;
  bottle_id?: string;
  bottle_name?: string;
  bottle_brand?: string;
  tasting_type: 'bar' | 'bottle' | 'event' | 'other';
  tasting_date: string;
  tasting_time?: string;
  location?: string;
  consumed_volume_ml?: number;
  nose_rating?: number;
  palate_rating?: number;
  finish_rating?: number;
  overall_rating?: number;
  nose_notes?: string;
  palate_notes?: string;
  finish_notes?: string;
  additional_notes?: string;
  companions?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  bottles?: Bottle;
}

// 위시리스트 타입
export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  brand_id?: string;
  custom_brand?: string;
  vintage?: number;
  age_years?: number;
  abv?: number;
  retail_price?: number;
  purchase_price?: number;
  discount_rate?: number;
  total_volume_ml?: number;
  purchase_location?: string;
  purchase_date?: string;
  priority: 1 | 2 | 3; // 1: 낮음, 2: 보통, 3: 높음
  status: 'wishlist' | 'purchased' | 'removed';
  notes?: string;
  created_at: string;
  updated_at: string;
  brands?: Brand;
}

// Whiskybase 데이터 타입
export interface WhiskybaseData {
  id: string;
  name: string;
  brand: string;
  vintage?: number;
  age_years?: number;
  abv?: number;
  rating?: number;
  region?: string;
  type?: string;
  cask_type?: string;
  bottled_year?: number;
  description?: string;
  url?: string;
  created_at: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// 검색 결과 타입
export interface SearchResult {
  id: string;
  name: string;
  brand: string;
  vintage?: number;
  age_years?: number;
  abv?: number;
  rating?: number;
  type?: string;
  region?: string;
  url?: string;
}

// 통계 데이터 타입
export interface Statistics {
  totalBottles: number;
  totalTastings: number;
  averageRating: number;
  totalValue: number;
  topBrands: Array<{ name: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  monthlyTastings: Array<{ month: string; count: number }>;
}

// 이미지 업로드 타입
export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
}

// 폼 데이터 타입
export interface BottleFormData {
  name: string;
  brand_id: string;
  custom_brand: string;
  vintage: string;
  age_years: string;
  retail_price: string;
  purchase_price: string;
  discount_rate: string;
  purchase_location: string;
  purchase_date: string;
  total_volume_ml: string;
  remaining_volume_ml: string;
  notes: string;
  abv: string;
  type: string;
  whiskybase_rating: string;
  cask_type: string;
  bottled_year: string;
  description: string;
  whiskybase_url: string;
}

export interface TastingFormData {
  bottle_name: string;
  tasting_type: string;
  tasting_date: string;
  tasting_time: string;
  location: string;
  consumed_volume_ml: string;
  nose_rating: string;
  palate_rating: string;
  finish_rating: string;
  overall_rating: string;
  nose_notes: string;
  palate_notes: string;
  finish_notes: string;
  additional_notes: string;
  companions: string;
  image_url: string;
}

export interface WishlistFormData {
  name: string;
  brand_id: string;
  custom_brand: string;
  vintage: string;
  age_years: string;
  retail_price: string;
  total_volume_ml: string;
  purchase_location: string;
  priority: string;
  notes: string;
  abv: string;
}

export interface BrandFormData {
  name: string;
  country: string;
  region: string;
  description: string;
}

// 컴포넌트 Props 타입
export interface ModalProps {
  onClose: () => void;
}

export interface UserProps {
  user: User;
}

export interface BrandsProps {
  brands: Brand[];
}

export interface BottleProps {
  bottle: Bottle;
}

export interface TastingProps {
  tasting: Tasting;
}

// 이벤트 핸들러 타입
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 