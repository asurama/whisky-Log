require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyWhiskybaseData() {
  console.log('🔍 Whiskybase 데이터 검수 시작...\n');

  try {
    // 1. 전체 데이터 개수
    const { count, error: countError } = await supabase
      .from('whiskybase_data')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 데이터 개수 조회 오류:', countError);
      return;
    }

    console.log(`📊 전체 데이터 개수: ${count}개\n`);

    // 2. 샘플 데이터 확인
    const { data: samples, error: sampleError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, name, brand, type, region, age_years, abv, rating')
      .order('created_at', { ascending: false })
      .limit(5);

    if (sampleError) {
      console.error('❌ 샘플 데이터 조회 오류:', sampleError);
      return;
    }

    console.log('📋 샘플 데이터 (최근 5개):');
    samples.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.whiskybase_id}`);
      console.log(`   이름: ${item.name}`);
      console.log(`   브랜드: ${item.brand}`);
      console.log(`   타입: ${item.type}`);
      console.log(`   지역: ${item.region}`);
      console.log(`   숙성연수: ${item.age_years}`);
      console.log(`   도수: ${item.abv}%`);
      console.log(`   평점: ${item.rating}`);
      console.log('');
    });

    // 3. 빈 값 확인
    const { data: nullData, error: nullError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, name, brand, type, region')
      .or('name.is.null,brand.is.null,type.is.null')
      .limit(10);

    if (nullError) {
      console.error('❌ 빈 값 조회 오류:', nullError);
      return;
    }

    console.log(`⚠️ 빈 값이 있는 레코드: ${nullData.length}개`);
    if (nullData.length > 0) {
      nullData.forEach(item => {
        console.log(`   ID: ${item.whiskybase_id} - name: ${item.name}, brand: ${item.brand}, type: ${item.type}`);
      });
    }
    console.log('');

    // 4. 특수 문자 확인
    const { data: specialChars, error: specialError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, name, brand')
      .or('name.ilike.%\\t%,name.ilike.%\\n%,brand.ilike.%\\t%')
      .limit(5);

    if (specialError) {
      console.error('❌ 특수 문자 조회 오류:', specialError);
      return;
    }

    console.log(`⚠️ 특수 문자가 남아있는 레코드: ${specialChars.length}개`);
    if (specialChars.length > 0) {
      specialChars.forEach(item => {
        console.log(`   ID: ${item.whiskybase_id} - name: "${item.name}", brand: "${item.brand}"`);
      });
    }
    console.log('');

    // 5. 브랜드별 통계
    const { data: brandStats, error: brandError } = await supabase
      .from('whiskybase_data')
      .select('brand')
      .not('brand', 'is', null);

    if (brandError) {
      console.error('❌ 브랜드 통계 조회 오류:', brandError);
      return;
    }

    const brandCount = {};
    brandStats.forEach(item => {
      brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
    });

    const topBrands = Object.entries(brandCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    console.log('🏆 상위 10개 브랜드:');
    topBrands.forEach(([brand, count], index) => {
      console.log(`${index + 1}. ${brand}: ${count}개`);
    });
    console.log('');

    // 6. 타입별 통계
    const { data: typeStats, error: typeError } = await supabase
      .from('whiskybase_data')
      .select('type')
      .not('type', 'is', null);

    if (typeError) {
      console.error('❌ 타입 통계 조회 오류:', typeError);
      return;
    }

    const typeCount = {};
    typeStats.forEach(item => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    });

    console.log('📊 타입별 통계:');
    Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}개`);
      });

    console.log('\n✅ 데이터 검수 완료!');

  } catch (error) {
    console.error('💥 검수 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  verifyWhiskybaseData()
    .then(() => {
      console.log('🎉 검수 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
} 