const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
);

// 브랜드 데이터 삭제 함수
async function clearBrands() {
  console.log('🗑️ 기존 브랜드 데이터 삭제 시작...');
  
  try {
    // 먼저 기존 브랜드 개수 확인
    const { data: existingBrands, error: countError } = await supabase
      .from('brands')
      .select('id, name');
    
    if (countError) {
      console.error('❌ 브랜드 개수 조회 오류:', countError);
      return;
    }
    
    console.log(`📊 현재 ${existingBrands.length}개의 브랜드가 있습니다.`);
    
    if (existingBrands.length === 0) {
      console.log('✅ 삭제할 브랜드가 없습니다.');
      return;
    }
    
    // 사용자 확인
    console.log('\n⚠️ 다음 브랜드들이 삭제됩니다:');
    existingBrands.slice(0, 10).forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name}`);
    });
    if (existingBrands.length > 10) {
      console.log(`... 그리고 ${existingBrands.length - 10}개 더`);
    }
    
    // 모든 브랜드 삭제
    const { error: deleteError } = await supabase
      .from('brands')
      .delete()
      .neq('id', 0); // 모든 레코드 삭제
    
    if (deleteError) {
      console.error('❌ 브랜드 삭제 오류:', deleteError);
      return;
    }
    
    console.log(`✅ ${existingBrands.length}개의 브랜드가 성공적으로 삭제되었습니다.`);
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  clearBrands()
    .then(() => {
      console.log('\n🎉 브랜드 삭제 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { clearBrands }; 