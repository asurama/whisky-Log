-- 위스키 정보 확장을 위한 필드 추가
-- bottles 테이블에 새로운 필드들 추가

-- 위스키 타입 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS type VARCHAR(100);

-- Whiskybase 평점 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS whiskybase_rating DECIMAL(3,1);

-- 캐스크 타입 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS cask_type VARCHAR(255);

-- 병입년도 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS bottled_year INTEGER;

-- 상세 설명 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS description TEXT;

-- Whiskybase URL 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS whiskybase_url TEXT;

-- bottles 테이블에 Whiskybase 관련 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS vintage INTEGER;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS bottled_year INTEGER;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS cask_type VARCHAR(255);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bottles_vintage ON bottles(vintage);
CREATE INDEX IF NOT EXISTS idx_bottles_bottled_year ON bottles(bottled_year);
CREATE INDEX IF NOT EXISTS idx_bottles_cask_type ON bottles(cask_type);

-- 기존 필드들도 추가 (혹시 없을 경우)
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS age_years INTEGER;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS region VARCHAR(255);
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS distillery VARCHAR(255);
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS bottler VARCHAR(255);
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS cask_number VARCHAR(255);
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS bottle_count INTEGER;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS nose_notes TEXT;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS palate_notes TEXT;
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS finish_notes TEXT;

-- 추가 인덱스들
CREATE INDEX IF NOT EXISTS idx_bottles_age_years ON bottles(age_years);
CREATE INDEX IF NOT EXISTS idx_bottles_region ON bottles(region);
CREATE INDEX IF NOT EXISTS idx_bottles_distillery ON bottles(distillery);
CREATE INDEX IF NOT EXISTS idx_bottles_bottler ON bottles(bottler);

-- 기존 필드에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bottles_type ON bottles(type);
CREATE INDEX IF NOT EXISTS idx_bottles_whiskybase_rating ON bottles(whiskybase_rating);

-- 기존 데이터에 대한 기본값 설정
UPDATE bottles SET 
  type = 'Single Malt' 
WHERE type IS NULL;

-- 위스키 타입에 대한 체크 제약 조건 추가
ALTER TABLE bottles ADD CONSTRAINT IF NOT EXISTS check_bottle_type 
CHECK (type IN ('Single Malt', 'Blended', 'Pure Malt', 'Single Grain', 'Blended Malt', 'Blended Grain', 'Bourbon', 'Rye', 'Other'));

-- 코멘트 추가
COMMENT ON COLUMN bottles.type IS '위스키 타입 (Single Malt, Blended, Pure Malt 등)';
COMMENT ON COLUMN bottles.whiskybase_rating IS 'Whiskybase 평점 (0.0-10.0)';
COMMENT ON COLUMN bottles.cask_type IS '캐스크 타입 (Sherry Oak, Bourbon, Port 등)';
COMMENT ON COLUMN bottles.bottled_year IS '병입년도';
COMMENT ON COLUMN bottles.description IS '상세 설명';
COMMENT ON COLUMN bottles.whiskybase_url IS 'Whiskybase 원본 URL'; 
COMMENT ON COLUMN bottles.vintage IS '빈티지 (수확년도)';
COMMENT ON COLUMN bottles.age_years IS '숙성연수';
COMMENT ON COLUMN bottles.region IS '지역';
COMMENT ON COLUMN bottles.distillery IS '증류소';
COMMENT ON COLUMN bottles.bottler IS '병입자';
COMMENT ON COLUMN bottles.cask_number IS '캐스크 번호';
COMMENT ON COLUMN bottles.bottle_count IS '총 병 수';
COMMENT ON COLUMN bottles.tags IS '태그';
COMMENT ON COLUMN bottles.nose_notes IS '코 노트';
COMMENT ON COLUMN bottles.palate_notes IS '입맛 노트';
COMMENT ON COLUMN bottles.finish_notes IS '피니시 노트'; 