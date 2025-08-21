-- RLS(Row Level Security) 활성화 스크립트
-- 모든 공개 테이블에 RLS를 활성화하여 보안 강화

-- 1. bottles 테이블 RLS 활성화
ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;

-- 2. brands 테이블 RLS 활성화
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. tastings 테이블 RLS 활성화
ALTER TABLE public.tastings ENABLE ROW LEVEL SECURITY;

-- 4. consumption_logs 테이블 RLS 활성화
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;

-- 5. wishlist 테이블 RLS 활성화
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 6. backup 관련 테이블들 RLS 활성화 (있다면)
-- ALTER TABLE public.bottles_backup ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tastings_backup ENABLE ROW LEVEL SECURITY;

-- 7. backup_metadata 테이블 RLS 활성화 (있다면)
-- ALTER TABLE public.backup_metadata ENABLE ROW LEVEL SECURITY;

-- 확인 쿼리
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('bottles', 'brands', 'tastings', 'consumption_logs', 'wishlist')
ORDER BY tablename; 