-- Whiskybase 데이터 저장 테이블
CREATE TABLE whiskybase_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whiskybase_id VARCHAR(100) UNIQUE, -- Whiskybase의 고유 ID
  name VARCHAR(500) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  age_years INTEGER,
  abv DECIMAL(4,2), -- 도수
  region VARCHAR(100),
  type VARCHAR(100), -- Single Malt, Blended, Pure Malt 등
  rating DECIMAL(3,1), -- 평점
  image_url TEXT,
  whiskybase_url TEXT, -- Whiskybase 원본 URL
  description TEXT, -- 상세 설명
  distillery VARCHAR(255), -- 증류소
  bottler VARCHAR(255), -- 병입사
  cask_type VARCHAR(255), -- 캐스크 타입
  vintage INTEGER, -- 빈티지
  bottled_year INTEGER, -- 병입년도
  bottled_for VARCHAR(255), -- 병입 목적 (예: Travel Retail)
  natural_color BOOLEAN, -- 천연 색상 여부
  non_chill_filtered BOOLEAN, -- 비냉각 여과 여부
  single_cask BOOLEAN, -- 싱글 캐스크 여부
  limited_edition BOOLEAN, -- 리미티드 에디션 여부
  price_usd DECIMAL(10,2), -- 미국 가격
  price_eur DECIMAL(10,2), -- 유럽 가격
  price_gbp DECIMAL(10,2), -- 영국 가격
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 검색을 위한 인덱스 생성
CREATE INDEX idx_whiskybase_name ON whiskybase_data USING gin(to_tsvector('english', name));
CREATE INDEX idx_whiskybase_brand ON whiskybase_data USING gin(to_tsvector('english', brand));
CREATE INDEX idx_whiskybase_distillery ON whiskybase_data(distillery);
CREATE INDEX idx_whiskybase_region ON whiskybase_data(region);
CREATE INDEX idx_whiskybase_type ON whiskybase_data(type);
CREATE INDEX idx_whiskybase_age ON whiskybase_data(age_years);
CREATE INDEX idx_whiskybase_rating ON whiskybase_data(rating);
CREATE INDEX idx_whiskybase_created_at ON whiskybase_data(created_at);

-- 전체 텍스트 검색을 위한 복합 인덱스
CREATE INDEX idx_whiskybase_search ON whiskybase_data USING gin(
  to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(brand, '') || ' ' || 
    coalesce(distillery, '') || ' ' || 
    coalesce(region, '') || ' ' || 
    coalesce(type, '')
  )
);

-- 업데이트 트리거 적용
CREATE TRIGGER update_whiskybase_data_updated_at BEFORE UPDATE ON whiskybase_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 비활성화 (모든 사용자가 읽기 가능)
ALTER TABLE whiskybase_data DISABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성
CREATE POLICY "Whiskybase data is viewable by everyone" ON whiskybase_data
  FOR SELECT USING (true);

-- 관리자만 삽입/수정/삭제 가능하도록 정책 생성 (필요시)
-- CREATE POLICY "Only admins can modify whiskybase data" ON whiskybase_data
--   FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO whiskybase_data (
  whiskybase_id, name, brand, age_years, abv, region, type, rating, 
  image_url, whiskybase_url, description, distillery, vintage
) VALUES 
('wb_1', 'Macallan 12 Years Sherry Oak', 'Macallan', 12, 43.0, 'Speyside', 'Single Malt', 8.2,
 'https://www.whiskybase.com/whiskies/whisky/1/macallan-12-years-sherry-oak.jpg',
 'https://www.whiskybase.com/whiskies/whisky/1/macallan-12-years-sherry-oak',
 'A classic Speyside single malt matured in sherry oak casks.', 'Macallan Distillery', NULL),

('wb_2', 'Glenmorangie 10 Years Original', 'Glenmorangie', 10, 40.0, 'Highland', 'Single Malt', 7.8,
 'https://www.whiskybase.com/whiskies/whisky/2/glenmorangie-10-years-original.jpg',
 'https://www.whiskybase.com/whiskies/whisky/2/glenmorangie-10-years-original',
 'The original Glenmorangie, matured in American oak casks.', 'Glenmorangie Distillery', NULL),

('wb_3', 'Laphroaig 10 Years', 'Laphroaig', 10, 43.0, 'Islay', 'Single Malt', 8.5,
 'https://www.whiskybase.com/whiskies/whisky/3/laphroaig-10-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/3/laphroaig-10-years',
 'Intensely peated Islay single malt with medicinal notes.', 'Laphroaig Distillery', NULL),

('wb_4', 'Yamazaki 12 Years', 'Yamazaki', 12, 43.0, 'Honshu', 'Single Malt', 8.1,
 'https://www.whiskybase.com/whiskies/whisky/4/yamazaki-12-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/4/yamazaki-12-years',
 'Japan''s first commercial whisky distillery.', 'Yamazaki Distillery', NULL),

('wb_5', 'Dalmore 12 Years', 'Dalmore', 12, 40.0, 'Highland', 'Single Malt', 8.0,
 'https://www.whiskybase.com/whiskies/whisky/5/dalmore-12-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/5/dalmore-12-years',
 'Highland single malt with rich sherry influence.', 'Dalmore Distillery', NULL),

('wb_6', 'Dalmore 15 Years', 'Dalmore', 15, 40.0, 'Highland', 'Single Malt', 8.4,
 'https://www.whiskybase.com/whiskies/whisky/6/dalmore-15-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/6/dalmore-15-years',
 'Extended maturation in sherry casks for added complexity.', 'Dalmore Distillery', NULL),

('wb_7', 'Balvenie 12 Years DoubleWood', 'Balvenie', 12, 40.0, 'Speyside', 'Single Malt', 8.3,
 'https://www.whiskybase.com/whiskies/whisky/7/balvenie-12-years-doublewood.jpg',
 'https://www.whiskybase.com/whiskies/whisky/7/balvenie-12-years-doublewood',
 'Matured in traditional oak and finished in sherry casks.', 'Balvenie Distillery', NULL),

('wb_8', 'Ardbeg 10 Years', 'Ardbeg', 10, 46.0, 'Islay', 'Single Malt', 8.6,
 'https://www.whiskybase.com/whiskies/whisky/8/ardbeg-10-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/8/ardbeg-10-years',
 'Uncompromisingly peated Islay single malt.', 'Ardbeg Distillery', NULL),

('wb_9', 'Hibiki Harmony', 'Hibiki', NULL, 43.0, 'Honshu', 'Blended', 8.4,
 'https://www.whiskybase.com/whiskies/whisky/9/hibiki-harmony.jpg',
 'https://www.whiskybase.com/whiskies/whisky/9/hibiki-harmony',
 'A harmonious blend of malt and grain whiskies.', 'Suntory', NULL),

('wb_10', 'Glenfiddich 12 Years', 'Glenfiddich', 12, 40.0, 'Speyside', 'Single Malt', 7.5,
 'https://www.whiskybase.com/whiskies/whisky/10/glenfiddich-12-years.jpg',
 'https://www.whiskybase.com/whiskies/whisky/10/glenfiddich-12-years',
 'The world''s most awarded single malt Scotch whisky.', 'Glenfiddich Distillery', NULL); 