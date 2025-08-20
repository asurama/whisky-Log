import * as XLSX from 'xlsx';
import { ExportData } from './dataCleaner';

// CSV/스프레드시트 데이터 파싱
export const parseCSVData = async (csvText: string) => {
  console.log('CSV 파싱 시작');
  const lines = csvText.split('\n').filter(line => line.trim());
  console.log('총 라인 수:', lines.length);
  
  if (lines.length < 2) throw new Error('데이터가 없습니다.');

  const bottles: any[] = [];
  const tastings: any[] = [];
  const brands: any[] = [];
  const wishlist: any[] = [];

  let currentSection = '';
  let headers: string[] = [];
  let dataRows: string[] = [];

  // 섹션별로 데이터 파싱
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 섹션 헤더 확인
    if (line.startsWith('=== ')) {
      // 이전 섹션 처리
      if (currentSection && headers.length > 0 && dataRows.length > 0) {
        processSection(currentSection, headers, dataRows, bottles, tastings, brands, wishlist);
      }
      
      // 새 섹션 시작
      currentSection = line.replace(/=== | ===/g, '');
      headers = [];
      dataRows = [];
      console.log(`새 섹션 시작: ${currentSection}`);
      continue;
    }
    
    // 헤더 라인 확인 (첫 번째 데이터 라인)
    if (headers.length === 0 && !line.startsWith('내보내기 날짜') && !line.startsWith('버전') && line.includes(',')) {
      headers = parseCSVLine(line);
      console.log(`${currentSection} 헤더:`, headers);
      continue;
    }
    
    // 데이터 라인
    if (headers.length > 0 && line.includes(',')) {
      dataRows.push(line);
    }
  }
  
  // 마지막 섹션 처리
  if (currentSection && headers.length > 0 && dataRows.length > 0) {
    processSection(currentSection, headers, dataRows, bottles, tastings, brands, wishlist);
  }

  console.log('파싱 결과:', {
    bottles: bottles.length,
    tastings: tastings.length,
    brands: brands.length,
    wishlist: wishlist.length
  });

  return {
    bottles,
    tastings,
    brands,
    wishlist
  };
};

// CSV 라인 파싱
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

// 섹션별 데이터 처리
const processSection = (section: string, headers: string[], dataRows: string[], bottles: any[], tastings: any[], brands: any[], wishlist: any[]) => {
  console.log(`${section} 섹션 처리 중...`);
  
  dataRows.forEach((row, index) => {
    const values = parseCSVLine(row);
    
    if (values.length < headers.length) {
      console.log(`행 ${index + 1} 건너뜀: 컬럼 수 불일치`);
      return;
    }

    const rowData: any = {};
    
    // 헤더와 값 매핑
    headers.forEach((header, i) => {
      const value = values[i];
      if (value && value !== '') {
        (rowData as Record<string, any>)[header] = value;
      }
    });

    // 섹션별 처리
    switch (section) {
      case '브랜드':
        if (rowData['브랜드명']) {
          brands.push({
            name: rowData['브랜드명'],
            country: null,
            description: null
          });
        }
        break;
        
              case '위스키':
        if (rowData['위스키명'] || rowData['name']) {
          const normalizedData = normalizeRowData(rowData);
          const bottle = {
            name: normalizedData['name'] || normalizedData['위스키명'],
            custom_brand: normalizedData['custom_brand'] || normalizedData['brand'] || null,
            vintage: normalizedData['vintage'] ? parseInt(normalizedData['vintage']) : null,
            age_years: normalizedData['age_years'] ? parseInt(normalizedData['age_years']) : null,
            abv: normalizedData['abv'] ? parseFloat(normalizedData['abv']) : null,
            retail_price: normalizedData['retail_price'] ? parseFloat(normalizedData['retail_price']) : null,
            purchase_price: normalizedData['purchase_price'] ? parseFloat(normalizedData['purchase_price']) : null,
            discount_rate: normalizedData['discount_rate'] ? parseFloat(normalizedData['discount_rate']) : null,
            purchase_location: normalizedData['purchase_location'] || null,
            purchase_date: normalizedData['purchase_date'] || null,
            bottle_status: normalizedData['bottle_status'] || 'unopened',
            total_volume_ml: normalizedData['total_volume_ml'] ? parseInt(normalizedData['total_volume_ml']) : null,
            remaining_volume_ml: normalizedData['remaining_volume_ml'] ? parseInt(normalizedData['remaining_volume_ml']) : null,
            notes: normalizedData['notes'] || null
          };
          bottles.push(bottle);
          
          // 브랜드 정보 추가
          if (bottle.custom_brand) {
            const existingBrand = brands.find(b => b.name === bottle.custom_brand);
            if (!existingBrand) {
              brands.push({
                name: bottle.custom_brand,
                country: null,
                description: null
              });
            }
          }
        }
        break;
        
      case '시음 기록':
        if (rowData['위스키ID'] || rowData['위스키명']) {
          const tasting = {
            bottle_id: rowData['위스키ID'] || null,
            bottle_name: rowData['위스키명'] || null, // 위스키명으로 나중에 매핑
            tasting_type: rowData['시음타입'] || 'bottle',
            tasting_date: rowData['시음날짜'] || new Date().toISOString(),
            location: rowData['장소'] || null,
            consumed_volume_ml: rowData['소비량'] ? parseFloat(rowData['소비량']) : null,
            nose_rating: rowData['Nose점수'] ? parseInt(rowData['Nose점수']) : null,
            palate_rating: rowData['Palate점수'] ? parseInt(rowData['Palate점수']) : null,
            finish_rating: rowData['Finish점수'] ? parseInt(rowData['Finish점수']) : null,
            overall_rating: rowData['Overall점수'] ? parseInt(rowData['Overall점수']) : null,
            nose_notes: rowData['Nose노트'] || null,
            palate_notes: rowData['Palate노트'] || null,
            finish_notes: rowData['Finish노트'] || null,
            companions: rowData['함께한사람'] || null,
            additional_notes: rowData['추가노트'] || null
          };
          tastings.push(tasting);
        }
        break;
        
      case '위시리스트':
        if (rowData['위스키명']) {
          const wishlistItem = {
            name: rowData['위스키명'],
            brand: rowData['브랜드'] || null,
            vintage: rowData['빈티지'] ? parseInt(rowData['빈티지']) : null,
            age_years: rowData['숙성연수'] ? parseInt(rowData['숙성연수']) : null,
            estimated_price: rowData['예상가격'] ? parseFloat(rowData['예상가격']) : null,
            priority: rowData['우선순위'] ? parseInt(rowData['우선순위']) : null,
            notes: rowData['메모'] || null
          };
          wishlist.push(wishlistItem);
        }
        break;
    }
  });
};

