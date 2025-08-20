#!/usr/bin/env node

console.log('🔍 환경변수 테스트 시작...');

// 방법 1: process.env 직접 확인
console.log('\n📋 방법 1: process.env 직접 확인');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '없음');

// 방법 2: dotenv 사용
console.log('\n📋 방법 2: dotenv 사용');
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('dotenv 로드 후:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '없음');
} catch (error) {
  console.log('dotenv 오류:', error.message);
}

// 방법 3: 파일 직접 읽기
console.log('\n📋 방법 3: 파일 직접 읽기');
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env.local 파일 존재함');
    
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.includes('SUPABASE')) {
        const [key] = line.split('=');
        console.log(`  ${key}: 설정됨`);
      }
    });
  } else {
    console.log('.env.local 파일이 존재하지 않음');
  }
} catch (error) {
  console.log('파일 읽기 오류:', error.message);
}

console.log('\n✅ 테스트 완료'); 