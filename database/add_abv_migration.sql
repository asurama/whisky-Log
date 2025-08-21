-- 도수(ABV) 필드 추가 마이그레이션
-- 기존 bottles 테이블에 abv 필드 추가
ALTER TABLE bottles ADD COLUMN IF NOT EXISTS abv DECIMAL(4,2);

-- 기존 wishlist 테이블에 abv 필드 추가
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS abv DECIMAL(4,2);

-- 기존 데이터에 대한 기본값 설정 (필요한 경우)
-- UPDATE bottles SET abv = NULL WHERE abv IS NULL;
-- UPDATE wishlist SET abv = NULL WHERE abv IS NULL; 