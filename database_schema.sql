-- 위스키 로그 데이터베이스 스키마

-- 사용자 테이블 (Supabase Auth에서 자동 생성됨)
-- users 테이블은 Supabase Auth에서 관리됨

-- 브랜드 테이블
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위스키 보틀 테이블
CREATE TABLE IF NOT EXISTS bottles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  custom_brand VARCHAR(255),
  vintage INTEGER,
  age_years INTEGER,
  retail_price INTEGER,
  purchase_price INTEGER,
  discount_rate DECIMAL(5,2),
  purchase_location VARCHAR(255),
  purchase_date DATE,
  status VARCHAR(50) DEFAULT 'unopened' CHECK (status IN ('unopened', 'opened')),
  total_volume_ml INTEGER DEFAULT 750,
  remaining_volume_ml INTEGER DEFAULT 750,
  notes TEXT,
  image_url TEXT,
  abv DECIMAL(4,1), -- 도수 필드 추가
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 시음 기록 테이블
CREATE TABLE IF NOT EXISTS tastings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
  tasting_date DATE NOT NULL,
  tasting_time TIME,
  location VARCHAR(255),
  tasting_type VARCHAR(50) CHECK (tasting_type IN ('bar', 'bottle', 'meeting')),
  nose_score DECIMAL(3,1) CHECK (nose_score >= 0 AND nose_score <= 10),
  nose_notes TEXT,
  palate_score DECIMAL(3,1) CHECK (palate_score >= 0 AND palate_score <= 10),
  palate_notes TEXT,
  finish_score DECIMAL(3,1) CHECK (finish_score >= 0 AND finish_score <= 10),
  finish_notes TEXT,
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 소비 로그 테이블
CREATE TABLE IF NOT EXISTS consumption_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
  consumed_volume_ml INTEGER NOT NULL,
  consumed_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위시리스트 테이블
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  custom_brand VARCHAR(255),
  vintage INTEGER,
  age_years INTEGER,
  retail_price INTEGER,
  volume_ml INTEGER DEFAULT 750,
  location VARCHAR(255),
  notes TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  abv DECIMAL(4,1), -- 도수 필드 추가
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bottles_user_id ON bottles(user_id);
CREATE INDEX IF NOT EXISTS idx_bottles_brand_id ON bottles(brand_id);
CREATE INDEX IF NOT EXISTS idx_tastings_user_id ON tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_tastings_bottle_id ON tastings(bottle_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_user_id ON consumption_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_bottle_id ON consumption_logs(bottle_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_brand_id ON wishlist(brand_id);

-- Row Level Security (RLS) 정책
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- bottles 테이블 정책
CREATE POLICY "Users can view own bottles" ON bottles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bottles" ON bottles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bottles" ON bottles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bottles" ON bottles FOR DELETE USING (auth.uid() = user_id);

-- tastings 테이블 정책
CREATE POLICY "Users can view own tastings" ON tastings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tastings" ON tastings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tastings" ON tastings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tastings" ON tastings FOR DELETE USING (auth.uid() = user_id);

-- consumption_logs 테이블 정책
CREATE POLICY "Users can view own consumption logs" ON consumption_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumption logs" ON consumption_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consumption logs" ON consumption_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consumption logs" ON consumption_logs FOR DELETE USING (auth.uid() = user_id);

-- wishlist 테이블 정책
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist" ON wishlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- brands 테이블 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert brands" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update brands" ON brands FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete brands" ON brands FOR DELETE USING (auth.role() = 'authenticated'); 