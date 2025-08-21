-- 긴급 수정: 모든 VARCHAR 필드를 TEXT로 변경
-- 이렇게 하면 길이 제한 문제가 완전히 해결됩니다

-- whiskybase_id를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN whiskybase_id TYPE TEXT;

-- name을 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN name TYPE TEXT;

-- brand를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN brand TYPE TEXT;

-- region을 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN region TYPE TEXT;

-- type을 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN type TYPE TEXT;

-- distillery를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN distillery TYPE TEXT;

-- bottler를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN bottler TYPE TEXT;

-- cask_type을 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN cask_type TYPE TEXT;

-- cask_number를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN cask_number TYPE TEXT;

-- bottled_for를 TEXT로 변경
ALTER TABLE whiskybase_data 
ALTER COLUMN bottled_for TYPE TEXT;

-- 변경사항 확인
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'whiskybase_data' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 