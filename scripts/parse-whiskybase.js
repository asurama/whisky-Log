const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
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
  
  // 디버깅: 원본 텍스트의 특수 문자 확인
  const hasSpecialChars = /\t|\n|\r|\f|\v|\u00A0|\u200B|\u200C|\u200D|\uFEFF|[\u2000-\u200F]|[\u2028-\u202F]/.test(text);
  if (hasSpecialChars) {
    console.log(`🔍 특수문자 발견: "${text}"`);
    console.log(`  JSON: ${JSON.stringify(text)}`);
  }
  
  return text
    .replace(/\t+/g, ' ')          // 연속된 탭을 공백으로
    .replace(/\n+/g, ' ')          // 연속된 줄바꿈을 공백으로
    .replace(/\r+/g, ' ')          // 연속된 캐리지 리턴을 공백으로
    .replace(/\f+/g, ' ')          // 폼 피드 제거
    .replace(/\v+/g, ' ')          // 수직 탭 제거
    .replace(/\s+/g, ' ')          // 연속된 공백을 하나로
    .replace(/^\s+|\s+$/g, '')     // 앞뒤 공백 제거
    .replace(/\u00A0/g, ' ')       // non-breaking space 제거
    .replace(/\u200B/g, '')        // zero-width space 제거
    .replace(/\u200C/g, '')        // zero-width non-joiner 제거
    .replace(/\u200D/g, '')        // zero-width joiner 제거
    .replace(/\uFEFF/g, '')        // byte order mark 제거
    .replace(/[\u2000-\u200F]/g, ' ') // 다양한 공백 문자들을 일반 공백으로
    .replace(/[\u2028-\u202F]/g, ' ') // 줄바꿈 및 기타 제어 문자들을 공백으로
    .trim();                       // 최종 정리
}

