const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

// 환경 변수 확인
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('✅ 환경 변수 로드 완료');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 스크래핑할 위스키 목록 (인기 위스키들)
const popularWhiskies = [
  'Macallan', 'Glenmorangie', 'Laphroaig', 'Yamazaki', 'Dalmore',
  'Balvenie', 'Ardbeg', 'Hibiki', 'Glenfiddich', 'Glenlivet',
  'Lagavulin', 'Talisker', 'Highland Park', 'Bowmore', 'Bruichladdich',
  'Springbank', 'Kilchoman', 'Bunnahabhain', 'Caol Ila', 'Port Ellen',
  'Nikka', 'Suntory', 'Kavalan', 'Amrut', 'Paul John'
];

// 스크래핑 지연 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 랜덤 지연 (봇 감지 방지)
const randomDelay = () => delay(2000 + Math.random() * 3000);

// Whiskybase 스크래핑 함수
async function scrapeWhiskybase(brand) {
  try {
    console.log(`🔍 ${brand} 스크래핑 시작...`);
    
    // 검색 URL
    const searchUrl = `https://www.whiskybase.com/search?q=${encodeURIComponent(brand)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.whiskybase.com/',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log(`❌ ${brand} 응답 오류: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = [];
    
    // 검색 결과 파싱 (실제 Whiskybase 구조에 맞게 수정 필요)
    $('.whisky-item, .search-result-item, .product-item').each((i, element) => {
      const $el = $(element);
      
      const name = $el.find('.whisky-name, .product-name, .name, h3, h4').first().text().trim();
      const brandName = $el.find('.brand-name, .distillery, .producer').first().text().trim();
      const age = $el.find('.age, .age-years, .years').first().text().trim();
      const abv = $el.find('.abv, .alcohol, .strength').first().text().trim();
      const rating = $el.find('.rating, .score, .stars').first().text().trim();
      const url = $el.find('a').first().attr('href');
      const imageUrl = $el.find('img').first().attr('src');
      
      if (name && name.length > 0) {
        results.push({
          name,
          brand: brandName || brand,
          age_years: age ? parseInt(age.match(/\d+/)?.[0]) : null,
          abv: abv ? parseFloat(abv.replace('%', '')) : null,
          rating: rating ? parseFloat(rating) : null,
          image_url: imageUrl,
          whiskybase_url: url ? (url.startsWith('http') ? url : `https://www.whiskybase.com${url}`) : null
        });
      }
    });
    
    console.log(`✅ ${brand}: ${results.length}개 결과 발견`);
    return results;
    
  } catch (error) {
    console.error(`❌ ${brand} 스크래핑 오류:`, error.message);
    return [];
  }
}

// 데이터베이스에 저장
async function saveToDatabase(whiskyData) {
  try {
    const { data, error } = await supabase
      .from('whiskybase_data')
      .upsert(whiskyData, { 
        onConflict: 'whiskybase_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('❌ 데이터베이스 저장 오류:', error);
      return false;
    }
    
    console.log(`✅ ${whiskyData.length}개 데이터 저장 완료`);
    return true;
    
  } catch (error) {
    console.error('❌ 데이터베이스 저장 오류:', error);
    return false;
  }
}

// 메인 스크래핑 함수
async function scrapeAllWhiskies() {
  console.log('🚀 Whiskybase 스크래핑 시작...');
  
  const allResults = [];
  
  for (const brand of popularWhiskies) {
    try {
      // 랜덤 지연
      await randomDelay();
      
      // 스크래핑
      const results = await scrapeWhiskybase(brand);
      
      if (results.length > 0) {
        // 데이터베이스 형식으로 변환
        const formattedResults = results.map((result, index) => ({
          whiskybase_id: `wb_${Date.now()}_${brand}_${index}`,
          name: result.name,
          brand: result.brand,
          age_years: result.age_years,
          abv: result.abv,
          region: null, // 추후 개별 페이지에서 추출
          type: 'Single Malt', // 기본값, 추후 개별 페이지에서 추출
          rating: result.rating,
          image_url: result.image_url,
          whiskybase_url: result.whiskybase_url,
          description: null, // 추후 개별 페이지에서 추출
          distillery: result.brand,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        allResults.push(...formattedResults);
        
        // 데이터베이스에 저장
        await saveToDatabase(formattedResults);
      }
      
    } catch (error) {
      console.error(`❌ ${brand} 처리 오류:`, error);
    }
  }
  
  console.log(`🎉 스크래핑 완료! 총 ${allResults.length}개 데이터 수집`);
  
  // 결과를 JSON 파일로 저장 (백업용)
  await fs.writeFile(
    path.join(__dirname, '../data/whiskybase-scraped.json'),
    JSON.stringify(allResults, null, 2)
  );
  
  return allResults;
}

// 개별 위스키 상세 정보 스크래핑 (추후 구현)
async function scrapeWhiskyDetail(whiskybaseUrl) {
  // TODO: 개별 위스키 페이지에서 상세 정보 추출
  // - 지역, 타입, 설명, 가격 등
}

// 실행
if (require.main === module) {
  scrapeAllWhiskies()
    .then(() => {
      console.log('✅ 스크래핑 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크래핑 실패:', error);
      process.exit(1);
    });
}

module.exports = {
  scrapeWhiskybase,
  scrapeAllWhiskies,
  saveToDatabase
}; 