// 칼럼명 매핑 함수 - 다양한 형태의 칼럼명을 표준화
const mapColumnName = (columnName: string): string => {
  const columnMap: { [key: string]: string } = {
    // 위스키명 관련
    '위스키명': 'name',
    '위스키 이름': 'name',
    'Name': 'name',
    'Whisky Name': 'name',
    
    // 브랜드 관련
    '브랜드': 'brand',
    '브랜드명': 'brand',
    '커스텀브랜드': 'custom_brand',
    'Brand': 'brand',
    'Brand Name': 'brand',
    
    // 지역 관련
    '지역': 'region',
    'Region': 'region',
    
    // 빈티지 관련
    '빈티지': 'vintage',
    'Vintage': 'vintage',
    'Year': 'vintage',
    
    // 숙성연수 관련
    '숙성연수': 'age_years',
    'Age': 'age_years',
    'Age in Years': 'age_years',
    
    // 도수 관련
    '도수': 'abv',
    'ABV': 'abv',
    'Alcohol by Volume': 'abv',
    '알코올': 'abv',
    
    // 캐스크 관련
    '캐스크': 'cask_type',
    '캐스크타입': 'cask_type',
    'Cask': 'cask_type',
    'Cask Type': 'cask_type',
    
    // 색상 관련
    '색상': 'color',
    'Color': 'color',
    
    // 가격 관련
    '시중가': 'retail_price',
    '시중가(원)': 'retail_price',
    'Market Price': 'retail_price',
    'Price': 'retail_price',
    
    '구매가': 'purchase_price',
    '구매가(원)': 'purchase_price',
    'Purchase Price': 'purchase_price',
    'Cost': 'purchase_price',
    
    // 할인율 관련
    '할인율': 'discount_rate',
    'Discount Rate': 'discount_rate',
    'Discount': 'discount_rate',
    
    // 구매 정보 관련
    '구매장소': 'purchase_location',
    'Purchase Location': 'purchase_location',
    
    '구매일': 'purchase_date',
    'Purchase Date': 'purchase_date',
    'Date': 'purchase_date',
    
    // 용량 관련
    '총용량': 'total_volume_ml',
    '용량': 'total_volume_ml',
    'Volume': 'total_volume_ml',
    'Total Volume': 'total_volume_ml',
    
    '남은용량': 'remaining_volume_ml',
    'Remaining Volume': 'remaining_volume_ml',
    'Remaining': 'remaining_volume_ml',
    
    // 상태 관련
    '상태': 'bottle_status',
    'Status': 'bottle_status',
    'Bottle Status': 'bottle_status',
    
    // 메모 관련
    '메모': 'notes',
    'Notes': 'notes',
    'Memo': 'notes',
    
    // 시음 기록 관련
    '시음타입': 'tasting_type',
    'Tasting Type': 'tasting_type',
    
    '시음날짜': 'tasting_date',
    '시음일': 'tasting_date',
    'Tasting Date': 'tasting_date',
    
    '장소': 'location',
    'Location': 'location',
    
    '소비량': 'consumed_volume_ml',
    'Consumed Volume': 'consumed_volume_ml',
    
    'Nose점수': 'nose_rating',
    '노즈점수': 'nose_rating',
    'Nose Rating': 'nose_rating',
    
    'Palate점수': 'palate_rating',
    '팔레트점수': 'palate_rating',
    'Palate Rating': 'palate_rating',
    
    'Finish점수': 'finish_rating',
    '피니쉬점수': 'finish_rating',
    'Finish Rating': 'finish_rating',
    
    'Overall점수': 'overall_rating',
    '종합점수': 'overall_rating',
    'Overall Rating': 'overall_rating',
    
    'Nose노트': 'nose_notes',
    '노즈메모': 'nose_notes',
    'Nose Notes': 'nose_notes',
    
    'Palate노트': 'palate_notes',
    '팔레트메모': 'palate_notes',
    'Palate Notes': 'palate_notes',
    
    'Finish노트': 'finish_notes',
    '피니쉬메모': 'finish_notes',
    'Finish Notes': 'finish_notes',
    
    '함께한사람': 'companions',
    'Companions': 'companions',
    
    '추가노트': 'additional_notes',
    '추가메모': 'additional_notes',
    'Additional Notes': 'additional_notes',
    
    // 위시리스트 관련
    '예상가격': 'estimated_price',
    'Estimated Price': 'estimated_price',
    
    '우선순위': 'priority',
    'Priority': 'priority',
  };
  
  return (columnMap as Record<string, string>)[columnName] || columnName;
};

