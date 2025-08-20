require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function debugHtmlStructure() {
  const mirrorDir = 'data/whiskybase-mirror-en';
  
  // 첫 번째 HTML 파일 찾기
  function findFirstHtmlFile(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const result = findFirstHtmlFile(fullPath);
        if (result) return result;
      } else if (item.name.endsWith('.html')) {
        return fullPath;
      }
    }
    return null;
  }
  
  const firstFile = findFirstHtmlFile(mirrorDir);
  if (!firstFile) {
    console.error('❌ HTML 파일을 찾을 수 없습니다.');
    return;
  }
  
  console.log(`🔍 분석할 파일: ${firstFile}`);
  
  try {
    const html = fs.readFileSync(firstFile, 'utf8');
    const $ = cheerio.load(html);
    
    console.log('\n📋 HTML 구조 분석 결과:\n');
    
    // 1. 모든 h1 태그 확인
    console.log('1️⃣ H1 태그들:');
    $('h1').each((i, el) => {
      console.log(`   ${i + 1}. "${$(el).text().trim()}"`);
    });
    
    // 2. 모든 h2 태그 확인
    console.log('\n2️⃣ H2 태그들:');
    $('h2').each((i, el) => {
      console.log(`   ${i + 1}. "${$(el).text().trim()}"`);
    });
    
    // 3. 모든 h3 태그 확인
    console.log('\n3️⃣ H3 태그들:');
    $('h3').each((i, el) => {
      console.log(`   ${i + 1}. "${$(el).text().trim()}"`);
    });
    
    // 4. 클래스명이 포함된 요소들 확인
    console.log('\n4️⃣ 클래스명이 포함된 요소들:');
    $('[class]').each((i, el) => {
      const className = $(el).attr('class');
      const text = $(el).text().trim().substring(0, 50);
      if (text && (className.includes('name') || className.includes('brand') || 
                   className.includes('type') || className.includes('region') ||
                   className.includes('age') || className.includes('abv') ||
                   className.includes('rating') || className.includes('price'))) {
        console.log(`   ${className}: "${text}..."`);
      }
    });
    
    // 5. 링크 확인
    console.log('\n5️⃣ 링크들:');
    $('a[href*="/brand/"]').each((i, el) => {
      console.log(`   ${i + 1}. "${$(el).text().trim()}" -> ${$(el).attr('href')}`);
    });
    
    // 6. 테이블 구조 확인
    console.log('\n6️⃣ 테이블 구조:');
    $('table').each((i, table) => {
      console.log(`   테이블 ${i + 1}:`);
      $(table).find('tr').each((j, row) => {
        const cells = $(row).find('td, th');
        if (cells.length > 0) {
          const rowText = cells.map((k, cell) => $(cell).text().trim()).get().join(' | ');
          console.log(`     행 ${j + 1}: ${rowText}`);
        }
      });
    });
    
    // 7. 전체 텍스트에서 키워드 검색
    console.log('\n7️⃣ 키워드 검색:');
    const fullText = $.text();
    const keywords = ['Strength', 'Vintage', 'Bottled', 'Category', 'Distillery', 'Region', 'Type'];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}[^\\n]*`, 'gi');
      const matches = fullText.match(regex);
      if (matches) {
        console.log(`   ${keyword}: ${matches.slice(0, 3).join(', ')}`);
      }
    });
    
    // 8. 이미지 확인
    console.log('\n8️⃣ 이미지들:');
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      if (src && src.includes('whisky')) {
        console.log(`   ${i + 1}. ${src} (alt: ${alt})`);
      }
    });
    
  } catch (error) {
    console.error('❌ HTML 분석 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  debugHtmlStructure();
} 