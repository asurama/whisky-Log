const { clearBrands } = require('./clear-brands');
const { analyzeBrands, createBrands } = require('./generate-brands-from-whiskybase');

// 브랜드 데이터 완전 재구성 함수
async function rebuildBrands() {
  console.log('🔄 브랜드 데이터 완전 재구성 시작...\n');
  
  try {
    // 1단계: 기존 브랜드 데이터 삭제
    console.log('📋 1단계: 기존 브랜드 데이터 삭제');
    await clearBrands();
    console.log('✅ 기존 브랜드 데이터 삭제 완료\n');
    
    // 2단계: Whiskybase 데이터에서 브랜드 분석
    console.log('📋 2단계: Whiskybase 데이터에서 브랜드 분석');
    const brandStats = await analyzeBrands();
    
    if (brandStats.length === 0) {
      console.log('❌ 분석할 브랜드 데이터가 없습니다.');
      return;
    }
    
    console.log(`✅ ${brandStats.length}개 브랜드 분석 완료\n`);
    
    // 3단계: 상위 브랜드 출력
    console.log('📋 3단계: 상위 브랜드 확인');
    console.log('\n📊 상위 10개 브랜드:');
    brandStats.slice(0, 10).forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (${brand.count}개 위스키, 평점: ${brand.avgRating})`);
    });
    console.log('');
    
    // 4단계: 브랜드 생성
    console.log('📋 4단계: 브랜드 생성');
    const creationStats = await createBrands(brandStats, 50); // 상위 50개 브랜드 생성
    
    // 5단계: 결과 출력
    console.log('\n📋 5단계: 결과 확인');
    console.log('\n📈 브랜드 재구성 완료!');
    console.log(`📁 총 처리: ${creationStats.total}개`);
    console.log(`✅ 새로 생성: ${creationStats.created}개`);
    console.log(`⏭️ 이미 존재: ${creationStats.skipped}개`);
    console.log(`❌ 오류: ${creationStats.errors}개`);
    
    if (creationStats.created > 0) {
      console.log('\n🎉 브랜드 재구성이 성공적으로 완료되었습니다!');
      console.log('이제 "adbeg"가 "Ardbeg"로 올바르게 정규화되어 저장됩니다.');
      console.log('Whiskybase 검색에서 자동으로 브랜드가 매칭됩니다.');
    }
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  rebuildBrands()
    .then(() => {
      console.log('\n🎉 모든 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { rebuildBrands }; 