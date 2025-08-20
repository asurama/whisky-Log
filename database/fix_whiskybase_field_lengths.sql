-- Whiskybase 데이터 필드 길이 수정
-- VARCHAR 필드들의 길이를 늘려서 긴 데이터도 저장할 수 있도록 함

-- whiskybase_id 필드 길이 증가 (100 -> 255)
ALTER TABLE whiskybase_data 
ALTER COLUMN whiskybase_id TYPE VARCHAR(255);

-- name 필드 길이 증가 (500 -> 1000)
ALTER TABLE whiskybase_data 
ALTER COLUMN name TYPE VARCHAR(1000);

-- brand 필드 길이 증가 (255 -> 500)
ALTER TABLE whiskybase_data 
ALTER COLUMN brand TYPE VARCHAR(500);

-- region 필드 길이 증가 (100 -> 255)
ALTER TABLE whiskybase_data 
ALTER COLUMN region TYPE VARCHAR(255);

-- type 필드 길이 증가 (100 -> 255)
ALTER TABLE whiskybase_data 
ALTER COLUMN type TYPE VARCHAR(255);

-- distillery 필드 길이 증가 (255 -> 500)
ALTER TABLE whiskybase_data 
ALTER COLUMN distillery TYPE VARCHAR(500);

-- bottler 필드 길이 증가 (255 -> 500)
ALTER TABLE whiskybase_data 
ALTER COLUMN bottler TYPE VARCHAR(500);

-- cask_type 필드 길이 증가 (255 -> 500)
ALTER TABLE whiskybase_data 
ALTER COLUMN cask_type TYPE VARCHAR(500);

-- bottled_for 필드 길이 증가 (255 -> 500)
ALTER TABLE whiskybase_data 
ALTER COLUMN bottled_for TYPE VARCHAR(500);

-- 변경사항 확인
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'whiskybase_data' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 