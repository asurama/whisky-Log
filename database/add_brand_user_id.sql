-- 브랜드 테이블에 user_id 필드 추가
ALTER TABLE brands ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 기존 브랜드들의 user_id를 NULL로 설정 (시스템 브랜드로 간주)
UPDATE brands SET user_id = NULL WHERE user_id IS NULL;

-- 브랜드 테이블에 region 필드도 추가 (아직 없다면)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- 변경사항 확인
SELECT name, country, region, user_id FROM brands ORDER BY name; 