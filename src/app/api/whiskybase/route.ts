import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// 정적 사이트 생성과 호환되도록 설정
export const dynamic = 'force-static';

interface WhiskybaseResult {
  id: string;
  name: string;
  brand: string;
  age?: string;
  abv?: string;
  region?: string;
  type?: string;
  rating?: string;
  vintage?: string;
  bottled_year?: string;
  volume_ml?: string;
  cask_number?: string;
  imageUrl?: string;
  url: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const debug = searchParams.get('debug') === 'true';

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  try {
    const results = await searchWhiskybase(query, debug);
    
    const response: any = {
      results: results,
      total: results.length,
      query: query
    };

    // 디버그 모드일 때 추가 정보 포함
    if (debug) {
      response.debug = {
        searchQuery: query,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        totalResults: results.length,
        sampleResults: results.slice(0, 3).map(r => ({
          name: r.name,
          brand: r.brand,
          age: r.age,
          abv: r.abv,
          rating: r.rating
        }))
      };
    }
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Whiskybase 검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// 실제 Whiskybase 검색 함수
async function searchWhiskybase(query: string, debug: boolean = false) {
  try {
    console.log(`🔍 Whiskybase 검색 시작: "${query}"`);
    
    // 실제 Whiskybase 스크래핑 시도
    const scrapedResults = await scrapeWhiskybase(query, debug);
    
    if (scrapedResults.length > 0) {
      console.log(`✅ Whiskybase에서 ${scrapedResults.length}개 결과 발견`);
      return scrapedResults;
    }
    
    // 스크래핑 실패 시 빈 결과 반환
    console.log(`⚠️ 스크래핑 결과 없음 (${scrapedResults.length}개)`);
    return [];
    
  } catch (error) {
    console.error('❌ Whiskybase 검색 오류:', error);
    console.log(`🔄 오류로 인해 빈 결과 반환`);
    return [];
  }
}

// 실제 Whiskybase 스크래핑 함수
async function scrapeWhiskybase(query: string, debug: boolean = false) {
  try {
    console.log(`🔍 Whiskybase 스크래핑 시작: ${query}`);
    
    // 요청 전 지연 시간 추가 (봇 감지 방지)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const searchUrl = `https://www.whiskybase.com/search?q=${encodeURIComponent(query)}`;
    console.log(`📡 요청 URL: ${searchUrl}`);
    
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
      }
    });

