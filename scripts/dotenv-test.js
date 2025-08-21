#!/usr/bin/env node

console.log('🔍 dotenv 테스트 시작...');

// dotenv 로드 전
console.log('\n📋 dotenv 로드 전:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');

// dotenv 로드
console.log('\n📋 dotenv 로드 중...');
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('dotenv 로드 성공!');
} catch (error) {
  console.log('dotenv 로드 실패:', error.message);
}

// dotenv 로드 후
console.log('\n📋 dotenv 로드 후:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '없음');

// URL 일부만 표시 (보안)
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL 확인:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('KEY 확인:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}

console.log('\n✅ 테스트 완료'); 