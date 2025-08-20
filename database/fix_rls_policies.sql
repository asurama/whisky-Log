-- RLS 정책 수정 및 권한 문제 해결

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can update own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlist;

-- 2. 새로운 정책 생성
CREATE POLICY "Users can view own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist" ON wishlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- 3. 다른 테이블들도 확인
-- bottles 테이블
DROP POLICY IF EXISTS "Users can view own bottles" ON bottles;
DROP POLICY IF EXISTS "Users can insert own bottles" ON bottles;
DROP POLICY IF EXISTS "Users can update own bottles" ON bottles;
DROP POLICY IF EXISTS "Users can delete own bottles" ON bottles;

CREATE POLICY "Users can view own bottles" ON bottles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bottles" ON bottles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bottles" ON bottles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bottles" ON bottles
  FOR DELETE USING (auth.uid() = user_id);

-- tastings 테이블
DROP POLICY IF EXISTS "Users can view own tastings" ON tastings;
DROP POLICY IF EXISTS "Users can insert own tastings" ON tastings;
DROP POLICY IF EXISTS "Users can update own tastings" ON tastings;
DROP POLICY IF EXISTS "Users can delete own tastings" ON tastings;

CREATE POLICY "Users can view own tastings" ON tastings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tastings" ON tastings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tastings" ON tastings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tastings" ON tastings
  FOR DELETE USING (auth.uid() = user_id);

-- brands 테이블 (모든 사용자가 볼 수 있도록)
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON brands;
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

-- 4. RLS 활성화 확인
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 5. 정책 확인 쿼리
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('wishlist', 'bottles', 'tastings', 'brands')
ORDER BY tablename, policyname; 