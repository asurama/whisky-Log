-- 누락된 컬럼들 추가
ALTER TABLE whiskybase_data 
ADD COLUMN IF NOT EXISTS bottle_count INTEGER,
ADD COLUMN IF NOT EXISTS cask_type TEXT,
ADD COLUMN IF NOT EXISTS cask_number TEXT,
ADD COLUMN IF NOT EXISTS vintage INTEGER,
ADD COLUMN IF NOT EXISTS distillery TEXT,
ADD COLUMN IF NOT EXISTS bottler TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS nose_notes TEXT,
ADD COLUMN IF NOT EXISTS palate_notes TEXT,
ADD COLUMN IF NOT EXISTS finish_notes TEXT,
ADD COLUMN IF NOT EXISTS raw_html TEXT;

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'whiskybase_data' 
ORDER BY ordinal_position; 