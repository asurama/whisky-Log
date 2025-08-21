#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 간단한 모니터링 시작...');

// 환경변수 확인
console.log('📋 환경변수 확인:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '없음');

// 파일 시스템 확인
console.log('\n📁 파일 시스템 확인:');
const possibleDirs = [
  path.join(__dirname, '..', 'mirror'),
  path.join(__dirname, '..', 'data', 'whiskybase-mirror'),
  path.join(__dirname, '..', 'data', 'whiskybase-mirror-en'),
  path.join(__dirname, '..', 'data', 'whiskybase-mirror', 'www.whiskybase.com'),
  path.join(__dirname, '..', 'data', 'whiskybase-mirror-en', 'www.whiskybase.com')
];

let totalFiles = 0;
for (const dir of possibleDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}: 존재함`);
    try {
      const files = fs.readdirSync(dir, { recursive: true });
      const htmlFiles = files.filter(file => typeof file === 'string' && file.endsWith('.html'));
      console.log(`   HTML 파일 수: ${htmlFiles.length}개`);
      totalFiles += htmlFiles.length;
    } catch (error) {
      console.log(`   조회 오류: ${error.message}`);
    }
  } else {
    console.log(`❌ ${dir}: 없음`);
  }
}
console.log(`📊 총 HTML 파일 수: ${totalFiles}개`);

// 프로세스 확인
console.log('\n⚙️ 프로세스 확인:');
try {
  const { execSync } = require('child_process');
  const output = execSync('ps aux | grep -E "(whiskybase|crawler)" | grep -v grep', { encoding: 'utf8' });
  console.log('실행 중인 크롤링 프로세스:', output.trim() ? output.trim().split('\n').length : 0);
} catch (error) {
  console.log('프로세스 조회 오류:', error.message);
}

console.log('\n✅ 진단 완료'); 