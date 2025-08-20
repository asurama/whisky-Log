import * as XLSX from 'xlsx';
import { ExportData, cleanDataForExport } from './dataCleaner';

// Excel 생성 함수 (다중 시트) - workbook 반환
export const generateExcelWorkbook = (data: ExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // 브랜드 시트
  if (data.brands.length > 0) {
    const brandsData = data.brands.map(brand => ({
      '브랜드명': brand.name,
      '국가': brand.country || '',
      '설명': brand.description || '',
      '생성일': brand.created_at
    }));
    const brandsSheet = XLSX.utils.json_to_sheet(brandsData);
    XLSX.utils.book_append_sheet(workbook, brandsSheet, '브랜드');
  }
  
  // 위스키 시트 (모든 컬럼 포함)
  if (data.bottles.length > 0) {
    const bottlesData = data.bottles.map(bottle => ({
      '임시ID': bottle.temp_id,
      '위스키명': bottle.name,
      '브랜드ID': bottle.brand_id || '',
      '커스텀브랜드': bottle.custom_brand || '',
      '지역': bottle.region || '',
      '빈티지': bottle.vintage || '',
      '숙성연수': bottle.age_years || '',
      'ABV': bottle.abv || '',
      '캐스크타입': bottle.cask_type || '',
      '색상': bottle.color || '',
      '시중가': bottle.retail_price || '',
      '구매가': bottle.purchase_price || '',
      '할인율': bottle.discount_rate || '',
      '구매장소': bottle.purchase_location || '',
      '구매일': bottle.purchase_date || '',
      '상태': bottle.bottle_status || bottle.status || 'unopened',
      '총용량(ml)': bottle.total_volume_ml || '',
      '남은용량(ml)': bottle.remaining_volume_ml || '',
      '메모': bottle.notes || '',
      '생성일': bottle.created_at
    }));
    const bottlesSheet = XLSX.utils.json_to_sheet(bottlesData);
    XLSX.utils.book_append_sheet(workbook, bottlesSheet, '위스키');
  }
  
  // 시음 기록 시트 (모든 컬럼 포함 + 위스키 정보)
  if (data.tastings.length > 0) {
    const tastingsData = data.tastings.map(tasting => ({
      '위스키ID': tasting.bottle_id || '', // temp_id로 변환된 값
      '위스키명': tasting.bottle_name || '', // 추가된 위스키명
      '브랜드': tasting.bottle_brand || '', // 추가된 브랜드 정보
      '시음타입': tasting.tasting_type || '',
      '시음날짜': tasting.tasting_date || '',
      '시음시간': tasting.tasting_time || '',
      '장소': tasting.location || '',
      '소비량(ml)': tasting.consumed_volume_ml || '',
      'Nose점수': tasting.nose_rating || '',
      'Palate점수': tasting.palate_rating || '',
      'Finish점수': tasting.finish_rating || '',
      'Overall점수': tasting.overall_rating || '',
      'Nose노트': tasting.nose_notes || '',
      'Palate노트': tasting.palate_notes || '',
      'Finish노트': tasting.finish_notes || '',
      '함께한사람': tasting.companions || '',
      '추가노트': tasting.additional_notes || '',
      '생성일': tasting.created_at
    }));
    const tastingsSheet = XLSX.utils.json_to_sheet(tastingsData);
    XLSX.utils.book_append_sheet(workbook, tastingsSheet, '시음기록');
  }
  
  // 위시리스트 시트
  if (data.wishlist.length > 0) {
    const wishlistData = data.wishlist.map(item => ({
      '위스키명': item.name,
      '브랜드': item.brand || '',
      '빈티지': item.vintage || '',
      '숙성연수': item.age_years || '',
      '예상가격': item.estimated_price || '',
      '우선순위': item.priority || '',
      '메모': item.notes || '',
      '생성일': item.created_at
    }));
    const wishlistSheet = XLSX.utils.json_to_sheet(wishlistData);
    XLSX.utils.book_append_sheet(workbook, wishlistSheet, '위시리스트');
  }
  
  return workbook;
};

