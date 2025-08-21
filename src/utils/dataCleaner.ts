export interface ExportData {
  bottles: any[];
  tastings: any[];
  wishlist: any[];
  brands: any[];
  exportDate: string;
  version: string;
}

// 내보내기 전 데이터 정리: ID 제거 및 시음 데이터에 위스키 정보 추가
export const cleanDataForExport = (data: ExportData) => {
  console.log('=== cleanDataForExport 시작 ===');
  console.log('원본 위스키 수:', data.bottles.length);
  console.log('원본 시음 기록 수:', data.tastings.length);
  
  // 위스키 데이터 상태 확인
  console.log('=== 위스키 데이터 상태 확인 ===');
  if (data.bottles.length > 0) {
    console.log('첫 번째 위스키:', data.bottles[0]);
    console.log('첫 번째 위스키 ID:', data.bottles[0].id);
    console.log('첫 번째 위스키 이름:', data.bottles[0].name);
  } else {
    console.log('❌ 위스키 데이터가 비어있습니다!');
  }
  
  // 위스키 ID를 임시 ID로 매핑
  const bottleIdMap = new Map();
  const bottleNameMap = new Map(); // 이름으로도 매핑
  data.bottles.forEach((bottle, index) => {
    if (!bottle.id) {
      console.log(`❌ 위스키 ${index + 1}에 ID가 없습니다:`, bottle);
      return;
    }
    const tempId = `temp_bottle_${index + 1}`;
    bottleIdMap.set(bottle.id, tempId);
    bottleNameMap.set(bottle.name, tempId); // 이름으로도 매핑
    console.log(`위스키 매핑: ${bottle.id} -> ${tempId} (${bottle.name})`);
  });

  console.log('=== bottleIdMap 내용 확인 ===');
  console.log('bottleIdMap 크기:', bottleIdMap.size);
  bottleIdMap.forEach((tempId, realId) => {
    console.log(`매핑 확인: ${realId} -> ${tempId}`);
  });

  // 위스키 데이터에서 ID 제거하고 임시 ID 추가
  const cleanBottles = data.bottles.map((bottle, index) => {
    const { id, ...bottleWithoutId } = bottle;
    return {
      ...bottleWithoutId,
      temp_id: `temp_bottle_${index + 1}` // 임시 ID 추가
    };
  });

  // 시음 기록 데이터 정리 (개선된 매칭 로직)
  const cleanTastings = data.tastings.map((tasting, index) => {
    const { id, ...tastingWithoutId } = tasting;
    
    const cleanTasting = { ...tastingWithoutId };
    
    console.log(`=== 시음 기록 ${index + 1} 처리 ===`);
    console.log(`원본 tasting.bottle_id: ${tasting.bottle_id}`);
    console.log(`원본 tasting.bottle_name: ${tasting.bottle_name}`);
    console.log(`원본 tasting.tasting_type: ${tasting.tasting_type}`);
    
    // bottleIdMap에 해당 bottle_id가 있는지 확인
    if (tasting.bottle_id) {
      console.log(`bottleIdMap.has(${tasting.bottle_id}): ${bottleIdMap.has(tasting.bottle_id)}`);
    }
    
    let matchedTempId = null;
    let matchedBottle = null;
    
    // 1. bottle_id가 있고 위스키 ID 매핑에 있는 경우 (보유 위스키 시음)
    if (tasting.bottle_id && bottleIdMap.has(tasting.bottle_id)) {
      matchedTempId = bottleIdMap.get(tasting.bottle_id);
      matchedBottle = data.bottles.find(b => b.id === tasting.bottle_id);
      console.log(`✅ 보유 위스키 시음 변환 성공: ${tasting.bottle_id} -> ${matchedTempId}`);
    }
    // 2. bottle_id가 있지만 위스키 ID 매핑에 없는 경우 (참조된 위스키가 삭제됨)
    else if (tasting.bottle_id && !bottleIdMap.has(tasting.bottle_id)) {
      console.log(`⚠️ 참조된 위스키가 삭제됨: ${tasting.bottle_id}`);
      // 삭제된 위스키 대신 bottle_name으로 매칭 시도
      if (tasting.bottle_name && bottleNameMap.has(tasting.bottle_name)) {
        matchedTempId = bottleNameMap.get(tasting.bottle_name);
        matchedBottle = data.bottles.find(b => b.name === tasting.bottle_name);
        console.log(`✅ 이름으로 매칭 성공: ${tasting.bottle_name} -> ${matchedTempId}`);
      }
    }
    // 3. bottle_id가 null이지만 bottle_name이 있는 경우 (바/모임 시음)
    else if (!tasting.bottle_id && tasting.bottle_name) {
      // bottle_name으로 해당 위스키를 찾아서 temp_id 설정
      if (bottleNameMap.has(tasting.bottle_name)) {
        matchedTempId = bottleNameMap.get(tasting.bottle_name);
        matchedBottle = data.bottles.find(b => b.name === tasting.bottle_name);
        console.log(`✅ 바/모임 시음 변환 성공: ${tasting.bottle_name} -> ${matchedTempId}`);
      } else {
        console.log(`❌ 매칭되는 위스키 없음: ${tasting.bottle_name}`);
      }
    } else {
      console.log(`❌ bottle_id 없음, bottle_name도 없음`);
    }
    
    // 매칭된 위스키 정보를 시음 기록에 추가
    if (matchedBottle) {
      cleanTasting.bottle_id = matchedTempId;
      cleanTasting.bottle_name = matchedBottle.name; // 위스키명 추가
      cleanTasting.bottle_brand = matchedBottle.custom_brand || matchedBottle.brand_id; // 브랜드 정보 추가
      console.log(`✅ 위스키 정보 추가됨: ${matchedBottle.name} (${matchedBottle.custom_brand})`);
    } else {
      cleanTasting.bottle_id = null;
      console.log(`❌ 매칭된 위스키 없음`);
    }
    
    console.log(`최종 cleanTasting.bottle_id: ${cleanTasting.bottle_id}`);
    console.log(`=== 시음 기록 ${index + 1} 처리 완료 ===`);
    return cleanTasting;
  });

  console.log('=== cleanDataForExport 완료 ===');
  console.log('정리된 위스키 수:', cleanBottles.length);
  console.log('정리된 시음 기록 수:', cleanTastings.length);
  console.log('정리된 시음 기록 전체:', cleanTastings);
  console.log('정리된 시음 기록 bottle_id들:', cleanTastings.map(t => t.bottle_id));

  // 위시리스트 데이터에서 ID 제거
  const cleanWishlist = data.wishlist.map(wish => {
    const { id, ...wishWithoutId } = wish;
    return wishWithoutId;
  });

  // 브랜드 데이터에서 ID 제거
  const cleanBrands = data.brands.map(brand => {
    const { id, ...brandWithoutId } = brand;
    return brandWithoutId;
  });

  return {
    bottles: cleanBottles,
    tastings: cleanTastings,
    wishlist: cleanWishlist,
    brands: cleanBrands,
    exportDate: data.exportDate,
    version: data.version
  };
}; 