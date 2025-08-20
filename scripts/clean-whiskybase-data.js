const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 강화된 텍스트 정리 함수
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\t+/g, ' ')          // 연속된 탭을 공백으로
    .replace(/\n+/g, ' ')          // 연속된 줄바꿈을 공백으로
    .replace(/\r+/g, ' ')          // 연속된 캐리지 리턴을 공백으로
    .replace(/\s+/g, ' ')          // 연속된 공백을 하나로
    .replace(/^\s+|\s+$/g, '')     // 앞뒤 공백 제거
    .replace(/\u00A0/g, ' ')       // non-breaking space 제거
    .replace(/\u200B/g, '')        // zero-width space 제거
    .trim();                       // 최종 정리
}

// description에서 정보 파싱 함수
function parseDescription(desc) {
  if (!desc) return {};
  
  const info = {};
  
  // Strength (도수) 추출
  const strengthMatch = desc.match(/Strength\s*(\d+(?:\.\d+)?)\s*%/i);
  if (strengthMatch) info.abv = strengthMatch[1];
  
  // Vintage (빈티지) 추출
  const vintageMatch = desc.match(/Vintage\s*(\d{4})/i);
  if (vintageMatch) info.vintage = vintageMatch[1];
  
  // Bottled (병입년도) 추출
  const bottledMatch = desc.match(/Bottled\s*(\d{4})/i);
  if (bottledMatch) info.bottled = bottledMatch[1];
  
  // Category (타입) 추출
  const categoryMatch = desc.match(/Category\s*([^\n\t]+)/i);
  if (categoryMatch) info.type = cleanText(categoryMatch[1]);
  
  // Distillery (증류소) 추출
  const distilleryMatch = desc.match(/Distillery\s*([^\n\t]+)/i);
  if (distilleryMatch) info.distillery = cleanText(distilleryMatch[1]);
  
  return info;
}

// 연도에서 숫자만 추출
function extractAge(ageText) {
  if (!ageText) return '';
  const match = ageText.match(/(\d+)/);
  return match ? match[1] : '';
}

// 도수에서 숫자만 추출
function extractAbv(abvText) {
  if (!abvText) return '';
  const match = abvText.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : '';
}

// 메인 정리 함수
async function cleanWhiskybaseData() {
  console.log('🧹 Whiskybase 데이터 정리 시작...\n');
  
  try {
    // 모든 Whiskybase 데이터 가져오기
    const { data: allWhiskies, error: fetchError } = await supabase
      .from('whiskybase_data')
      .select('*');
    
    if (fetchError) {
      console.error('❌ 데이터 조회 오류:', fetchError);
      return;
    }
    
    if (!allWhiskies || allWhiskies.length === 0) {
      console.log('⚠️ 정리할 Whiskybase 데이터가 없습니다.');
      return;
    }
    
    console.log(`📊 총 ${allWhiskies.length}개의 위스키 데이터 정리 중...\n`);
    
    const stats = {
      total: allWhiskies.length,
      cleaned: 0,
      errors: 0,
      unchanged: 0
    };
    
    // 배치 처리 (한 번에 50개씩)
    const batchSize = 50;
    const batches = Math.ceil(allWhiskies.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, allWhiskies.length);
      const batch = allWhiskies.slice(start, end);
      
      console.log(`📦 배치 ${i + 1}/${batches} 처리 중: ${start + 1}~${end}`);
      
      const updates = [];
      
      for (const whisky of batch) {
        try {
          // 원본 데이터 저장
          const originalName = whisky.name;
          const originalBrand = whisky.brand;
          const originalDescription = whisky.description;
          
          // 텍스트 정리
          const cleanedName = cleanText(whisky.name);
          const cleanedBrand = cleanText(whisky.brand);
          const cleanedDescription = cleanText(whisky.description);
          
          // description에서 추가 정보 파싱
          const parsedInfo = parseDescription(cleanedDescription);
          
          // 업데이트할 데이터 준비
          const updateData = {
            whiskybase_id: whisky.whiskybase_id,
            name: cleanedName,
            brand: cleanedBrand || parsedInfo.distillery || 'Unknown',
            age_years: extractAge(cleanText(whisky.age_years || '')),
            abv: extractAbv(cleanText(whisky.abv || parsedInfo.abv || '')),
            region: cleanText(whisky.region || ''),
            type: parsedInfo.type || cleanText(whisky.type || 'Single Malt'),
            rating: cleanText(whisky.rating || ''),
            description: cleanedDescription,
            vintage: parsedInfo.vintage || whisky.vintage || null,
            bottled_year: parsedInfo.bottled || whisky.bottled_year || null,
            distillery: parsedInfo.distillery || cleanText(whisky.distillery || ''),
            updated_at: new Date().toISOString()
          };
          
          // 변경사항이 있는지 확인
          const hasChanges = 
            originalName !== cleanedName ||
            originalBrand !== cleanedBrand ||
            originalDescription !== cleanedDescription ||
            whisky.age_years !== updateData.age_years ||
            whisky.abv !== updateData.abv ||
            whisky.type !== updateData.type;
          
          if (hasChanges) {
            updates.push(updateData);
            stats.cleaned++;
            
            if (stats.cleaned <= 5) { // 처음 5개만 로그 출력
              console.log(`✅ 정리됨: ${originalName} → ${cleanedName}`);
            }
          } else {
            stats.unchanged++;
          }
          
        } catch (error) {
          console.error(`❌ 처리 오류 (ID: ${whisky.whiskybase_id}):`, error.message);
          stats.errors++;
        }
      }
      
      // 배치 업데이트
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('whiskybase_data')
          .upsert(updates, { onConflict: 'whiskybase_id' });
        
        if (updateError) {
          console.error(`❌ 배치 ${i + 1} 업데이트 오류:`, updateError);
          stats.errors += updates.length;
          stats.cleaned -= updates.length;
        } else {
          console.log(`✅ 배치 ${i + 1} 업데이트 완료: ${updates.length}개`);
        }
      }
    }
    
    // 결과 출력
    console.log('\n📈 데이터 정리 완료!');
    console.log(`📁 총 처리: ${stats.total}개`);
    console.log(`✅ 정리됨: ${stats.cleaned}개`);
    console.log(`⏭️ 변경 없음: ${stats.unchanged}개`);
    console.log(`❌ 오류: ${stats.errors}개`);
    
    if (stats.cleaned > 0) {
      console.log('\n🎉 Whiskybase 데이터 정리가 완료되었습니다!');
      console.log('이제 검색 결과에서 깔끔한 텍스트를 볼 수 있습니다.');
    }
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanWhiskybaseData()
    .then(() => {
      console.log('\n🎉 모든 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { cleanWhiskybaseData, cleanText, parseDescription }; 