// 위스키 정보 파싱 함수 (정교하게 개선)
function parseWhiskyData(html, whiskyId) {
  const $ = cheerio.load(html);
  
  try {
    // 강화된 정보 추출 함수
    const extractText = (selectors) => {
      for (const selector of selectors) {
        const text = $(selector).first().text();
        if (text && text.trim()) {
          return cleanText(text);
        }
      }
      return '';
    };

    // JSON-LD 스크립트에서 정보 추출 (가장 정확함)
    let name = '', brand = '', jsonRating = '';
    
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html());
        if (jsonData.name) name = cleanText(jsonData.name);
        if (jsonData.brand && jsonData.brand.name) brand = cleanText(jsonData.brand.name);
        if (jsonData.aggregateRating && jsonData.aggregateRating.ratingValue) {
          jsonRating = jsonData.aggregateRating.ratingValue.toString();
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    });
    
    // JSON-LD에서 정보를 못 찾았을 경우 HTML에서 추출
    if (!name) {
      name = extractText([
        'h1', '.name-block', '.name', '[class*="name"]'
      ]);
    }
    
    // 이름에서 탭 문자 특별 처리
    if (name && name.includes('\t')) {
      console.log(`🔍 탭 문자 발견 (ID: ${whiskyId}):`);
      console.log(`  원본: "${name}"`);
      console.log(`  탭 위치: ${name.indexOf('\t')}`);
      console.log(`  탭 개수: ${(name.match(/\t/g) || []).length}`);
    }
    
    // 디버깅: 원본 이름과 정리된 이름 비교 (특수 문자 확인)
    if (name) {
      const originalName = name;
      const cleanedName = cleanText(name);
      if (originalName !== cleanedName) {
        console.log(`🔍 이름 정리 (ID: ${whiskyId}):`);
        console.log(`  원본: "${originalName}"`);
        console.log(`  정리: "${cleanedName}"`);
        console.log(`  특수문자: ${JSON.stringify(originalName)}`);
      }
    }
    
    if (!brand) {
      brand = extractText([
        'a[href*="/brand/"]', '.distillery', '[class*="brand"]'
      ]);
    }
    
    const type = extractText([
      '.whisky-type', '.type', '.category',
      '[class*="type"]', '[class*="category"]'
    ]);
    
    const region = extractText([
      '.whisky-region', '.region', '.origin',
      '[class*="region"]', '[class*="origin"]'
    ]);
    
    const age = extractText([
      '.whisky-age', '.age', '.years',
      '[class*="age"]', '[class*="year"]'
    ]);
    
    const abv = extractText([
      '.whisky-abv', '.abv', '.alcohol', '.strength',
      '[class*="abv"]', '[class*="alcohol"]'
    ]);
    
    const rating = jsonRating || extractText([
      '.whisky-rating .rating', '.rating', '.score',
      '[class*="rating"]', '[class*="score"]'
    ]);
    
    const price = extractText([
      '.whisky-price', '.price', '.cost',
      '[class*="price"]', '[class*="cost"]'
    ]);
    
    const description = extractText([
      '.whisky-description', '.description', '.details', '.info',
      '[class*="description"]', '[class*="details"]'
    ]);
    
    const imageUrl = $('.whisky-image img, .whisky-photo img, img[src*="whisky"]').first().attr('src');
    
    // 추가 정보 추출
    const distillery = extractText(['.distillery', '[class*="distillery"]']);
    const bottler = extractText(['.bottler', '[class*="bottler"]']);
    const vintage = extractText(['.vintage', '[class*="vintage"]']);
    const caskType = extractText(['.cask-type', '[class*="cask"]']);
    const caskNumber = extractText(['.cask-number', '[class*="cask-number"]']);
    const bottleCount = extractText(['.bottle-count', '[class*="bottle-count"]']);
    
    // 전체 텍스트에서 정보 파싱 (더 정확함)
    const parseFullText = (fullText) => {
      const info = {};
      
      // Strength (도수) 추출 - 다양한 패턴
      const strengthPatterns = [
        /Strength\s*(\d+(?:\.\d+)?)\s*%/i,
        /strength of this whisky is\s*(\d+(?:\.\d+)?)\s*%/i,
        /(\d+(?:\.\d+)?)\s*%\s*Vol/i
      ];
      
      for (const pattern of strengthPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          info.abv = match[1];
          break;
        }
      }
      
      // Vintage (빈티지) 추출
      const vintageMatch = fullText.match(/Vintage\s*(\d{4})/i);
      if (vintageMatch) info.vintage = vintageMatch[1];
      
      // Bottled (병입년도) 추출
      const bottledMatch = fullText.match(/Bottled\s*(\d{4})/i);
      if (bottledMatch) info.bottled = bottledMatch[1];
      
      // Category (타입) 추출
      const categoryMatch = fullText.match(/Category\s*([^\n\t]+)/i);
      if (categoryMatch) info.type = cleanText(categoryMatch[1]);
      
      // Distillery (증류소) 추출
      const distilleryMatch = fullText.match(/Distillery\s*([^\n\t]+)/i);
      if (distilleryMatch) info.distillery = cleanText(distilleryMatch[1]);
      
      // Age (숙성연수) 추출
      const ageMatch = fullText.match(/(\d+)\s*year/i);
      if (ageMatch) info.age = ageMatch[1];
      
      return info;
    };
    
    const fullText = $.text();
    const parsedInfo = parseFullText(fullText);
    
    // 태그 추출
    const tags = [];
    $('.tags a, .whisky-tags a, [class*="tag"] a').each((i, el) => {
      const tag = cleanText($(el).text());
      if (tag) tags.push(tag);
    });
    
    // 노트 추출
    const noseNotes = extractText(['.nose-notes', '[class*="nose"]']);
    const palateNotes = extractText(['.palate-notes', '[class*="palate"]']);
    const finishNotes = extractText(['.finish-notes', '[class*="finish"]']);
    
    // URL 추출
    const url = $('a[href*="/whisky/"]').first().attr('href');
    const whiskybaseUrl = url ? (url.startsWith('http') ? url : `https://www.whiskybase.com${url}`) : null;
    
    // 데이터 길이 제한 함수 (더 엄격하게)
    const truncateText = (text, maxLength) => {
      if (!text) return null;
      // 추가로 10자 여유를 두어 안전하게 처리
      const safeLength = maxLength - 10;
      return text.length > safeLength ? text.substring(0, safeLength) : text;
    };
    
    return {
      whiskybase_id: whiskyId, // 문자열이 아닌 정수로 처리
      name: truncateText(name, 800),
      brand: truncateText(brand || parsedInfo.distillery, 400),
      type: truncateText(type || parsedInfo.type, 200),
      region: truncateText(region, 200),
      age_years: age ? parseInt(age.replace(/\D/g, '')) : (parsedInfo.age ? parseInt(parsedInfo.age) : null),
      abv: abv ? parseFloat(abv.replace('%', '')) : (parsedInfo.abv ? parseFloat(parsedInfo.abv) : null),
      rating: rating ? parseFloat(rating) : null,
      price_usd: price ? parseFloat(price.replace(/[$,]/g, '')) : null,
      description: truncateText(description, 10000), // TEXT 필드는 충분히 길게
      image_url: truncateText(imageUrl, 2000),
      whiskybase_url: truncateText(whiskybaseUrl, 2000),
      distillery: truncateText(distillery || parsedInfo.distillery, 400),
      bottler: truncateText(bottler, 400),
      vintage: vintage ? parseInt(vintage) : (parsedInfo.vintage ? parseInt(parsedInfo.vintage) : null),
      bottled_year: parsedInfo.bottled ? parseInt(parsedInfo.bottled) : null,
      cask_type: truncateText(caskType, 400),
      cask_number: truncateText(caskNumber, 200),
      bottle_count: bottleCount ? parseInt(bottleCount) : null,
      tags: tags.length > 0 ? truncateText(tags.join(', '), 800) : null,
      nose_notes: truncateText(noseNotes, 5000),
      palate_notes: truncateText(palateNotes, 5000),
      finish_notes: truncateText(finishNotes, 5000),
      raw_html: truncateText(html.substring(0, 1000), 2000), // HTML 일부 저장 (디버깅용)
      parsed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`파싱 오류 (ID: ${whiskyId}):`, error.message);
    return null;
  }
}

