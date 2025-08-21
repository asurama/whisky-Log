-- 백업 메타데이터 테이블 생성 마이그레이션
-- 이 파일을 Supabase SQL 편집기에서 실행하세요

-- 테이블이 이미 존재하는지 확인하고 없으면 생성
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'backup_metadata') THEN
        -- 백업 메타데이터 테이블
        CREATE TABLE backup_metadata (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          backup_id VARCHAR(255) NOT NULL,
          metadata JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 인덱스 생성
        CREATE INDEX idx_backup_metadata_user_id ON backup_metadata(user_id);
        CREATE INDEX idx_backup_metadata_backup_id ON backup_metadata(backup_id);
        CREATE INDEX idx_backup_metadata_created_at ON backup_metadata(created_at);

        -- RLS 정책
        ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

        -- 사용자별 백업 메타데이터 접근 정책
        CREATE POLICY "Users can view their own backup metadata" ON backup_metadata
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own backup metadata" ON backup_metadata
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own backup metadata" ON backup_metadata
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own backup metadata" ON backup_metadata
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE 'backup_metadata 테이블이 성공적으로 생성되었습니다.';
    ELSE
        RAISE NOTICE 'backup_metadata 테이블이 이미 존재합니다.';
    END IF;
END $$; 