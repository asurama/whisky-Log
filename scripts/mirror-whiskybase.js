const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

// 미러링할 디렉토리
const MIRROR_DIR = path.join(__dirname, '../data/whiskybase-mirror');

// wget을 사용한 사이트 미러링
async function mirrorWhiskybase() {
  console.log('🔄 Whiskybase 사이트 미러링 시작...');
  
  // 미러링 디렉토리 생성
  await fs.mkdir(MIRROR_DIR, { recursive: true });
  
  const wgetCommand = `wget --mirror \
    --convert-links \
    --adjust-extension \
    --page-requisites \
    --no-parent \
    --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
    --wait=3 \
    --random-wait \
    --limit-rate=100k \
    --tries=2 \
    --timeout=60 \
    --retry-connrefused \
    --no-verbose \
    --quiet \
    --directory-prefix=${MIRROR_DIR} \
    --level=2 \
    --max-redirect=5 \
    --reject=pdf,zip,exe,mp3,mp4,avi \
    --accept=html,htm,css,js,jpg,jpeg,png,gif \
    https://www.whiskybase.com`;
  
  return new Promise((resolve, reject) => {
    console.log('📥 wget 명령어 실행 중...');
    console.log('⚠️ 이 작업은 시간이 오래 걸릴 수 있습니다 (10-30분)...');
    
    exec(wgetCommand, {
      maxBuffer: 1024 * 1024 * 10, // 10MB 버퍼
      timeout: 1800000 // 30분 타임아웃
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 미러링 오류:', error.message);
        // wget이 일부 성공했을 수도 있으므로 계속 진행
        console.log('⚠️ 일부 오류가 발생했지만 계속 진행합니다...');
        resolve();
        return;
      }
      
      console.log('✅ 미러링 완료!');
      if (stdout) console.log('stdout:', stdout.substring(0, 1000) + '...');
      if (stderr) console.log('stderr:', stderr.substring(0, 1000) + '...');
      
      resolve();
    });
  });
}

// 미러링된 파일에서 위스키 데이터 추출
async function extractWhiskyData() {
  console.log('🔍 미러링된 파일에서 위스키 데이터 추출 중...');
  
  const whiskyData = [];
  
  try {
    // 미러링된 디렉토리 탐색
    const files = await getAllHtmlFiles(MIRROR_DIR);
    console.log(`📄 ${files.length}개의 HTML 파일 발견`);
    
    for (const file of files) {
      try {
        const html = await fs.readFile(file, 'utf-8');
        const $ = cheerio.load(html);
        
        // 위스키 상세 페이지인지 확인
        if (file.includes('/whiskies/whisky/')) {
          const whisky = extractWhiskyFromPage($, file);
          if (whisky) {
            whiskyData.push(whisky);
          }
        }
        
        // 검색 결과 페이지에서도 추출
        if (file.includes('/search')) {
          const searchResults = extractWhiskyFromSearchPage($, file);
          whiskyData.push(...searchResults);
        }
        
      } catch (error) {
        console.error(`❌ 파일 처리 오류 ${file}:`, error.message);
      }
    }
    
    console.log(`✅ 총 ${whiskyData.length}개의 위스키 데이터 추출 완료`);
    return whiskyData;
    
  } catch (error) {
    console.error('❌ 데이터 추출 오류:', error);
    return [];
  }
}