// CSV 생성 함수
export const generateCSV = (data: ExportData): string => {
  const lines: string[] = [];
  
  // 헤더 추가
  lines.push('=== 위스키 로그 백업 데이터 ===');
  lines.push(`내보내기 날짜: ${new Date().toLocaleString('ko-KR')}`);
  lines.push(`버전: ${data.version}`);
  lines.push('');
  
  // 브랜드 데이터
  if (data.brands.length > 0) {
    lines.push('=== 브랜드 ===');
    lines.push('ID,브랜드명,생성일');
    data.brands.forEach(brand => {
      lines.push(`${brand.id},"${brand.name}",${brand.created_at}`);
    });
    lines.push('');
  }
  
  // 위스키 데이터
  if (data.bottles.length > 0) {
    lines.push('=== 위스키 ===');
    lines.push('ID,위스키명,브랜드ID,커스텀브랜드,빈티지,숙성연수,도수,시중가,구매가,할인율,구매장소,구매일,상태,총용량,남은용량,메모,생성일');
    data.bottles.forEach(bottle => {
      const values = [
        bottle.id,
        `"${bottle.name}"`,
        bottle.brand_id || '',
        `"${bottle.custom_brand || ''}"`,
        bottle.vintage || '',
        bottle.age_years || '',
        bottle.abv || '',
        bottle.retail_price || '',
        bottle.purchase_price || '',
        bottle.discount_rate || '',
        `"${bottle.purchase_location || ''}"`,
        bottle.purchase_date || '',
        bottle.bottle_status || bottle.status || 'unopened',
        bottle.total_volume_ml || '',
        bottle.remaining_volume_ml || '',
        `"${bottle.notes || ''}"`,
        bottle.created_at
      ];
      lines.push(values.join(','));
    });
    lines.push('');
  }
  
  // 시음 기록 데이터
  if (data.tastings.length > 0) {
    lines.push('=== 시음 기록 ===');
    lines.push('ID,위스키ID,시음타입,시음날짜,장소,소비량,Nose점수,Palate점수,Finish점수,Overall점수,Nose노트,Palate노트,Finish노트,함께한사람,추가노트,생성일');
    data.tastings.forEach(tasting => {
      const values = [
        tasting.id,
        tasting.bottle_id || '',
        tasting.tasting_type || '',
        tasting.tasting_date || '',
        `"${tasting.location || ''}"`,
        tasting.consumed_volume_ml || '',
        tasting.nose_rating || '',
        tasting.palate_rating || '',
        tasting.finish_rating || '',
        tasting.overall_rating || '',
        `"${tasting.nose_notes || ''}"`,
        `"${tasting.palate_notes || ''}"`,
        `"${tasting.finish_notes || ''}"`,
        `"${tasting.companions || ''}"`,
        `"${tasting.additional_notes || ''}"`,
        tasting.created_at
      ];
      lines.push(values.join(','));
    });
    lines.push('');
  }
  
  // 위시리스트 데이터
  if (data.wishlist.length > 0) {
    lines.push('=== 위시리스트 ===');
    lines.push('ID,위스키명,브랜드,빈티지,숙성연수,예상가격,우선순위,메모,생성일');
    data.wishlist.forEach(item => {
      const values = [
        item.id,
        `"${item.name}"`,
        `"${item.brand || ''}"`,
        item.vintage || '',
        item.age_years || '',
        item.estimated_price || '',
        item.priority || '',
        `"${item.notes || ''}"`,
        item.created_at
      ];
      lines.push(values.join(','));
    });
  }
  
  return lines.join('\n');
};

