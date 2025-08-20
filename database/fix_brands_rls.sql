-- 브랜드 테이블 RLS 정책 수정
-- 기존 정책 삭제 후 새로운 정책 생성

-- 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON brands;
DROP POLICY IF EXISTS "Authenticated users can insert brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can update brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can delete brands" ON brands;
DROP POLICY IF EXISTS "Users can view all brands" ON brands;
DROP POLICY IF EXISTS "Brand owners can update brands" ON brands;
DROP POLICY IF EXISTS "Brand owners can delete brands" ON brands;

-- 새로운 브랜드 정책들 생성
-- 1. 모든 사용자가 브랜드를 볼 수 있음
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

-- 2. 인증된 사용자가 브랜드를 추가할 수 있음
CREATE POLICY "Authenticated users can insert brands" ON brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. 인증된 사용자가 브랜드를 수정할 수 있음
CREATE POLICY "Authenticated users can update brands" ON brands
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. 인증된 사용자가 브랜드를 삭제할 수 있음
CREATE POLICY "Authenticated users can delete brands" ON brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- 정책 확인
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
WHERE tablename = 'brands'; 