// 모든 HTML 파일 찾기
async function getAllHtmlFiles(dir) {
  const files = [];
  
  async function scanDirectory(currentDir) {
    try {
      const items = await fs.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (item.endsWith('.html') || item.endsWith('.htm')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ 디렉토리 스캔 오류 ${currentDir}:`, error.message);
    }
  }
  
  await scanDirectory(dir);
  return files;
}

// 위스키 상세 페이지에서 데이터 추출
function extractWhiskyFromPage($, filePath) {
  try {
    const name = $('h1, .whisky-name, .product-name').first().text().trim();
    const brand = $('.brand-name, .distillery, .producer').first().text().trim();
    const age = $('.age, .age-years, .years').first().text().trim();
    const abv = $('.abv, .alcohol, .strength').first().text().trim();
    const rating = $('.rating, .score, .stars').first().text().trim();
    const region = $('.region, .location').first().text().trim();
    const type = $('.type, .category').first().text().trim();
    const description = $('.description, .notes, .summary').first().text().trim();
    
    if (!name) return null;
    
    // URL에서 ID 추출
    const urlMatch = filePath.match(/\/whiskies\/whisky\/(\d+)/);
    const whiskybaseId = urlMatch ? urlMatch[1] : `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      whiskybase_id: `wb_${whiskybaseId}`,
      name,
      brand: brand || 'Unknown',
      age_years: age ? parseInt(age.match(/\d+/)?.[0]) : null,
      abv: abv ? parseFloat(abv.replace('%', '')) : null,
      region: region || null,
      type: type || 'Single Malt',
      rating: rating ? parseFloat(rating) : null,
      description: description || null,
      distillery: brand || null,
      whiskybase_url: `https://www.whiskybase.com/whiskies/whisky/${whiskybaseId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ 페이지 파싱 오류 ${filePath}:`, error.message);
    return null;
  }
}

// 검색 결과 페이지에서 데이터 추출
function extractWhiskyFromSearchPage($, filePath) {
  const results = [];
  
  try {
    $('.whisky-item, .search-result-item, .product-item').each((i, element) => {
      const $el = $(element);
      
      const name = $el.find('.whisky-name, .product-name, .name, h3, h4').first().text().trim();
      const brand = $el.find('.brand-name, .distillery, .producer').first().text().trim();
      const age = $el.find('.age, .age-years, .years').first().text().trim();
      const abv = $el.find('.abv, .alcohol, .strength').first().text().trim();
      const rating = $el.find('.rating, .score, .stars').first().text().trim();
      const url = $el.find('a').first().attr('href');
      
      if (name && name.length > 0) {
        const urlMatch = url?.match(/\/whiskies\/whisky\/(\d+)/);
        const whiskybaseId = urlMatch ? urlMatch[1] : `wb_${Date.now()}_${i}`;
        
        results.push({
          whiskybase_id: `wb_${whiskybaseId}`,
          name,
          brand: brand || 'Unknown',
          age_years: age ? parseInt(age.match(/\d+/)?.[0]) : null,
          abv: abv ? parseFloat(abv.replace('%', '')) : null,
          region: null,
          type: 'Single Malt',
          rating: rating ? parseFloat(rating) : null,
          description: null,
          distillery: brand || null,
          whiskybase_url: url ? (url.startsWith('http') ? url : `https://www.whiskybase.com${url}`) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
    
  } catch (error) {
    console.error(`❌ 검색 페이지 파싱 오류 ${filePath}:`, error.message);
  }
  
  return results;
}

// 메인 함수
async function main() {
  try {
    // 1. 사이트 미러링
    await mirrorWhiskybase();
    
    // 2. 데이터 추출
    const whiskyData = await extractWhiskyData();
    
    // 3. JSON 파일로 저장
    const outputFile = path.join(__dirname, '../data/whiskybase-mirrored.json');
    await fs.writeFile(outputFile, JSON.stringify(whiskyData, null, 2));
    
    console.log(`🎉 미러링 완료! ${whiskyData.length}개 데이터를 ${outputFile}에 저장했습니다.`);
    
    // 4. 중복 제거
    const uniqueData = whiskyData.filter((item, index, self) => 
      index === self.findIndex(t => t.whiskybase_id === item.whiskybase_id)
    );
    
    console.log(`📊 중복 제거 후: ${uniqueData.length}개 데이터`);
    
    // 5. 데이터베이스에 저장 (선택사항)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('💾 데이터베이스에 저장 중...');
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { error } = await supabase
        .from('whiskybase_data')
        .upsert(uniqueData, { onConflict: 'whiskybase_id' });
      
      if (error) {
        console.error('❌ 데이터베이스 저장 오류:', error);
      } else {
        console.log('✅ 데이터베이스 저장 완료!');
      }
    }
    
  } catch (error) {
    console.error('❌ 미러링 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = {
  mirrorWhiskybase,
  extractWhiskyData
}; 