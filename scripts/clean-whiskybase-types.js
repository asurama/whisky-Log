require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 타입 정리 함수
function cleanWhiskyType(typeText) {
  if (!typeText) return null;
  
  // 가격 정보 패턴들
  const pricePatterns = [
    /\s*£\s*\d+(?:\.\d+)?/gi,           // £ 450.00
    /\s*€\s*\d+(?:\.\d+)?/gi,           // € 284.00
    /\s*USD\$\s*\d+(?:\.\d+)?/gi,       // USD$ 3809.99
    /\s*C\$\s*\d+(?:\.\d+)?/gi,         // C$ 106.99
    /\s*CHF\s*\d+(?:\.\d+)?/gi,         // CHF 189.00
    /\s*\d+(?:\.\d+)?\s*%/gi,           // 52.8%
    /\s*Sep\s*\d+/gi,                   // Sep 13
    /\s*Aug\s*\d+/gi,                   // Aug 18
    /\s*Dec\s*\d+/gi,                   // Dec 15
    /\s*Jan\s*\d+/gi,                   // Jan 20
    /\s*Feb\s*\d+/gi,                   // Feb 25
    /\s*Mar\s*\d+/gi,                   // Mar 10
    /\s*Apr\s*\d+/gi,                   // Apr 05
    /\s*May\s*\d+/gi,                   // May 15
    /\s*Jun\s*\d+/gi,                   // Jun 20
    /\s*Jul\s*\d+/gi,                   // Jul 25
    /\s*Oct\s*\d+/gi,                   // Oct 30
    /\s*Nov\s*\d+/gi,                   // Nov 12
  ];
  
  // 가격 정보 제거
  let cleanedType = typeText;
  pricePatterns.forEach(pattern => {
    cleanedType = cleanedType.replace(pattern, '');
  });
  
  // 상점 이름 패턴들
  const shopPatterns = [
    /\s*The Whisky Exchange/gi,
    /\s*WhiskyAuction\.com/gi,
    /\s*Master of Malt/gi,
    /\s*Lochs of Whisky/gi,
    /\s*MustHaveMalts/gi,
    /\s*Hard To Find Whisky/gi,
    /\s*Hedonism Wines/gi,
    /\s*La Maison du Whisky/gi,
    /\s*Royal Mile Whiskies Online/gi,
    /\s*Best of Wines/gi,
    /\s*Blue Cask/gi,
    /\s*Monnier - whiskytime\.ch/gi,
    /\s*Rare Vintage Whisky/gi,
    /\s*Passie voor Whisky/gi,
    /\s*Old & Rare Whisky/gi,
    /\s*Mark Littler Ltd/gi,
    /\s*Glenbotal/gi,
    /\s*Catawiki/gi,
    /\s*eBay\.fr/gi,
    /\s*Elitewhisky/gi,
    /\s*Finest Whisky/gi,
    /\s*Glen Fahrn - The Independent/gi,
    /\s*K&L Wine Merchants/gi,
    /\s*Kupsch-Whisky\.com/gi,
    /\s*La Cambusa/gi,
    /\s*Lion's fine & rare Whisky/gi,
    /\s*Lost-Distilleries/gi,
    /\s*Malt-Whisky\.ch Shop of Chur/gi,
    /\s*Malta Whisky/gi,
    /\s*Malts & Grains - Whisky & Spirits Boutique/gi,
    /\s*Maltucky/gi,
    /\s*Mizunara: The Shop/gi,
    /\s*Muc Spirits/gi,
    /\s*NOBS Distillery ApS/gi,
    /\s*OKEETEE, Drinks mit Biss/gi,
    /\s*Old Whisky/gi,
    /\s*Oldies & Goldies Whisky/gi,
    /\s*Onlineshop Helgoland/gi,
    /\s*Scotch Sense/gi,
    /\s*Scotch-Land\.de/gi,
    /\s*Bacchus & Tradition/gi,
    /\s*Bestwhisky\.be/gi,
    /\s*Brühler Whiskyhaus/gi,
    /\s*Caledonian Collectables/gi,
    /\s*CaptainScotch\.de/gi,
    /\s*Cask Cartel Premium Spirits Online/gi,
    /\s*Clayton Crossing Liquor Store/gi,
    /\s*Continental Wine & Spirits/gi,
    /\s*De drie dennen/gi,
    /\s*Delias Whiskyshop GmbH/gi,
    /\s*Delicatessen Campens/gi,
    /\s*Den Blå Avis/gi,
    /\s*DH Global Spirits/gi,
    /\s*Distilia/gi,
    /\s*Dom Whisky Online/gi,
    /\s*Dram Discovery Shop/gi,
    /\s*DrankDozijn\.nl/gi,
    /\s*Drankenshop Bams/gi,
    /\s*Drink More/gi,
    /\s*Dutch Whisky Connection/gi,
    /\s*Getränkewelt Weiser/gi,
    /\s*Glengarry/gi,
    /\s*Hirschenbrunner Spirits/gi,
    /\s*Jahrhundertweine\.de/gi,
    /\s*Juul's Vin og Spiritus/gi,
    /\s*Leighton Wine/gi,
    /\s*Mitra Drankenspeciaalzaak Hans & Hans Oirschot/gi,
    /\s*Angelshare Spirits/gi,
    /\s*B-Spirit/gi,
    /\s*AA Whisky/gi,
    /\s*Absolutely Nuts Spirits/gi,
    /\s*Amshop\.de - Rare Whisky and Fine Spirits/gi,
    /\s*'t Bockje Bathmen/gi,
    /\s*Retailer Sponsored/gi,
  ];
  
  // 상점 이름 제거
  shopPatterns.forEach(pattern => {
    cleanedType = cleanedType.replace(pattern, '');
  });
  
  // 앞뒤 공백 제거
  cleanedType = cleanedType.trim();
  
  // 빈 문자열이면 null 반환
  if (!cleanedType) return null;
  
  // 일반적인 위스키 타입들로 매핑
  const typeMapping = {
    'single malt': 'Single Malt',
    'blended': 'Blended',
    'blended malt': 'Blended Malt',
    'single grain': 'Single Grain',
    'blended grain': 'Blended Grain',
    'bourbon': 'Bourbon',
    'rye': 'Rye',
    'canadian whisky': 'Canadian Whisky',
    'irish whiskey': 'Irish Whiskey',
    'japanese whisky': 'Japanese Whisky',
    'scotch': 'Scotch',
    'whisky': 'Whisky',
    'whiskey': 'Whiskey'
  };
  
  // 소문자로 변환해서 매핑 확인
  const lowerType = cleanedType.toLowerCase();
  for (const [key, value] of Object.entries(typeMapping)) {
    if (lowerType.includes(key)) {
      return value;
    }
  }
  
  // 매핑되지 않으면 원본 반환 (정리된 상태)
  return cleanedType;
}

