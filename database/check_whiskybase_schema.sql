-- Whiskybase 데이터 테이블 스키마 확인
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'whiskybase_data' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 테이블 크기 확인
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE tablename = 'whiskybase_data';

-- 샘플 데이터 확인 (길이가 긴 필드들)
SELECT 
  whiskybase_id,
  LENGTH(name) as name_length,
  LENGTH(brand) as brand_length,
  LENGTH(type) as type_length,
  LENGTH(region) as region_length,
  LENGTH(distillery) as distillery_length,
  LENGTH(bottler) as bottler_length,
  LENGTH(cask_type) as cask_type_length,
  LENGTH(cask_number) as cask_number_length,
  LENGTH(tags) as tags_length
FROM whiskybase_data 
WHERE 
  LENGTH(name) > 500 OR
  LENGTH(brand) > 250 OR
  LENGTH(type) > 100 OR
  LENGTH(region) > 100 OR
  LENGTH(distillery) > 250 OR
  LENGTH(bottler) > 250 OR
  LENGTH(cask_type) > 250 OR
  LENGTH(cask_number) > 100 OR
  LENGTH(tags) > 500
ORDER BY name_length DESC
LIMIT 10; 