// 데이터 내보내기 메인 함수
export const exportData = async (
  user: any,
  format: 'json' | 'csv' | 'excel' = 'json',
  supabase: any
) => {
  // 1단계: 시음 기록 먼저 가져와서 참조하는 위스키 ID들 확인
  const tastingsResult = await supabase.from('tastings').select('*').eq('user_id', user.id);
  if (tastingsResult.error) throw tastingsResult.error;

  const tastings = tastingsResult.data || [];
  console.log('시음 기록 수:', tastings.length);

  // 시음 기록이 참조하는 모든 위스키 ID 수집
  const referencedBottleIds = [...new Set(tastings.map((t: any) => t.bottle_id).filter(Boolean))];
  console.log('시음 기록이 참조하는 위스키 ID들:', referencedBottleIds);

  // 2단계: 사용자의 모든 위스키 가져오기
  const bottlesResult = await supabase.from('bottles').select('*').eq('user_id', user.id);
  if (bottlesResult.error) throw bottlesResult.error;

  let bottles = bottlesResult.data || [];
  console.log('사용자 위스키 수:', bottles.length);

  // 3단계: 누락된 위스키가 있는지 확인하고 추가로 가져오기
  const existingBottleIds = bottles.map((b: any) => b.id);
  const missingBottleIds = referencedBottleIds.filter(id => !existingBottleIds.includes(id));
  
  if (missingBottleIds.length > 0) {
    console.log('누락된 위스키 ID들:', missingBottleIds);
    console.log('누락된 위스키들을 추가로 가져오는 중...');
    
    // 누락된 위스키들을 개별적으로 가져오기 (RLS 정책 우회)
    for (const missingId of missingBottleIds) {
      try {
        const missingBottleResult = await supabase
          .from('bottles')
          .select('*')
          .eq('id', missingId)
          .single();
        
        if (missingBottleResult.data && !missingBottleResult.error) {
          bottles.push(missingBottleResult.data);
          console.log(`누락된 위스키 추가됨: ${missingBottleResult.data.name} (${missingId})`);
        } else {
          console.log(`위스키를 찾을 수 없음: ${missingId}`);
        }
      } catch (error) {
        console.log(`위스키 가져오기 실패: ${missingId}`, error);
      }
    }
  }

  // 4단계: 나머지 데이터 가져오기
  const [wishlistResult, brandsResult] = await Promise.all([
    supabase.from('wishlist').select('*').eq('user_id', user.id),
    supabase.from('brands').select('*')
  ]);

  if (wishlistResult.error) throw wishlistResult.error;
  if (brandsResult.error) throw brandsResult.error;

  const fetchedData: ExportData = {
    bottles: bottles,
    tastings: tastings,
    wishlist: wishlistResult.data || [],
    brands: brandsResult.data || [],
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  // 시음 기록 데이터 상세 로깅
  console.log('=== 시음 기록 데이터 상세 분석 ===');
  console.log('시음 기록 수:', fetchedData.tastings.length);
  if (fetchedData.tastings.length > 0) {
    console.log('첫 번째 시음 기록:', fetchedData.tastings[0]);
    console.log('시음 기록 필드들:', Object.keys(fetchedData.tastings[0] as Record<string, any>));
    fetchedData.tastings.forEach((tasting, index) => {
      console.log(`시음 기록 ${index + 1}:`, {
        id: tasting.id,
        bottle_id: tasting.bottle_id,
        bottle_name: tasting.bottle_name,
        whisky_name: tasting.whisky_name,
        name: tasting.name,
        tasting_type: tasting.tasting_type,
        user_id: tasting.user_id
      });
    });
  }

  // 위스키 데이터 상세 로깅
  console.log('=== 위스키 데이터 상세 분석 ===');
  console.log('위스키 수:', fetchedData.bottles.length);
  if (fetchedData.bottles.length > 0) {
    console.log('첫 번째 위스키:', fetchedData.bottles[0]);
    console.log('위스키 필드들:', Object.keys(fetchedData.bottles[0] as Record<string, any>));
    
    // 시음 기록이 참조하는 위스키 ID들 확인
    const finalReferencedBottleIds = [...new Set(fetchedData.tastings.map(t => t.bottle_id).filter(Boolean))];
    console.log('시음 기록이 참조하는 위스키 ID들:', finalReferencedBottleIds);
    
    // 각 참조된 위스키 ID가 실제로 존재하는지 확인
    finalReferencedBottleIds.forEach(bottleId => {
      const exists = fetchedData.bottles.some(bottle => bottle.id === bottleId);
      console.log(`위스키 ID ${bottleId} 존재 여부: ${exists}`);
      if (!exists) {
        console.log(`❌ 위스키 ID ${bottleId}가 위스키 데이터에 없습니다!`);
      }
    });
  }

  // 내보내기 전 데이터 정리: ID 제거 및 시음 데이터에 위스키 정보 추가
  const cleanExportData = cleanDataForExport(fetchedData);

  if (format === 'json') {
    // JSON 파일로 다운로드
    const dataStr = JSON.stringify(cleanExportData, null, 2);
    const fileName = `whisky-log-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Blob을 사용하여 올바른 JSON 파일 생성
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (format === 'csv') {
    // CSV 파일로 다운로드
    const csvContent = generateCSV(cleanExportData);
    const fileName = `whisky-log-backup-${new Date().toISOString().split('T')[0]}.csv`;
    
    // Blob을 사용하여 올바른 CSV 파일 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (format === 'excel') {
    // Excel 파일로 다운로드 (다중 시트)
    const fileName = `whisky-log-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Excel 생성
    const workbook = generateExcelWorkbook(cleanExportData);
    
    // Blob을 사용하여 Excel 파일 생성
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return `${format.toUpperCase()} 형식으로 데이터가 성공적으로 내보내기되었습니다!`;
}; 