    if (!response.ok) {
      console.error(`❌ HTTP 오류: ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();
    console.log(`📄 HTML 응답 크기: ${html.length} bytes`);

    if (debug) {
      console.log(`🔍 디버그: HTML 미리보기 (처음 500자)`);
      console.log(html.substring(0, 500));
      console.log(`🔍 디버그: HTML 끝부분 (마지막 500자)`);
      console.log(html.substring(html.length - 500));
    }

    if (html.length < 1000) {
      console.error(`❌ HTML 응답이 너무 짧음: ${html.length} bytes`);
      if (debug) {
        console.log(`🔍 디버그: 전체 HTML 내용`);
        console.log(html);
      }
      return [];
    }

    const $ = cheerio.load(html);
    const results: WhiskybaseResult[] = [];

    if (debug) {
      console.log(`🔍 디버그: 페이지 제목: ${$('title').text()}`);
      console.log(`🔍 디버그: 메타 설명: ${$('meta[name="description"]').attr('content')}`);
      console.log(`🔍 디버그: body 텍스트 길이: ${$('body').text().length}`);
    }

    // 다양한 선택자 시도
    const selectors = [
      '.whisky-item',
      '.search-result',
      '.whisky-card',
      '.product-item',
      '[class*="whisky"]',
      '[class*="search"]',
      '.item',
      'tr'
    ];

    console.log(`🔍 ${selectors.length}개 선택자로 검색 시도`);

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`📊 선택자 "${selector}": ${elements.length}개 요소 발견`);

      if (debug && elements.length > 0) {
        console.log(`🔍 디버그: 선택자 "${selector}" 첫 번째 요소 HTML`);
        console.log(elements.first().html()?.substring(0, 300));
      }

      if (elements.length > 0) {
        elements.each((index, element) => {
          const $el = $(element);
          
          // 이름 추출 (다양한 선택자 시도)
          const nameSelectors = [
            'h3', 'h4', '.name', '.title', '.whisky-name',
            '[class*="name"]', '[class*="title"]', 'a', 'strong', 'b'
          ];
          
          let name = '';
          for (const nameSelector of nameSelectors) {
            name = $el.find(nameSelector).first().text().trim();
            if (name && name.length > 3) break;
          }
          
          // 브랜드 추출
          const brandSelectors = [
            '.brand', '.distillery', '.producer',
            '[class*="brand"]', '[class*="distillery"]'
          ];
          
          let brand = '';
          for (const brandSelector of brandSelectors) {
            brand = $el.find(brandSelector).first().text().trim();
            if (brand) break;
          }
          
          // 연도/나이 추출
          const ageSelectors = [
            '.age', '.years', '.vintage',
            '[class*="age"]', '[class*="year"]'
          ];
          
          let age = '';
          for (const ageSelector of ageSelectors) {
            age = $el.find(ageSelector).first().text().trim();
            if (age) break;
          }
          
          // 도수 추출
          const abvSelectors = [
            '.abv', '.alcohol', '.proof',
            '[class*="abv"]', '[class*="alcohol"]'
          ];
          
          let abv = '';
          for (const abvSelector of abvSelectors) {
            abv = $el.find(abvSelector).first().text().trim();
            if (abv) break;
          }
          
          // 평점 추출
          const ratingSelectors = [
            '.rating', '.score', '.stars', '.grade',
            '[class*="rating"]', '[class*="score"]'
          ];
          
          let rating = '';
          for (const ratingSelector of ratingSelectors) {
            rating = $el.find(ratingSelector).first().text().trim();
            if (rating) break;
          }
          
          // URL 추출
          const url = $el.find('a').first().attr('href');
          
          if (name && name.length > 0) {
            // 강화된 데이터 정리 함수
            const cleanText = (text: string) => {
              return text
                .replace(/\t+/g, ' ')          // 연속된 탭을 공백으로
                .replace(/\n+/g, ' ')          // 연속된 줄바꿈을 공백으로
                .replace(/\r+/g, ' ')          // 연속된 캐리지 리턴을 공백으로
                .replace(/\s+/g, ' ')          // 연속된 공백을 하나로
                .replace(/^\s+|\s+$/g, '')     // 앞뒤 공백 제거
                .replace(/\u00A0/g, ' ')       // non-breaking space 제거
                .replace(/\u200B/g, '')        // zero-width space 제거
                .trim();                       // 최종 정리
            };

            // 연도에서 숫자만 추출
            const extractAge = (ageText: string) => {
              const match = ageText.match(/(\d+)/);
              return match ? match[1] : '';
            };

            // 도수에서 숫자만 추출
            const extractAbv = (abvText: string) => {
              const match = abvText.match(/(\d+(?:\.\d+)?)/);
              return match ? match[1] : '';
            };

            // description에서 추가 정보 추출
            const description = $el.find('.description, .details, .info').text() || '';
            const cleanDescription = cleanText(description);
            
            // description에서 정보 파싱
            const parseDescription = (desc: string) => {
              const info: any = {};
              
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
            };
            
            const parsedInfo = parseDescription(cleanDescription);
            
            const result = {
              id: `wb_${Date.now()}_${results.length}`,
              name: cleanText(name),
              brand: cleanText(brand || parsedInfo.distillery || 'Unknown'),
              age: extractAge(cleanText(age || '')),
              abv: extractAbv(cleanText(abv || parsedInfo.abv || '')),
              region: '',
              type: parsedInfo.type || 'Single Malt',
              rating: cleanText(rating || ''),
              vintage: parsedInfo.vintage || '',
              bottled_year: parsedInfo.bottled || '',
              volume_ml: '', // Whiskybase에서 용량 정보는 별도로 파싱 필요
              cask_number: '', // Whiskybase에서 캐스크 번호는 별도로 파싱 필요
              imageUrl: '',
              url: url ? (url.startsWith('http') ? url : `https://www.whiskybase.com${url}`) : '',
              description: cleanDescription
            };
            
            if (debug) {
              console.log(`🔍 디버그: 원본 데이터`);
              console.log(`  - 원본 이름: "${name}"`);
              console.log(`  - 원본 브랜드: "${brand}"`);
              console.log(`  - 원본 연도: "${age}"`);
              console.log(`  - 원본 도수: "${abv}"`);
              console.log(`  - 원본 평점: "${rating}"`);
              console.log(`  - 원본 설명: "${cleanDescription.substring(0, 200)}..."`);
              console.log(`🔍 디버그: 파싱된 정보`);
              console.log(`  - 파싱된 도수: "${parsedInfo.abv}"`);
              console.log(`  - 파싱된 빈티지: "${parsedInfo.vintage}"`);
              console.log(`  - 파싱된 병입년도: "${parsedInfo.bottled}"`);
              console.log(`  - 파싱된 타입: "${parsedInfo.type}"`);
              console.log(`  - 파싱된 증류소: "${parsedInfo.distillery}"`);
              console.log(`🔍 디버그: 정리된 데이터`);
              console.log(`  - 정리된 이름: "${result.name}"`);
              console.log(`  - 정리된 브랜드: "${result.brand}"`);
              console.log(`  - 정리된 연도: "${result.age}"`);
              console.log(`  - 정리된 도수: "${result.abv}"`);
              console.log(`  - 정리된 평점: "${result.rating}"`);
              console.log(`  - 정리된 타입: "${result.type}"`);
            }
            
            console.log(`✅ 발견된 위스키:`, result);
            results.push(result);
            
            // 제한 없음 - 모든 결과 수집
            // if (results.length >= 50) return false;
          }
        });
        
        if (results.length > 0) {
          console.log(`🎉 선택자 "${selector}"에서 ${results.length}개 결과 발견!`);
          break;
        }
      }
    }
    
    console.log(`📊 최종 스크래핑 결과: ${results.length}개`);
    
    if (results.length === 0) {
      console.log(`⚠️ 스크래핑 결과가 없음. HTML 구조 분석:`);
      console.log(`📄 body 내용:`, $('body').text().substring(0, 1000));
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Whiskybase 스크래핑 오류:', error);
    console.error('❌ 오류 상세:', error instanceof Error ? error.message : '알 수 없는 오류');
    return [];
  }
} 