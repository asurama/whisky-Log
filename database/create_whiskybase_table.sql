-- Whiskybase 데이터 저장 테이블 생성
CREATE TABLE IF NOT EXISTS whiskybase_data (
  id BIGSERIAL PRIMARY KEY,
  whiskybase_id INTEGER UNIQUE NOT NULL,
  name TEXT,
  brand TEXT,
  type TEXT,
  region TEXT,
  age_years INTEGER,
  abv DECIMAL(4,2),
  rating DECIMAL(3,2),
  price_usd DECIMAL(10,2),
  description TEXT,
  image_url TEXT,
  distillery TEXT,
  bottler TEXT,
  vintage INTEGER,
  cask_type TEXT,
  cask_number TEXT,
  bottle_count INTEGER,
  tags TEXT,
  nose_notes TEXT,
  palate_notes TEXT,
  finish_notes TEXT,
  raw_html TEXT,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (이미 존재하면 건너뜀)
CREATE INDEX IF NOT EXISTS idx_whiskybase_data_whiskybase_id ON whiskybase_data(whiskybase_id);
CREATE INDEX IF NOT EXISTS idx_whiskybase_data_brand ON whiskybase_data(brand);
CREATE INDEX IF NOT EXISTS idx_whiskybase_data_region ON whiskybase_data(region);
CREATE INDEX IF NOT EXISTS idx_whiskybase_data_type ON whiskybase_data(type);
CREATE INDEX IF NOT EXISTS idx_whiskybase_data_rating ON whiskybase_data(rating);

-- RLS 정책 설정
ALTER TABLE whiskybase_data ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Allow public read access" ON whiskybase_data;
DROP POLICY IF EXISTS "Allow admin write access" ON whiskybase_data;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Allow public read access" ON whiskybase_data
  FOR SELECT USING (true);

-- 관리자만 쓰기 가능하도록 설정
CREATE POLICY "Allow admin write access" ON whiskybase_data
  FOR ALL USING (auth.role() = 'service_role');

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거가 이미 존재하면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_whiskybase_data_updated_at ON whiskybase_data;

CREATE TRIGGER update_whiskybase_data_updated_at 
  BEFORE UPDATE ON whiskybase_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 테이블 정보 출력
SELECT 
  'whiskybase_data' as table_name,
  COUNT(*) as total_records,
  MIN(whiskybase_id) as min_id,
  MAX(whiskybase_id) as max_id,
  AVG(rating) as avg_rating
FROM whiskybase_data; 