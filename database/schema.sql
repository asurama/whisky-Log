-- 사용자 테이블 (Supabase Auth와 연동)
-- users 테이블은 Supabase Auth에서 자동 생성됨

-- 브랜드 테이블
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위스키 병 테이블 (상태 추가)
CREATE TABLE bottles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  custom_brand VARCHAR(255),
  vintage INTEGER,
  age_years INTEGER,
  abv DECIMAL(4,2), -- 도수 (알코올 함량)
  retail_price DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  discount_rate DECIMAL(5,2),
  purchase_location VARCHAR(255),
  purchase_date DATE,
  bottle_status VARCHAR(20) DEFAULT 'unopened' CHECK (bottle_status IN ('unopened', 'opened', 'empty')),
  total_volume_ml DECIMAL(8,2), -- 전체 용량
  remaining_volume_ml DECIMAL(8,2), -- 남은 용량
  image_url TEXT, -- 이미지 URL
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 시음 테이블 (기존 tastings 테이블 대체)
CREATE TABLE tastings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bottle_id UUID REFERENCES bottles(id) ON DELETE SET NULL, -- 구매한 보틀인 경우
  bottle_name TEXT, -- 바/모임 시음의 위스키 이름
  bottle_brand TEXT, -- 바/모임 시음의 브랜드
  tasting_type VARCHAR(20) NOT NULL CHECK (tasting_type IN ('bar', 'bottle', 'meeting')),
  tasting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tasting_time TIME,
  location VARCHAR(255), -- 바 이름, 모임 이름, 집 등
  consumed_volume_ml DECIMAL(8,2), -- 마신 양
  
  -- 맛 평가
  nose_rating INTEGER CHECK (nose_rating >= 1 AND nose_rating <= 10),
  palate_rating INTEGER CHECK (palate_rating >= 1 AND palate_rating <= 10),
  finish_rating INTEGER CHECK (finish_rating >= 1 AND finish_rating <= 10),
  overall_rating DECIMAL(3,1) CHECK (overall_rating >= 1.0 AND overall_rating <= 10.0),
  
  -- 상세 평가
  nose_notes TEXT,
  palate_notes TEXT,
  finish_notes TEXT,
  additional_notes TEXT,
  
  -- 함께한 사람
  companions TEXT,
  
  -- 이미지 URL
  image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 소비 로그 테이블 (시음과 연동)
CREATE TABLE consumption_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
  tasting_id UUID REFERENCES tastings(id) ON DELETE CASCADE,
  consumption_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount_ml DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위시리스트 테이블
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  custom_brand TEXT,
  vintage INTEGER,
  age_years INTEGER,
  abv DECIMAL(4,2), -- 도수 (알코올 함량)
  retail_price DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  discount_rate DECIMAL(5,2),
  total_volume_ml DECIMAL(8,2),
  purchase_location TEXT,
  purchase_date DATE,
  priority INTEGER DEFAULT 1, -- 1: 낮음, 2: 보통, 3: 높음
  status TEXT DEFAULT 'wishlist', -- wishlist, purchased, removed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 정책
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- 브랜드 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

-- 병 정책
CREATE POLICY "Users can view own bottles" ON bottles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bottles" ON bottles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bottles" ON bottles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bottles" ON bottles
  FOR DELETE USING (auth.uid() = user_id);

-- 시음 정책
CREATE POLICY "Users can view own tastings" ON tastings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tastings" ON tastings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tastings" ON tastings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tastings" ON tastings
  FOR DELETE USING (auth.uid() = user_id);

-- 소비 로그 정책
CREATE POLICY "Users can view own consumption logs" ON consumption_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consumption logs" ON consumption_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consumption logs" ON consumption_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own consumption logs" ON consumption_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 위시리스트 정책
CREATE POLICY "Users can view own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist" ON wishlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_bottles_user_id ON bottles(user_id);
CREATE INDEX idx_bottles_brand_id ON bottles(brand_id);
CREATE INDEX idx_bottles_status ON bottles(bottle_status);
CREATE INDEX idx_tastings_user_id ON tastings(user_id);
CREATE INDEX idx_tastings_bottle_id ON tastings(bottle_id);
CREATE INDEX idx_tastings_type ON tastings(tasting_type);
CREATE INDEX idx_consumption_logs_user_id ON consumption_logs(user_id);
CREATE INDEX idx_consumption_logs_bottle_id ON consumption_logs(bottle_id);

-- 위시리스트 인덱스
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_status ON wishlist(status);
CREATE INDEX idx_wishlist_priority ON wishlist(priority);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bottles_updated_at BEFORE UPDATE ON bottles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tastings_updated_at BEFORE UPDATE ON tastings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 시음 시 보틀 상태 자동 업데이트 함수 (TastingModal에서 처리하므로 제거)
-- 용량 업데이트는 TastingModal 컴포넌트에서 처리됨

-- RLS(Row Level Security) 활성화
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY; 