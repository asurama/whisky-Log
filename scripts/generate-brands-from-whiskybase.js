const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정 (새로 생성)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
);

// 브랜드 통계 분석 함수
async function analyzeBrands() {
  console.log('🔍 Whiskybase 데이터에서 브랜드 분석 시작...');
  
  try {
    // 모든 브랜드 데이터 가져오기
    const { data: whiskyData, error } = await supabase
      .from('whiskybase_data')
      .select('brand, region, type')
      .not('brand', 'is', null);
    
    if (error) {
      console.error('❌ 데이터 조회 오류:', error);
      return [];
    }
    
    if (!whiskyData || whiskyData.length === 0) {
      console.log('⚠️ Whiskybase 데이터가 없습니다.');
      return [];
    }
    
    console.log(`📊 총 ${whiskyData.length}개의 위스키 데이터 분석 중...`);
    
    // 브랜드별 통계 계산
    const brandStats = {};
    
    whiskyData.forEach(whisky => {
      const rawBrand = whisky.brand?.trim();
      if (!rawBrand) return;
      
      // 브랜드 이름 정규화
      const normalizedBrand = normalizeBrandName(rawBrand);
      
      if (!brandStats[normalizedBrand]) {
        brandStats[normalizedBrand] = {
          count: 0,
          regions: new Set(),
          types: new Set(),
          avgRating: 0,
          totalRating: 0,
          ratedCount: 0
        };
      }
      
      brandStats[normalizedBrand].count++;
      
      if (whisky.region) {
        brandStats[normalizedBrand].regions.add(whisky.region.trim());
      }
      
      if (whisky.type) {
        brandStats[normalizedBrand].types.add(whisky.type.trim());
      }
    });
    
    // 평점 정보도 가져와서 추가
    const { data: ratingData, error: ratingError } = await supabase
      .from('whiskybase_data')
      .select('brand, rating')
      .not('brand', 'is', null)
      .not('rating', 'is', null);
    
    if (!ratingError && ratingData) {
      ratingData.forEach(whisky => {
        const rawBrand = whisky.brand?.trim();
        if (!rawBrand) return;
        
        // 브랜드 이름 정규화
        const normalizedBrand = normalizeBrandName(rawBrand);
        
        if (brandStats[normalizedBrand] && whisky.rating) {
          brandStats[normalizedBrand].totalRating += parseFloat(whisky.rating);
          brandStats[normalizedBrand].ratedCount++;
        }
      });
      
      // 평균 평점 계산
      Object.values(brandStats).forEach(stats => {
        if (stats.ratedCount > 0) {
          stats.avgRating = stats.totalRating / stats.ratedCount;
        }
      });
    }
    
    // 브랜드별 통계를 배열로 변환
    const brandArray = Object.entries(brandStats).map(([brand, stats]) => ({
      name: brand,
      count: stats.count,
      regions: Array.from(stats.regions),
      types: Array.from(stats.types),
      avgRating: Math.round(stats.avgRating * 10) / 10,
      ratedCount: stats.ratedCount
    }));
    
    // 개수 기준으로 정렬
    brandArray.sort((a, b) => b.count - a.count);
    
    console.log(`📈 분석 완료: ${brandArray.length}개 브랜드 발견`);
    
    return brandArray;
    
  } catch (error) {
    console.error('❌ 브랜드 분석 오류:', error);
    return [];
  }
}