// 데이터베이스에 저장
async function saveToDatabase(whiskyData) {
  try {
    // 데이터 길이 검증 및 로깅
    const fieldLengths = {
      name: whiskyData.name?.length || 0,
      brand: whiskyData.brand?.length || 0,
      type: whiskyData.type?.length || 0,
      region: whiskyData.region?.length || 0,
      distillery: whiskyData.distillery?.length || 0,
      bottler: whiskyData.bottler?.length || 0,
      cask_type: whiskyData.cask_type?.length || 0,
      cask_number: whiskyData.cask_number?.length || 0,
      tags: whiskyData.tags?.length || 0
    };
    
    // 길이 제한 확인 (더 보수적으로)
    const limits = {
      name: 800,
      brand: 400,
      type: 200,
      region: 200,
      distillery: 400,
      bottler: 400,
      cask_type: 400,
      cask_number: 200,
      tags: 800
    };
    
    // 제한을 초과하는 필드 찾기
    const exceededFields = [];
    for (const [field, length] of Object.entries(fieldLengths)) {
      if (length > limits[field]) {
        exceededFields.push(`${field}: ${length}/${limits[field]}`);
      }
    }
    
    if (exceededFields.length > 0) {
      console.log(`⚠️ 길이 초과 필드 (ID: ${whiskyData.whiskybase_id}):`, exceededFields);
      console.log(`📝 실제 데이터 길이:`, fieldLengths);
    }
    
    const { data, error } = await supabase
      .from('whiskybase_data')
      .upsert(whiskyData, { 
        onConflict: 'whiskybase_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('데이터베이스 저장 오류:', error);
      console.error('문제가 된 데이터:', whiskyData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('저장 중 예외:', error);
    return false;
  }
}

// 메인 처리 함수
async function processWhiskyFiles(clearExisting = false) {
  // 여러 가능한 디렉토리 확인
  const possibleDirs = [
    'data/whiskybase-mirror-en',
    'data/whiskybase-mirror',
    'data/whiskybase-mirror-en/www.whiskybase.com',
    'data/whiskybase-mirror/www.whiskybase.com'
  ];
  
  let mirrorDir = null;
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      mirrorDir = dir;
      console.log(`✅ 발견된 미러 디렉토리: ${dir}`);
      break;
    }
  }
  
  if (!mirrorDir) {
    console.error('❌ 미러 디렉토리를 찾을 수 없습니다. 다음 경로들을 확인해주세요:');
    possibleDirs.forEach(dir => console.error(`   - ${dir}`));
    return;
  }
  const stats = {
    total: 0,
    parsed: 0,
    saved: 0,
    errors: 0
  };
  
  console.log('🔄 Whiskybase 데이터 파싱 시작...');
  
  // 기존 데이터 삭제 옵션
  if (clearExisting) {
    console.log('🗑️ 기존 데이터 삭제 중...');
    const { error } = await supabase
      .from('whiskybase_data')
      .delete()
      .neq('whiskybase_id', '0'); // 모든 데이터 삭제
    
    if (error) {
      console.error('❌ 기존 데이터 삭제 오류:', error);
      return;
    }
    console.log('✅ 기존 데이터 삭제 완료');
  }
  
  // 디렉토리 확인 (이미 위에서 확인했으므로 제거)
  
  // HTML 파일들 찾기 (여러 경로 지원)
  const files = [];
  
  // 재귀적으로 모든 HTML 파일 찾기
  function findHtmlFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        findHtmlFiles(fullPath);
      } else if (item.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  findHtmlFiles(mirrorDir);
  
  console.log(`📁 발견된 HTML 파일: ${files.length}개`);
  
  // 각 파일 처리
  for (const file of files) {
    stats.total++;
    
    try {
      // 파일 읽기
      const html = fs.readFileSync(file, 'utf8');
      
      // 파일명에서 ID 추출
      const match = file.match(/whisky\/(\d+)/);
      if (!match) {
        console.warn(`⚠️ ID를 추출할 수 없음: ${file}`);
        stats.errors++;
        continue;
      }
      
      const whiskyId = parseInt(match[1]);
      
      // 데이터 파싱
      const whiskyData = parseWhiskyData(html, whiskyId);
      if (!whiskyData) {
        console.warn(`⚠️ 파싱 실패: ID ${whiskyId}`);
        stats.errors++;
        continue;
      }
      
      stats.parsed++;
      
      // 데이터베이스에 저장
      const saved = await saveToDatabase(whiskyData);
      if (saved) {
        stats.saved++;
        console.log(`✅ ID ${whiskyId}: ${whiskyData.name || 'Unknown'}`);
      } else {
        stats.errors++;
        console.error(`❌ 저장 실패: ID ${whiskyId}`);
      }
      
      // 진행률 표시
      if (stats.total % 10 === 0) {
        console.log(`📊 진행률: ${stats.total}/${files.length} (${Math.round(stats.total/files.length*100)}%)`);
      }
      
    } catch (error) {
      console.error(`❌ 파일 처리 오류: ${file}`, error.message);
      stats.errors++;
    }
  }
  
  // 결과 출력
  console.log('\n📈 파싱 완료!');
  console.log(`📁 총 파일: ${stats.total}`);
  console.log(`✅ 파싱 성공: ${stats.parsed}`);
  console.log(`💾 저장 성공: ${stats.saved}`);
  console.log(`❌ 오류: ${stats.errors}`);
}

// 스크립트 실행
if (require.main === module) {
  const clearExisting = process.argv.includes('--clear');
  
  if (clearExisting) {
    console.log('⚠️ 기존 데이터를 삭제하고 새로 파싱합니다.');
  }
  
  processWhiskyFiles(clearExisting)
    .then(() => {
      console.log('🎉 모든 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { parseWhiskyData, saveToDatabase }; 