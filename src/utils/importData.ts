import { supabase } from '@/lib/supabase'
import { read, utils } from 'xlsx'

export const importData = async (
  file: File, 
  user: any, 
  bottles: any[], 
  allTastings: any[], 
  wishlist: any[], 
  brands: any[],
  fetchBottles: () => Promise<void>,
  fetchAllTastings: () => Promise<void>,
  fetchWishlist: () => Promise<void>,
  fetchBrands: () => Promise<void>
) => {
  try {
    const data = await file.arrayBuffer()
    const workbook = read(data, { type: 'array' })
    
    let importResults = {
      bottles: { added: 0, skipped: 0, errors: 0 },
      tastings: { added: 0, skipped: 0, errors: 0 },
      wishlist: { added: 0, skipped: 0, errors: 0 }
    }

    // 컬럼명 매핑 함수
    const mapColumn = (data: any, expectedColumns: string[], fallbackColumns: string[] = []) => {
      const mappedData: Record<string, any> = {}
      
      for (const expected of expectedColumns) {
        // 정확한 매칭 시도
        if (data[expected] !== undefined) {
          mappedData[expected] = data[expected]
          continue
        }
        
        // 대소문자 무시 매칭
        const lowerExpected = expected.toLowerCase()
        for (const key in data) {
          if (key.toLowerCase() === lowerExpected) {
            mappedData[expected] = data[key]
            break
          }
        }
        
        // fallback 컬럼 시도
        if (mappedData[expected] === undefined) {
          for (const fallback of fallbackColumns) {
            if (data[fallback] !== undefined) {
              mappedData[expected] = data[fallback]
              break
            }
          }
        }
        
        // 추가 매칭 규칙
        if (mappedData[expected] === undefined) {
          const columnMappings: { [key: string]: string[] } = {
            '위스키명': ['보틀ID', 'Bottle ID', 'ID'],
            '브랜드': ['Brand'],
            '지역': ['Region', '지역'],
            '빈티지': ['Vintage', 'Year'],
            '숙성연도': ['숙성연수', 'Aging Period', 'Age', 'Years Aged'],
            'ABV': ['도수', 'abv', 'Alcohol By Volume'],
            '캐스크': ['Cask', '캐스크'],
            '색상': ['Color', '색상'],
            '소매가': ['시중가', 'Market Price', 'Retail Price'],
            '구매가': ['Purchase Price', 'Buy Price'],
            '할인율': ['Discount Rate', 'Discount', '할인'],
            '구매장소': ['Purchase Location', 'Location', '구매장소'],
            '구매일': ['Purchase Date', 'Date', '구매일자'],
            '상태': ['Status', 'Bottle Status'],
            '용량': ['용량(ml)', 'Volume (ml)', 'Volume', 'Total Volume'],
            '남은량': ['남은용량(ml)', 'Remaining Volume (ml)', 'Remaining', 'Remaining Volume'],
            '메모': ['Memo', 'Notes', 'Comment'],
            '이미지URL': ['Image URL', 'Image', 'URL']
          }
          
          if (columnMappings[expected]) {
            for (const altName of columnMappings[expected]) {
              if (data[altName] !== undefined) {
                mappedData[expected] = data[altName]
                break
              }
            }
          }
        }
      }
      
      return mappedData
    }

    // 위스키 데이터 처리 (배치 처리)
    const bottlesSheet = workbook.Sheets['위스키 컬렉션']
    if (bottlesSheet) {
      const bottlesData = utils.sheet_to_json(bottlesSheet)
      console.log('가져온 위스키 데이터:', bottlesData.length, '개')
      
      // 기존 데이터를 Set으로 변환하여 빠른 검색
      const existingBottles = new Set()
      bottles.forEach(bottle => {
        const key = `${bottle.name}|${bottle.brands?.name || bottle.custom_brand || ''}|${bottle.vintage || ''}|${bottle.purchase_date || ''}`
        existingBottles.add(key)
      })
      
      // 배치 처리 (100개씩)
      const batchSize = 100
      for (let i = 0; i < bottlesData.length; i += batchSize) {
        const batch = bottlesData.slice(i, i + batchSize)
        const newBottles: any[] = []
        
        for (const bottleData of batch) {
          try {
            // 컬럼 매핑
            const mappedData = mapColumn(bottleData, [
              '위스키명', '브랜드', '지역', '빈티지', '숙성연도', 'ABV', '캐스크', '색상', '소매가', '구매가', 
              '할인율', '구매장소', '구매일', '상태', '용량', '남은량', '메모', '이미지URL'
            ], [
              'name', 'brand', 'region', 'vintage', 'age', 'abv', 'cask', 'color', 'retail_price', 'purchase_price',
              'discount', 'location', 'purchase_date', 'status', 'volume', 'remaining', 'notes', 'image'
            ])
            
            // 필수 필드 확인
            if (!mappedData['위스키명']) {
              importResults.bottles.errors++
              continue
            }

            // 중복 확인 (빠른 검색)
            const key = `${mappedData['위스키명']}|${mappedData['브랜드'] || ''}|${mappedData['빈티지'] || ''}|${mappedData['구매일'] || ''}`
            if (existingBottles.has(key)) {
              importResults.bottles.skipped++
              continue
            }

            // 새 데이터 추가 (지역, 캐스크, 색상은 메모에 포함)
            const additionalInfo: string[] = []
            if (mappedData['지역']) additionalInfo.push(`지역: ${mappedData['지역']}`)
            if (mappedData['캐스크']) additionalInfo.push(`캐스크: ${mappedData['캐스크']}`)
            if (mappedData['색상']) additionalInfo.push(`색상: ${mappedData['색상']}`)
            
            const combinedNotes = [
              mappedData['메모'] || '',
              ...additionalInfo
            ].filter(Boolean).join('\n')

            newBottles.push({
              name: mappedData['위스키명'],
              brand_id: null, // 브랜드는 나중에 처리
              custom_brand: mappedData['브랜드'] || null,
              vintage: mappedData['빈티지'] || null,
              age_years: mappedData['숙성연도'] ? parseInt(mappedData['숙성연도']) : null,
              retail_price: mappedData['소매가'] ? parseInt(mappedData['소매가']) : null,
              purchase_price: mappedData['구매가'] ? parseInt(mappedData['구매가']) : null,
              discount_rate: mappedData['할인율'] ? parseFloat(mappedData['할인율']) : null,
              purchase_location: mappedData['구매장소'] || null,
              purchase_date: mappedData['구매일'] && mappedData['구매일'] !== '#######' ? mappedData['구매일'] : null,
              bottle_status: mappedData['상태'] === '오픈' ? 'opened' : 'unopened',
              total_volume_ml: mappedData['용량'] ? parseInt(mappedData['용량']) : 750,
              remaining_volume_ml: mappedData['남은량'] ? parseInt(mappedData['남은량']) : 750,
              notes: combinedNotes || null,
              image_url: mappedData['이미지URL'] || null,
              abv: mappedData['ABV'] ? parseFloat(mappedData['ABV']) : null,
              user_id: user.id
            })
            
            importResults.bottles.added++
          } catch (error) {
            console.error('위스키 처리 오류:', error)
            importResults.bottles.errors++
          }
        }
        
        // 배치로 데이터베이스에 저장
        if (newBottles.length > 0) {
          const { error: batchError } = await supabase
            .from('bottles')
            .insert(newBottles)
          
          if (batchError) {
            console.error('위스키 배치 저장 오류:', batchError)
            importResults.bottles.errors += newBottles.length
            importResults.bottles.added -= newBottles.length
          }
        }
      }
    }

    // 시음 데이터 처리 (배치 처리)
    const tastingsSheet = workbook.Sheets['시음 기록']
    if (tastingsSheet) {
      const tastingsData = utils.sheet_to_json(tastingsSheet)
      console.log('가져온 시음 데이터:', tastingsData.length, '개')
      
      // 기존 시음 데이터를 Set으로 변환
      const existingTastings = new Set()
      allTastings.forEach(tasting => {
        const key = `${tasting.bottle_id || ''}|${tasting.tasting_date || ''}|${tasting.tasting_time || ''}`
        existingTastings.add(key)
      })
      
      // 배치 처리
      const batchSize = 100
      for (let i = 0; i < tastingsData.length; i += batchSize) {
        const batch = tastingsData.slice(i, i + batchSize)
        const newTastings: any[] = []
        
        for (const tastingData of batch) {
          try {
            // 컬럼 매핑
            const mappedData = mapColumn(tastingData, [
              '위스키명', '브랜드', '빈티지', '숙성연도', '시음일', '시음시간', '시음타입',
              '장소', '노즈평점', '팔레트평점', '피니쉬평점', '종합평점',
              '노즈메모', '팔레트메모', '피니쉬메모', '메모'
            ], [
              'name', 'brand', 'vintage', 'age', 'tasting_date', 'tasting_time', 'tasting_type',
              'location', 'nose_score', 'palate_score', 'finish_score', 'overall_score',
              'nose_notes', 'palate_notes', 'finish_notes', 'notes'
            ])
            
            // 필수 필드 확인
            if (!mappedData['위스키명'] || !mappedData['시음일']) {
              importResults.tastings.errors++
              continue
            }

            // 해당 위스키 찾기
            const targetBottle = bottles.find(b => 
              b.name === mappedData['위스키명'] &&
              (b.brands?.name || b.custom_brand) === (mappedData['브랜드'] || '')
            )
            
            if (!targetBottle) {
              importResults.tastings.errors++
              continue
            }

            // 중복 확인
            const key = `${targetBottle.id}|${mappedData['시음일']}|${mappedData['시음시간'] || ''}`
            if (existingTastings.has(key)) {
              importResults.tastings.skipped++
              continue
            }

            // 새 시음 데이터 추가
            newTastings.push({
              bottle_id: targetBottle.id,
              tasting_date: mappedData['시음일'],
              tasting_time: mappedData['시음시간'] || null,
              location: mappedData['장소'] || null,
              tasting_type: mappedData['시음타입'] === '바' ? 'bar' : 
                           mappedData['시음타입'] === '모임' ? 'meeting' : 'bottle',
              nose_score: mappedData['노즈평점'] ? parseFloat(mappedData['노즈평점']) : null,
              nose_notes: mappedData['노즈메모'] || null,
              palate_score: mappedData['팔레트평점'] ? parseFloat(mappedData['팔레트평점']) : null,
              palate_notes: mappedData['팔레트메모'] || null,
              finish_score: mappedData['피니쉬평점'] ? parseFloat(mappedData['피니쉬평점']) : null,
              finish_notes: mappedData['피니쉬메모'] || null,
              overall_score: mappedData['종합평점'] ? parseFloat(mappedData['종합평점']) : null,
              notes: mappedData['메모'] || null,
              user_id: user.id
            })
            
            importResults.tastings.added++
          } catch (error) {
            console.error('시음 처리 오류:', error)
            importResults.tastings.errors++
          }
        }
        
        // 배치로 데이터베이스에 저장
        if (newTastings.length > 0) {
          const { error: batchError } = await supabase
            .from('tastings')
            .insert(newTastings)
          
          if (batchError) {
            console.error('시음 배치 저장 오류:', batchError)
            importResults.tastings.errors += newTastings.length
            importResults.tastings.added -= newTastings.length
          }
        }
      }
    }

    // 위시리스트 데이터 처리 (배치 처리)
    const wishlistSheet = workbook.Sheets['위시리스트']
    if (wishlistSheet) {
      const wishlistData = utils.sheet_to_json(wishlistSheet)
      console.log('가져온 위시리스트 데이터:', wishlistData.length, '개')
      
      // 기존 위시리스트를 Set으로 변환
      const existingWishlist = new Set()
      wishlist.forEach(item => {
        const key = `${item.name}|${item.brands?.name || item.custom_brand || ''}|${item.vintage || ''}`
        existingWishlist.add(key)
      })
      
      // 배치 처리
      const batchSize = 100
      for (let i = 0; i < wishlistData.length; i += batchSize) {
        const batch = wishlistData.slice(i, i + batchSize)
        const newWishlist: any[] = []
        
        for (const itemData of batch) {
          try {
            // 컬럼 매핑
            const mappedData = mapColumn(itemData, [
              '위스키명', '브랜드', '지역', '빈티지', '숙성연도', 'ABV', '캐스크', '색상', '소매가', '용량', '위치', '메모', '우선순위'
            ], [
              'name', 'brand', 'region', 'vintage', 'age', 'abv', 'cask', 'color', 'retail_price', 'volume', 'location', 'notes', 'priority'
            ])
            
            // 필수 필드 확인
            if (!mappedData['위스키명']) {
              importResults.wishlist.errors++
              continue
            }

            // 중복 확인
            const key = `${mappedData['위스키명']}|${mappedData['브랜드'] || ''}|${mappedData['빈티지'] || ''}`
            if (existingWishlist.has(key)) {
              importResults.wishlist.skipped++
              continue
            }

            // 새 위시리스트 데이터 추가 (지역, 캐스크, 색상은 메모에 포함)
            const additionalInfo: string[] = []
            if (mappedData['지역']) additionalInfo.push(`지역: ${mappedData['지역']}`)
            if (mappedData['캐스크']) additionalInfo.push(`캐스크: ${mappedData['캐스크']}`)
            if (mappedData['색상']) additionalInfo.push(`색상: ${mappedData['색상']}`)
            
            const combinedNotes = [
              mappedData['메모'] || '',
              ...additionalInfo
            ].filter(Boolean).join('\n')

            newWishlist.push({
              name: mappedData['위스키명'],
              brand_id: null,
              custom_brand: mappedData['브랜드'] || null,
              vintage: mappedData['빈티지'] || null,
              age_years: mappedData['숙성연도'] ? parseInt(mappedData['숙성연도']) : null,
              retail_price: mappedData['소매가'] ? parseInt(mappedData['소매가']) : null,
              volume_ml: mappedData['용량'] ? parseInt(mappedData['용량']) : 750,
              location: mappedData['위치'] || null,
              notes: combinedNotes || null,
              priority: mappedData['우선순위'] === '높음' ? 'high' : 
                       mappedData['우선순위'] === '중간' ? 'medium' : 'low',
              abv: mappedData['ABV'] ? parseFloat(mappedData['ABV']) : null,
              user_id: user.id
            })
            
            importResults.wishlist.added++
          } catch (error) {
            console.error('위시리스트 처리 오류:', error)
            importResults.wishlist.errors++
          }
        }
        
        // 배치로 데이터베이스에 저장
        if (newWishlist.length > 0) {
          const { error: batchError } = await supabase
            .from('wishlist')
            .insert(newWishlist)
          
          if (batchError) {
            console.error('위시리스트 배치 저장 오류:', batchError)
            importResults.wishlist.errors += newWishlist.length
            importResults.wishlist.added -= newWishlist.length
          }
        }
      }
    }

    // 결과 반환
    return {
      success: true,
      results: importResults,
      message: `데이터 가져오기 완료!\n\n추가된 데이터:\n- 위스키: ${importResults.bottles.added}개\n- 시음 기록: ${importResults.tastings.added}개\n- 위시리스트: ${importResults.wishlist.added}개\n\n건너뛴 데이터 (중복):\n- 위스키: ${importResults.bottles.skipped}개\n- 시음 기록: ${importResults.tastings.skipped}개\n- 위시리스트: ${importResults.wishlist.skipped}개\n\n오류:\n- 위스키: ${importResults.bottles.errors}개\n- 시음 기록: ${importResults.tastings.errors}개\n- 위시리스트: ${importResults.wishlist.errors}개`
    }
    
  } catch (error) {
    console.error('데이터 가져오기 오류:', error)
    return {
      success: false,
      error: '데이터 가져오기 중 오류가 발생했습니다.'
    }
  }
} 