// 데이터 정규화 함수
const normalizeRowData = (rowData: any): any => {
  const normalized: any = {};
  
  Object.keys(rowData).forEach(key => {
    const normalizedKey = mapColumnName(key);
    (normalized as Record<string, any>)[normalizedKey] = (rowData as Record<string, any>)[key];
  });
  
  return normalized;
};

// Excel 파일 파싱 함수
export const parseExcelFile = async (file: File): Promise<ExportData> => {
  console.log('Excel 파일 파싱 시작');
  
  // 다른 옵션으로 Excel 파일 읽기 시도
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { 
    type: 'buffer',
    cellDates: true,
    cellNF: false,
    cellText: false
  });
  
  console.log('시트 목록:', workbook.SheetNames);
  
  const bottles: any[] = [];
  const tastings: any[] = [];
  const brands: any[] = [];
  const wishlist: any[] = [];

  // 각 시트별로 처리
  for (const sheetName of workbook.SheetNames) {
    console.log(`시트 처리 중: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    
    // 시트 범위 확인
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log(`${sheetName} 시트 범위:`, range);
    
    // 시트를 JSON으로 변환 (다른 옵션 시도)
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });
    
    console.log(`${sheetName} 시트 데이터 행 수:`, sheetData.length);
    console.log(`${sheetName} 시트 첫 번째 행:`, sheetData[0]);
    console.log(`${sheetName} 시트 두 번째 행:`, sheetData[1]);
    console.log(`${sheetName} 시트 세 번째 행:`, sheetData[2]);

    if (sheetData.length < 2) {
      console.log(`${sheetName} 시트에 데이터가 없습니다.`);
      
      // 다른 방법으로 시도
      const sheetData2 = XLSX.utils.sheet_to_json(worksheet, { 
        header: 'A',
        defval: '',
        blankrows: false
      });
      console.log(`${sheetName} 시트 데이터 (방법2) 행 수:`, sheetData2.length);
      console.log(`${sheetName} 시트 데이터 (방법2) 첫 번째 행:`, sheetData2[0]);
      
      if (sheetData2.length < 2) {
        continue;
      }
      
      // 방법2로 처리
      const headers = Object.keys(sheetData2[0] as Record<string, any>);
      console.log(`${sheetName} 헤더 (방법2):`, headers);
      
      // 데이터 행 처리 (두 번째 행부터)
      for (let i = 1; i < sheetData2.length; i++) {
        const row = sheetData2[i];
        if (!row) continue;
        
        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
          if ((row as Record<string, any>)[header] !== undefined) {
            rowData[header] = (row as Record<string, any>)[header];
          }
        });
        
        // 데이터 처리 (기존 로직과 동일)
        if (rowData['A'] && rowData['A'] !== '위스키명') { // 첫 번째 칼럼이 위스키명이고 헤더가 아닌 경우
          const bottle = {
            name: rowData['A'] || '',
            custom_brand: rowData['C'] || null, // 브랜드
            vintage: rowData['E'] ? parseInt(rowData['E']) : null, // 빈티지
            age_years: rowData['F'] ? parseInt(rowData['F']) : null, // 숙성연수
            retail_price: rowData['J'] ? parseFloat(rowData['J']) : null, // 시중가
            purchase_price: rowData['K'] ? parseFloat(rowData['K']) : null, // 구매가
            discount_rate: rowData['L'] ? parseFloat(rowData['L']) : null, // 할인율
            purchase_location: rowData['M'] || null, // 구매장소
            purchase_date: rowData['N'] || null, // 구매일
            bottle_status: rowData['Q'] === '오픈' ? 'opened' : 'unopened', // 상태
            total_volume_ml: rowData['O'] ? parseInt(rowData['O']) : null, // 용량
            remaining_volume_ml: rowData['P'] ? parseInt(rowData['P']) : null, // 남은용량
            notes: rowData['R'] || null // 메모
          };
          
          if (bottle.name && bottle.name !== '위스키명') {
            bottles.push(bottle);
            console.log('추가된 보틀:', bottle);
            
            // 브랜드 정보 추가
            if (bottle.custom_brand) {
              const existingBrand = brands.find(b => b.name === bottle.custom_brand);
              if (!existingBrand) {
                brands.push({
                  name: bottle.custom_brand,
                  country: null,
                  description: null
                });
              }
            }
          }
        }
      }
      
      continue;
    }

    // 헤더 추출 (첫 번째 행)
    const headers = sheetData[0] as string[];
    console.log(`${sheetName} 헤더:`, headers);

    // 헤더 매핑 함수
    const mapHeader = (header: string): string => {
      const headerMap: { [key: string]: string } = {
        // 위스키 정보
        '위스키명': 'name',
        '브랜드': 'custom_brand',
        '빈티지': 'vintage',
        '숙성연수': 'age_years',
        '시중가': 'retail_price',
        '구매가': 'purchase_price',
        '할인율': 'discount_rate',
        '구매장소': 'purchase_location',
        '구매일': 'purchase_date',
        '상태': 'bottle_status',
        '용량': 'total_volume_ml',
        '용량(ml)': 'total_volume_ml',
        '남은용량': 'remaining_volume_ml',
        '남은용량(ml)': 'remaining_volume_ml',
        '메모': 'notes',
        
        // 브랜드 정보
        '브랜드명': 'name',
        '국가': 'country',
        '설명': 'description',
        
        // 시음 정보
        '위스키ID': 'bottle_id',
        '시음타입': 'tasting_type',
        '시음날짜': 'tasting_date',
        '장소': 'location',
        '소비량(ml)': 'consumed_volume_ml',
        '코평점': 'nose_rating',
        '입평점': 'palate_rating',
        '피니시평점': 'finish_rating',
        '종합평점': 'overall_rating',
        '코노트': 'nose_notes',
        '입노트': 'palate_notes',
        '피니시노트': 'finish_notes',
        '추가노트': 'additional_notes',
        '함께한사람': 'companions'
      };
      
      return (headerMap as Record<string, string>)[header] || header;
    };

    // 데이터 행 처리 (두 번째 행부터)
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i] as any[];
      if (!row || row.length === 0) continue;

      const rowData: any = {};
      
      // 헤더와 값 매핑 (매핑 함수 제거하고 직접 사용)
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          (rowData as Record<string, any>)[header] = (row as any[])[index];
        }
      });

      // 시트별 데이터 처리
      switch (sheetName) {
        case '브랜드':
          if (rowData['브랜드명']) {
            brands.push({
              name: rowData['브랜드명'],
              country: rowData['국가'] || null,
              description: rowData['설명'] || null
            });
          }
          break;
          
        case '위스키 컬렉션': // 시트명 수정
          if (rowData['위스키명'] || rowData['name']) {
            const normalizedData = normalizeRowData(rowData);
            const bottle = {
              name: normalizedData['name'] || normalizedData['위스키명'],
              custom_brand: normalizedData['custom_brand'] || normalizedData['brand'] || null,
              vintage: normalizedData['vintage'] ? parseInt(normalizedData['vintage']) : null,
              age_years: normalizedData['age_years'] ? parseInt(normalizedData['age_years']) : null,
              abv: normalizedData['abv'] ? parseFloat(normalizedData['abv']) : null,
              retail_price: normalizedData['retail_price'] ? parseFloat(normalizedData['retail_price']) : null,
              purchase_price: normalizedData['purchase_price'] ? parseFloat(normalizedData['purchase_price']) : null,
              discount_rate: normalizedData['discount_rate'] ? parseFloat(normalizedData['discount_rate']) : null,
              purchase_location: normalizedData['purchase_location'] || null,
              purchase_date: normalizedData['purchase_date'] ? new Date(normalizedData['purchase_date']).toISOString().split('T')[0] : null,
              bottle_status: normalizedData['bottle_status'] === '오픈' ? 'opened' : 'unopened',
              total_volume_ml: normalizedData['total_volume_ml'] ? parseInt(normalizedData['total_volume_ml']) : null,
              remaining_volume_ml: normalizedData['remaining_volume_ml'] ? parseInt(normalizedData['remaining_volume_ml']) : null,
              notes: normalizedData['notes'] || null
            };
            bottles.push(bottle);
            console.log('추가된 보틀:', bottle);
            
            // 브랜드 정보 추가
            if (bottle.custom_brand) {
              const existingBrand = brands.find(b => b.name === bottle.custom_brand);
              if (!existingBrand) {
                brands.push({
                  name: bottle.custom_brand,
                  country: null,
                  description: null
                });
              }
            }
          }
          break;
          
        case '시음 기록': // 시트명 수정
          if (rowData['위스키명']) {
            // tasting_type 매핑 함수
            const mapTastingType = (type: string): string => {
              const typeMap: { [key: string]: string } = {
                '친구 보틀': 'meeting', // 친구와 함께한 시음은 모임으로 분류
                '바 시음': 'bar',
                '모임': 'meeting',
                '개인 시음': 'bottle', // 내 보틀을 혼자 시음
                '시음회': 'meeting',
                '바': 'bar',
                '보틀': 'bottle', // 내 보틀 시음
                '혼자': 'bottle' // 혼자 시음은 내 보틀
              };
              return (typeMap as Record<string, string>)[type] || 'bottle'; // 기본값은 bottle (내 보틀)
            };

            const tasting = {
              bottle_name: rowData['위스키명'], // 위스키명으로 나중에 매핑
              tasting_type: mapTastingType(rowData['시음타입'] || 'bottle'),
              tasting_date: rowData['시음일'] ? new Date(rowData['시음일']).toISOString() : new Date().toISOString(),
              location: rowData['장소'] || null,
              consumed_volume_ml: rowData['소비량'] ? parseFloat(rowData['소비량']) : null,
              nose_rating: rowData['노즈점수'] ? Math.round(parseFloat(rowData['노즈점수'])) : null,
              palate_rating: rowData['팔레트점수'] ? Math.round(parseFloat(rowData['팔레트점수'])) : null,
              finish_rating: rowData['피니쉬점수'] ? Math.round(parseFloat(rowData['피니쉬점수'])) : null,
              overall_rating: rowData['종합점수'] ? parseFloat(parseFloat(rowData['종합점수']).toFixed(1)) : null,
              nose_notes: rowData['노즈메모'] || null,
              palate_notes: rowData['팔레트메모'] || null,
              finish_notes: rowData['피니쉬메모'] || null,
              companions: rowData['함께한사람'] || null,
              additional_notes: rowData['추가메모'] || null
            };
            tastings.push(tasting);
            console.log('추가된 시음:', tasting);
          }
          break;
          
        case '위시리스트': // 시트명 수정
          if (rowData['위스키명']) {
            const wishlistItem = {
              name: rowData['위스키명'],
              custom_brand: rowData['브랜드'] || null, // brand → custom_brand로 수정
              vintage: rowData['빈티지'] ? parseInt(rowData['빈티지']) : null,
              age_years: rowData['숙성연수'] ? parseInt(rowData['숙성연수']) : null,
              retail_price: rowData['시중가(원)'] ? parseFloat(rowData['시중가(원)']) : null,
              priority: rowData['우선순위'] === '높음' ? 3 : rowData['우선순위'] === '중간' ? 2 : 1,
              notes: rowData['메모'] || null
            };
            wishlist.push(wishlistItem);
            console.log('추가된 위시리스트:', wishlistItem);
            
            // 브랜드 정보 추가
            if (wishlistItem.custom_brand) {
              const existingBrand = brands.find(b => b.name === wishlistItem.custom_brand);
              if (!existingBrand) {
                brands.push({
                  name: wishlistItem.custom_brand,
                  country: null,
                  description: null
                });
              }
            }
          }
          break;
      }
    }
  }

  console.log('Excel 파싱 결과:', {
    bottles: bottles.length,
    tastings: tastings.length,
    brands: brands.length,
    wishlist: wishlist.length
  });

  return {
    bottles,
    tastings,
    brands,
    wishlist,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
};

// 데이터 불러오기 메인 함수
export const importData = async (
  file: File,
  user: any,
  supabase: any,
  options?: any
) => {
  console.log('파일 선택됨:', file.name, '크기:', file.size);
  
  // 옵션 처리
  const importOptions = options || {
    importBottles: true,
    importTastings: true,
    importWishlist: true,
    importBrands: true,
    bottlesMode: 'add',
    tastingsMode: 'add',
    wishlistMode: 'add',
    brandsMode: 'add'
  };
  
  console.log('가져오기 옵션:', importOptions);
  
  let importData: ExportData;

  // JSON 파일인지 확인
  if (file.name.endsWith('.json')) {
    console.log('JSON 파일 처리 중...');
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    
    try {
      importData = JSON.parse(text);
      
      // 데이터 검증 - 더 유연하게 처리
      if (!importData.bottles && !importData.tastings && !importData.wishlist && !importData.brands) {
        throw new Error('백업 파일에 유효한 데이터가 없습니다. bottles, tastings, wishlist, brands 중 하나 이상이 필요합니다.');
      }
      
      // 누락된 필드는 빈 배열로 초기화
      importData.bottles = importData.bottles || [];
      importData.tastings = importData.tastings || [];
      importData.wishlist = importData.wishlist || [];
      importData.brands = importData.brands || [];
      
      console.log('JSON 데이터:', {
        bottles: importData.bottles.length,
        tastings: importData.tastings.length,
        wishlist: importData.wishlist.length,
        brands: importData.brands.length
      });
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      throw new Error(`JSON 파일 파싱 오류: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
    }
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    // Excel 파일 처리
    console.log('Excel 파일 처리 중...');
    const excelData = await parseExcelFile(file);
    importData = {
      bottles: excelData.bottles || [],
      tastings: excelData.tastings || [],
      wishlist: excelData.wishlist || [],
      brands: excelData.brands || [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    console.log('Excel 데이터:', {
      bottles: importData.bottles.length,
      tastings: importData.tastings.length,
      wishlist: importData.wishlist.length,
      brands: importData.brands.length
    });
  } else {
    console.log('CSV 파일 처리 중...');
    
    // CSV 파일을 텍스트로 읽기
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    
    // 파일 내용이 바이너리인지 확인 (더 정확한 검사)
    const hasBinaryChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(text);
    const hasValidCSVContent = text.includes(',') && text.includes('\n');
    
    if (hasBinaryChars || !hasValidCSVContent) {
      console.error('파일이 바이너리 형식이거나 유효한 CSV가 아닙니다.');
      console.log('파일 내용 미리보기:', text.substring(0, 500));
      throw new Error('파일이 바이너리 형식이거나 유효한 CSV가 아닙니다. 텍스트 형식의 CSV 파일을 사용해주세요.');
    }
    
    // 인코딩 문제 해결 시도
    let processedText = text;
    
    // UTF-8 BOM 제거
    if (text.startsWith('\uFEFF')) {
      processedText = text.slice(1);
      console.log('UTF-8 BOM 제거됨');
    }
    
    // 한글 인코딩 디버깅
    console.log('원본 텍스트 미리보기:', text.substring(0, 200));
    console.log('처리된 텍스트 미리보기:', processedText.substring(0, 200));
    
    // 한글 인코딩 복구 시도
    try {
      // EUC-KR로 인코딩된 텍스트를 UTF-8로 변환 시도
      const decoder = new TextDecoder('euc-kr');
      const encoder = new TextEncoder();
      const bytes = encoder.encode(processedText);
      const decodedText = decoder.decode(bytes);
      
      if (decodedText.includes('보틀ID') || decodedText.includes('위스키명')) {
        processedText = decodedText;
        console.log('EUC-KR 인코딩 복구 성공');
      }
    } catch (error) {
      console.log('EUC-KR 인코딩 복구 실패, 원본 텍스트 사용');
    }
    
    // CSV 또는 스프레드시트 파일 처리
    const csvData = await parseCSVData(processedText);
    importData = {
      bottles: csvData.bottles || [],
      tastings: csvData.tastings || [],
      wishlist: csvData.wishlist || [],
      brands: csvData.brands || [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    console.log('CSV 데이터:', {
      bottles: importData.bottles.length,
      brands: importData.brands.length
    });
  }

  // 새로운 옵션 시스템 사용 (기존 window.confirm 제거)

  // 브랜드 삽입 (중복 제거)
  console.log('브랜드 처리 중...');
  const existingBrands = await supabase.from('brands').select('name');
  console.log('기존 브랜드:', existingBrands.data?.length || 0);
  
  const newBrands = importData.brands.filter(brand => 
    !existingBrands.data?.some((existing: any) => existing.name === brand.name)
  );
  console.log('새 브랜드:', newBrands.length);
  
  if (newBrands.length > 0) {
    const brandResult = await supabase.from('brands').insert(newBrands);
    if (brandResult.error) {
      console.error('브랜드 삽입 오류:', brandResult.error);
      throw brandResult.error;
    }
    console.log('브랜드 삽입 성공');
  }

  // 위스키, 시음, 위시리스트 삽입 (user_id 업데이트)
  const bottlesWithUserId = importData.bottles.map(bottle => {
    const { id, ...bottleWithoutId } = bottle; // id 필드 제거
    
    // 데이터베이스에 있는 컬럼만 필터링
    const validBottle = {
      user_id: user.id,
      name: bottleWithoutId.name,
      custom_brand: bottleWithoutId.custom_brand,
      vintage: bottleWithoutId.vintage,
      age_years: bottleWithoutId.age_years,
      abv: bottleWithoutId.abv,
      retail_price: bottleWithoutId.retail_price,
      purchase_price: bottleWithoutId.purchase_price,
      discount_rate: bottleWithoutId.discount_rate,
      purchase_location: bottleWithoutId.purchase_location,
      purchase_date: bottleWithoutId.purchase_date,
      bottle_status: bottleWithoutId.status || bottleWithoutId.bottle_status || 'unopened', // status 또는 bottle_status 사용
      total_volume_ml: bottleWithoutId.total_volume_ml,
      remaining_volume_ml: bottleWithoutId.remaining_volume_ml,
      notes: bottleWithoutId.notes
    };
    
    // undefined 값 제거
    Object.keys(validBottle).forEach(key => {
      if (validBottle[key as keyof typeof validBottle] === undefined) {
        delete validBottle[key as keyof typeof validBottle];
      }
    });
    
    return validBottle;
  });

  const tastingsWithUserId = importData.tastings.map(tasting => {
    const { id, bottle_name, ...tastingWithoutId } = tasting; // id와 bottle_name 필드 제거
    
    // 데이터베이스에 있는 컬럼만 필터링
    const validTasting = {
      user_id: user.id,
      tasting_type: tastingWithoutId.tasting_type,
      tasting_date: tastingWithoutId.tasting_date,
      location: tastingWithoutId.location,
      consumed_volume_ml: tastingWithoutId.consumed_volume_ml,
      nose_rating: tastingWithoutId.nose_rating,
      palate_rating: tastingWithoutId.palate_rating,
      finish_rating: tastingWithoutId.finish_rating,
      overall_rating: tastingWithoutId.overall_rating,
      nose_notes: tastingWithoutId.nose_notes,
      palate_notes: tastingWithoutId.palate_notes,
      finish_notes: tastingWithoutId.finish_notes,
      companions: tastingWithoutId.companions,
      additional_notes: tastingWithoutId.additional_notes
    };
    
    // undefined 값 제거
    Object.keys(validTasting).forEach(key => {
      if (validTasting[key as keyof typeof validTasting] === undefined) {
        delete validTasting[key as keyof typeof validTasting];
      }
    });
    
    return validTasting;
  });

  const wishlistWithUserId = importData.wishlist.map(item => {
    const { id, ...itemWithoutId } = item; // id 필드 제거
    
    // 데이터베이스에 있는 컬럼만 필터링
    const validWishlist = {
      user_id: user.id,
      name: itemWithoutId.name,
      custom_brand: itemWithoutId.custom_brand, // brand → custom_brand로 수정
      vintage: itemWithoutId.vintage,
      age_years: itemWithoutId.age_years,
      retail_price: itemWithoutId.retail_price,
      priority: itemWithoutId.priority || 1,
      notes: itemWithoutId.notes
    };
    
    // undefined 값 제거
    Object.keys(validWishlist).forEach(key => {
      if (validWishlist[key as keyof typeof validWishlist] === undefined) {
        delete validWishlist[key as keyof typeof validWishlist];
      }
    });
    
    return validWishlist;
  });

  console.log('데이터 삽입 중...', {
    bottles: bottlesWithUserId.length,
    tastings: tastingsWithUserId.length,
    wishlist: wishlistWithUserId.length
  });

  // 각 테이블별로 개별 삽입하여 오류 추적
  if (bottlesWithUserId.length > 0 && importOptions.importBottles) {
    console.log(`위스키 처리 모드: ${importOptions.bottlesMode}`);
    
    if (importOptions.bottlesMode === 'replace') {
      // 전체 대체: 기존 위스키 삭제 후 새로 추가
      console.log('기존 위스키 전체 삭제 중...');
      const deleteResult = await supabase.from('bottles').delete().eq('user_id', user.id);
      if (deleteResult.error) {
        console.error('기존 위스키 삭제 오류:', deleteResult.error);
        throw deleteResult.error;
      }
      console.log('기존 위스키 삭제 완료');
    }
    
    const bottleResult = await supabase.from('bottles').insert(bottlesWithUserId);
    if (bottleResult.error) {
      console.error('위스키 삽입 오류:', bottleResult.error);
      throw bottleResult.error;
    }
    console.log('위스키 삽입 성공');
    
    // 임시 ID를 실제 ID로 매핑
    const tempIdToRealIdMap = new Map();
    if (bottleResult.data) {
      bottleResult.data.forEach((insertedBottle: any, index: any) => {
        const originalBottle = bottlesWithUserId[index] as any;
        if (originalBottle.temp_id) {
          tempIdToRealIdMap.set(originalBottle.temp_id, insertedBottle.id);
        }
      });
    }
    
    // 시음 기록의 임시 bottle_id를 실제 ID로 변경
    // 시음 기록 처리
    if (tastingsWithUserId.length > 0 && importOptions.importTastings) {
      console.log(`시음 기록 처리 모드: ${importOptions.tastingsMode}`);
      
      if (importOptions.tastingsMode === 'replace') {
        // 전체 대체: 기존 시음 기록 삭제
        console.log('기존 시음 기록 전체 삭제 중...');
        const deleteResult = await supabase.from('tastings').delete().eq('user_id', user.id);
        if (deleteResult.error) {
          console.error('기존 시음 기록 삭제 오류:', deleteResult.error);
          throw deleteResult.error;
        }
        console.log('기존 시음 기록 삭제 완료');
      }
      
      // 위스키명으로 bottle_id 찾기
      const bottleNames = [...new Set(importData.tastings.map(t => t.bottle_name).filter(Boolean))];
      console.log('매칭할 위스키명들:', bottleNames);
      
      if (bottleNames.length > 0) {
        const { data: bottles } = await supabase
          .from('bottles')
          .select('id, name, vintage, age_years, custom_brand')
          .eq('user_id', user.id)
          .in('name', bottleNames);
        
        console.log('찾은 위스키들:', bottles);
        
        // 시음 기록에 bottle_id 매칭
        const processedTastings = importData.tastings.map(tasting => {
          const { bottle_name, ...tastingWithoutBottleName } = tasting;
          
          // 위스키명으로 매칭
          let matchedBottle = null;
          if (bottle_name) {
            matchedBottle = bottles?.find((b: any) => b.name === bottle_name);
          }
          
          if (matchedBottle) {
            return {
              ...tastingWithoutBottleName,
              user_id: user.id,
              bottle_id: matchedBottle.id
            };
          } else {
            console.log(`매칭되지 않은 시음 기록: ${bottle_name}`);
            return null;
          }
        }).filter(Boolean); // null 값 제거
        
        console.log(`매칭된 시음 기록: ${processedTastings.length}개`);
        
        if (processedTastings.length > 0) {
          // 데이터 검증
          console.log('첫 번째 시음 기록 샘플:', processedTastings[0]);
          
          // tasting_type 검증
          const invalidTypes = processedTastings.filter(t => !['bar', 'bottle', 'meeting'].includes(t.tasting_type));
          if (invalidTypes.length > 0) {
            console.error('잘못된 tasting_type 발견:', invalidTypes.map(t => ({ name: t.bottle_name, type: t.tasting_type })));
          }
          
          const tastingResult = await supabase.from('tastings').insert(processedTastings);
          if (tastingResult.error) {
            console.error('시음 삽입 오류:', tastingResult.error);
            console.error('오류가 발생한 데이터 샘플:', processedTastings.slice(0, 3));
            throw tastingResult.error;
          }
          console.log(`시음 삽입 성공: ${processedTastings.length}개`);
        }
        
        // 매칭되지 않은 시음 기록 수
        const unmatchedCount = importData.tastings.length - processedTastings.length;
        if (unmatchedCount > 0) {
          console.log(`매칭되지 않은 시음 기록: ${unmatchedCount}개`);
        }
      }
    }
  }

  if (wishlistWithUserId.length > 0 && importOptions.importWishlist) {
    console.log(`위시리스트 처리 모드: ${importOptions.wishlistMode}`);
    
    if (importOptions.wishlistMode === 'replace') {
      // 전체 대체: 기존 위시리스트 삭제
      console.log('기존 위시리스트 전체 삭제 중...');
      const deleteResult = await supabase.from('wishlist').delete().eq('user_id', user.id);
      if (deleteResult.error) {
        console.error('기존 위시리스트 삭제 오류:', deleteResult.error);
        throw deleteResult.error;
      }
      console.log('기존 위시리스트 삭제 완료');
    }
    
    // 위시리스트 삽입 전 사용자 ID 확인
    console.log('위시리스트 데이터 샘플:', wishlistWithUserId.slice(0, 2));
    console.log('현재 사용자 ID:', user.id);
    
    const wishlistResult = await supabase.from('wishlist').insert(wishlistWithUserId);
    if (wishlistResult.error) {
      console.error('위시리스트 삽입 오류:', wishlistResult.error);
      console.error('오류 상세:', wishlistResult.error.message);
      console.error('오류 코드:', wishlistResult.error.code);
      console.error('오류 힌트:', wishlistResult.error.hint);
      throw wishlistResult.error;
    }
    console.log('위시리스트 삽입 성공');
  }

  // 결과 메시지 생성
  const processedCounts = {
    bottles: importOptions.importBottles ? importData.bottles.length : 0,
    tastings: importOptions.importTastings ? importData.tastings.length : 0,
    wishlist: importOptions.importWishlist ? importData.wishlist.length : 0,
    brands: importOptions.importBrands ? importData.brands.length : 0
  };
  
  const resultMessage = `데이터 가져오기가 완료되었습니다! 
    ${processedCounts.bottles > 0 ? `위스키: ${processedCounts.bottles}개 ` : ''}
    ${processedCounts.tastings > 0 ? `시음: ${processedCounts.tastings}개 ` : ''}
    ${processedCounts.wishlist > 0 ? `위시리스트: ${processedCounts.wishlist}개 ` : ''}
    ${processedCounts.brands > 0 ? `브랜드: ${processedCounts.brands}개 ` : ''}`.trim();
  
  console.log('데이터 불러오기 완료');
  
  return resultMessage + ' 페이지를 새로고침해주세요.';
};