// 브랜드 생성 함수
async function createBrands(topBrands, limit = 30) {
  console.log(`🏭 상위 ${limit}개 브랜드 생성 시작...`);
  
  const brandsToCreate = topBrands.slice(0, limit);
  const stats = {
    total: brandsToCreate.length,
    created: 0,
    skipped: 0,
    errors: 0
  };
  
  for (const brandData of brandsToCreate) {
    try {
      // 이미 존재하는 브랜드인지 확인
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id, name')
        .eq('name', brandData.name)
        .single();
      
      if (existingBrand) {
        console.log(`⏭️ 이미 존재: ${brandData.name}`);
        stats.skipped++;
        continue;
      }
      
      // 주요 지역 결정
      const primaryRegion = brandData.regions.length > 0 ? brandData.regions[0] : null;
      
      // 간단한 국가 매핑
      const country = getCountryFromRegion(primaryRegion);
      
      // 브랜드 설명 생성
      const description = generateBrandDescription(brandData);
      
      // 브랜드 데이터 생성 (최소한의 필드만)
      const brandToInsert = {
        name: brandData.name,
        country: country,
        description: description
      };
      
      // 데이터베이스에 저장
      const { data: newBrand, error } = await supabase
        .from('brands')
        .insert(brandToInsert)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ 브랜드 생성 실패: ${brandData.name}`, error.message);
        stats.errors++;
        continue;
      }
      
      console.log(`✅ 생성됨: ${brandData.name} (평점: ${brandData.avgRating})`);
      stats.created++;
      
    } catch (error) {
      console.error(`❌ 브랜드 처리 오류: ${brandData.name}`, error.message);
      stats.errors++;
    }
  }
  
  return stats;
}

// 브랜드 이름 정규화 함수
function normalizeBrandName(brandName) {
  if (!brandName) return brandName;
  
  // 일반적인 오타나 변형 수정
  const corrections = {
    'adbeg': 'Ardbeg',
    'ardbeg': 'Ardbeg',
    'ADBEG': 'Ardbeg',
    'ARDBEG': 'Ardbeg',
    'macallan': 'Macallan',
    'MACALLAN': 'Macallan',
    'glenfiddich': 'Glenfiddich',
    'GLENFIDDICH': 'Glenfiddich',
    'glenlivet': 'Glenlivet',
    'GLENLIVET': 'Glenlivet',
    'lagavulin': 'Lagavulin',
    'LAGAVULIN': 'Lagavulin',
    'laphroaig': 'Laphroaig',
    'LAPHROAIG': 'Laphroaig',
    'bowmore': 'Bowmore',
    'BOWMORE': 'Bowmore',
    'talisker': 'Talisker',
    'TALISKER': 'Talisker',
    'highland park': 'Highland Park',
    'HIGHLAND PARK': 'Highland Park',
    'balvenie': 'Balvenie',
    'BALVENIE': 'Balvenie',
    'glendronach': 'Glendronach',
    'GLENDRONACH': 'Glendronach',
    'aberfeldy': 'Aberfeldy',
    'ABERFELDY': 'Aberfeldy',
    'glenmorangie': 'Glenmorangie',
    'GLENMORANGIE': 'Glenmorangie',
    'dalmore': 'Dalmore',
    'DALMORE': 'Dalmore',
    'glenfiddich': 'Glenfiddich',
    'GLENFIDDICH': 'Glenfiddich'
  };
  
  // 정확한 매칭 먼저 확인
  if (corrections[brandName]) {
    return corrections[brandName];
  }
  
  // 소문자 변환 후 매칭 확인
  const lowerBrandName = brandName.toLowerCase();
  if (corrections[lowerBrandName]) {
    return corrections[lowerBrandName];
  }
  
  // 기본적인 대문자 변환 (첫 글자만)
  return brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
}

// 간단한 지역 → 국가 매핑 함수
function getCountryFromRegion(region) {
  if (!region) return null;
  
  const regionToCountry = {
    // 스코틀랜드
    'Speyside': 'Scotland',
    'Highland': 'Scotland', 
    'Islay': 'Scotland',
    'Lowland': 'Scotland',
    'Campbeltown': 'Scotland',
    'Islands': 'Scotland',
    
    // 일본
    'Honshu': 'Japan',
    'Hokkaido': 'Japan',
    'Kyushu': 'Japan',
    'Shikoku': 'Japan',
    
    // 미국
    'Kentucky': 'USA',
    'Tennessee': 'USA',
    'Indiana': 'USA',
    'Texas': 'USA',
    'New York': 'USA',
    'California': 'USA',
    
    // 기타
    'Ireland': 'Ireland',
    'Northern Ireland': 'Ireland',
    'Canada': 'Canada',
    'India': 'India',
    'Taiwan': 'Taiwan',
    'Australia': 'Australia',
    'England': 'England',
    'Wales': 'Wales'
  };
  
  return regionToCountry[region] || null;
}

// 브랜드 설명 생성 함수
function generateBrandDescription(brandData) {
  const parts = [];
  
  parts.push(`${brandData.name}은(는) 다양한 위스키를 생산하는 브랜드입니다.`);
  
  if (brandData.regions.length > 0) {
    const regions = brandData.regions.slice(0, 3).join(', ');
    parts.push(`주요 생산 지역은 ${regions}입니다.`);
  }
  
  if (brandData.types.length > 0) {
    const types = brandData.types.slice(0, 3).join(', ');
    parts.push(`주요 위스키 타입은 ${types}입니다.`);
  }
  
  if (brandData.avgRating > 0) {
    parts.push(`평균 평점은 ${brandData.avgRating}/10입니다.`);
  }
  
  return parts.join(' ');
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Whiskybase 브랜드 자동 생성 시작...\n');
  
  try {
    // 1. 브랜드 분석
    const brandStats = await analyzeBrands();
    
    if (brandStats.length === 0) {
      console.log('❌ 분석할 브랜드 데이터가 없습니다.');
      return;
    }
    
    // 2. 상위 브랜드 출력
    console.log('\n📊 상위 10개 브랜드:');
    brandStats.slice(0, 10).forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (평점: ${brand.avgRating})`);
    });
    
    // 3. 브랜드 생성
    const creationStats = await createBrands(brandStats, 30);
    
    // 4. 결과 출력
    console.log('\n📈 브랜드 생성 완료!');
    console.log(`📁 총 처리: ${creationStats.total}개`);
    console.log(`✅ 새로 생성: ${creationStats.created}개`);
    console.log(`⏭️ 이미 존재: ${creationStats.skipped}개`);
    console.log(`❌ 오류: ${creationStats.errors}개`);
    
    if (creationStats.created > 0) {
      console.log('\n🎉 브랜드 자동 생성이 완료되었습니다!');
      console.log('이제 Whiskybase 검색에서 자동으로 브랜드가 매칭됩니다.');
    }
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 모든 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { analyzeBrands, createBrands }; 