-- 브랜드 테이블에 region 필드 추가
ALTER TABLE brands ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- 기존 브랜드들의 region 정보 업데이트 (선택사항)
-- UPDATE brands SET region = '스페이사이드' WHERE name LIKE '%Macallan%';
-- UPDATE brands SET region = '하이랜드' WHERE name LIKE '%Glenmorangie%';
-- UPDATE brands SET region = '아일라' WHERE name LIKE '%Laphroaig%';
-- UPDATE brands SET region = '아일라' WHERE name LIKE '%Ardbeg%';
-- UPDATE brands SET region = '스페이사이드' WHERE name LIKE '%Glenfiddich%';
-- UPDATE brands SET region = '스페이사이드' WHERE name LIKE '%Balvenie%';
-- UPDATE brands SET region = '하이랜드' WHERE name LIKE '%Dalmore%';
-- UPDATE brands SET region = '아일라' WHERE name LIKE '%Bowmore%';
-- UPDATE brands SET region = '스페이사이드' WHERE name LIKE '%Aberlour%';
-- UPDATE brands SET region = '하이랜드' WHERE name LIKE '%Glenlivet%';

-- 변경사항 확인
SELECT name, country, region FROM brands ORDER BY name; 