async function cleanWhiskybaseTypes() {
  console.log('🧹 Whiskybase 타입 필드 정리 시작...\n');
  
  try {
    // 1. 현재 타입 필드 상태 확인
    const { data: currentTypes, error: currentError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, type')
      .not('type', 'is', null)
      .limit(20);
    
    if (currentError) {
      console.error('❌ 현재 타입 조회 오류:', currentError);
      return;
    }
    
    console.log('📋 정리 전 샘플 타입들:');
    currentTypes.forEach(item => {
      console.log(`   ID: ${item.whiskybase_id} - "${item.type}"`);
    });
    console.log('');
    
    // 2. 모든 데이터 조회
    const { data: allData, error: allError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, type');
    
    if (allError) {
      console.error('❌ 전체 데이터 조회 오류:', allError);
      return;
    }
    
    console.log(`📊 총 ${allData.length}개 레코드 처리 중...\n`);
    
    // 3. 타입 정리 및 업데이트
    let updatedCount = 0;
    let unchangedCount = 0;
    
    for (const item of allData) {
      const originalType = item.type;
      const cleanedType = cleanWhiskyType(originalType);
      
      if (cleanedType !== originalType) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('whiskybase_data')
          .update({ type: cleanedType })
          .eq('whiskybase_id', item.whiskybase_id);
        
        if (updateError) {
          console.error(`❌ 업데이트 오류 (ID: ${item.whiskybase_id}):`, updateError);
        } else {
          updatedCount++;
          if (updatedCount <= 10) {
            console.log(`✅ ID: ${item.whiskybase_id} - "${originalType}" → "${cleanedType}"`);
          }
        }
      } else {
        unchangedCount++;
      }
    }
    
    console.log(`\n📈 정리 완료!`);
    console.log(`   ✅ 업데이트된 레코드: ${updatedCount}개`);
    console.log(`   ⏭️ 변경 없는 레코드: ${unchangedCount}개`);
    
    // 4. 정리 후 상태 확인
    const { data: afterTypes, error: afterError } = await supabase
      .from('whiskybase_data')
      .select('whiskybase_id, type')
      .not('type', 'is', null)
      .limit(10);
    
    if (afterError) {
      console.error('❌ 정리 후 타입 조회 오류:', afterError);
      return;
    }
    
    console.log('\n📋 정리 후 샘플 타입들:');
    afterTypes.forEach(item => {
      console.log(`   ID: ${item.whiskybase_id} - "${item.type}"`);
    });
    
    // 5. 타입별 통계
    const { data: typeStats, error: statsError } = await supabase
      .from('whiskybase_data')
      .select('type')
      .not('type', 'is', null);
    
    if (!statsError && typeStats) {
      const typeCount = {};
      typeStats.forEach(item => {
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      });
      
      console.log('\n📊 정리된 타입별 통계:');
      Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`   ${type}: ${count}개`);
        });
    }
    
    console.log('\n✅ 타입 필드 정리 완료!');
    
  } catch (error) {
    console.error('💥 정리 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanWhiskybaseTypes()
    .then(() => {
      console.log('🎉 타입 정리 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
} 