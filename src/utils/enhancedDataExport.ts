import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  includeBottles: boolean;
  includeTastings: boolean;
  includeWishlist: boolean;
  includeBrands: boolean;
  includeImages: boolean;
  format: 'json' | 'csv' | 'excel' | 'pdf';
  compression: boolean;
  metadata: boolean;
}

export interface ImportOptions {
  mergeData: boolean;
  skipDuplicates: boolean;
  validateData: boolean;
  backupBeforeImport: boolean;
}

// 향상된 데이터 내보내기
export async function enhancedExportData(
  user: any,
  options: ExportOptions,
  supabase: any
): Promise<string> {
  try {
    console.log('🔍 향상된 데이터 내보내기 시작:', options);

    // 데이터 수집
    const data: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '2.0.0',
        user: {
          id: user.id,
          email: user.email
        },
        options
      }
    };

    // 위스키 데이터
    if (options.includeBottles) {
      const { data: bottles, error: bottlesError } = await supabase
        .from('bottles')
        .select(`
          *,
          brands (id, name, country, region, description)
        `)
        .eq('user_id', user.id);
      
      if (bottlesError) throw bottlesError;
      data.bottles = bottles || [];
    }

    // 시음 기록 데이터
    if (options.includeTastings) {
      const { data: tastings, error: tastingsError } = await supabase
        .from('tastings')
        .select(`
          *,
          bottles (id, name, brands (name))
        `)
        .eq('user_id', user.id);
      
      if (tastingsError) throw tastingsError;
      data.tastings = tastings || [];
    }

    // 위시리스트 데이터
    if (options.includeWishlist) {
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist')
        .select(`
          *,
          brands (id, name, country, region)
        `)
        .eq('user_id', user.id);
      
      if (wishlistError) throw wishlistError;
      data.wishlist = wishlist || [];
    }

    // 브랜드 데이터
    if (options.includeBrands) {
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*');
      
      if (brandsError) throw brandsError;
      data.brands = brands || [];
    }

    // 이미지 데이터 (URL만 포함)
    if (options.includeImages) {
      data.images = {
        bottles: data.bottles?.filter((b: any) => b.image_url).map((b: any) => ({
          id: b.id,
          url: b.image_url
        })) || [],
        tastings: data.tastings?.filter((t: any) => t.image_url).map((t: any) => ({
          id: t.id,
          url: t.image_url
        })) || []
      };
    }

    // 통계 정보
    data.statistics = {
      totalBottles: data.bottles?.length || 0,
      totalTastings: data.tastings?.length || 0,
      totalWishlist: data.wishlist?.length || 0,
      totalBrands: data.brands?.length || 0,
      totalImages: (data.images?.bottles?.length || 0) + (data.images?.tastings?.length || 0)
    };

    // 형식별 처리
    let fileName: string;
    let fileContent: Blob;

    switch (options.format) {
      case 'json':
        fileName = `whisky-log-export-${new Date().toISOString().split('T')[0]}.json`;
        const jsonString = JSON.stringify(data, null, 2);
        fileContent = new Blob([jsonString], { type: 'application/json' });
        break;

      case 'csv':
        fileName = `whisky-log-export-${new Date().toISOString().split('T')[0]}.csv`;
        const csvContent = convertToCSV(data);
        fileContent = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        break;

      case 'excel':
        fileName = `whisky-log-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        const workbook = convertToExcel(data);
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        fileContent = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        break;

      case 'pdf':
        fileName = `whisky-log-export-${new Date().toISOString().split('T')[0]}.pdf`;
        // PDF 생성은 별도 라이브러리 필요
        throw new Error('PDF 내보내기는 아직 지원되지 않습니다.');

      default:
        throw new Error('지원하지 않는 형식입니다.');
    }

    // 압축 처리
    if (options.compression && options.format === 'json') {
      // JSON 압축 (간단한 압축)
      const compressedData = JSON.stringify(data);
      fileContent = new Blob([compressedData], { type: 'application/json' });
      fileName = fileName.replace('.json', '-compressed.json');
    }

    // 파일 다운로드
    const url = URL.createObjectURL(fileContent);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return `✅ 데이터 내보내기 완료!\n📁 파일명: ${fileName}\n📊 총 ${data.statistics.totalBottles}개 위스키, ${data.statistics.totalTastings}개 시음기록, ${data.statistics.totalWishlist}개 위시리스트`;

  } catch (error) {
    console.error('데이터 내보내기 오류:', error);
    throw new Error(`데이터 내보내기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// CSV 변환
function convertToCSV(data: any): string {
  const csvRows: string[] = [];
  
  // 위스키 데이터
  if (data.bottles && data.bottles.length > 0) {
    csvRows.push('=== 위스키 컬렉션 ===');
    const bottleHeaders = Object.keys(data.bottles[0] as Record<string, any>).join(',');
    csvRows.push(bottleHeaders);
    data.bottles.forEach((bottle: any) => {
      csvRows.push(Object.values(bottle).map(v => `"${v}"`).join(','));
    });
    csvRows.push('');
  }

  // 시음 기록 데이터
  if (data.tastings && data.tastings.length > 0) {
    csvRows.push('=== 시음 기록 ===');
    const tastingHeaders = Object.keys(data.tastings[0] as Record<string, any>).join(',');
    csvRows.push(tastingHeaders);
    data.tastings.forEach((tasting: any) => {
      csvRows.push(Object.values(tasting).map(v => `"${v}"`).join(','));
    });
    csvRows.push('');
  }

  // 위시리스트 데이터
  if (data.wishlist && data.wishlist.length > 0) {
    csvRows.push('=== 위시리스트 ===');
    const wishlistHeaders = Object.keys(data.wishlist[0] as Record<string, any>).join(',');
    csvRows.push(wishlistHeaders);
    data.wishlist.forEach((item: any) => {
      csvRows.push(Object.values(item).map(v => `"${v}"`).join(','));
    });
  }

  return csvRows.join('\n');
}

// Excel 변환
function convertToExcel(data: any): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // 위스키 시트
  if (data.bottles && data.bottles.length > 0) {
    const bottlesSheet = XLSX.utils.json_to_sheet(data.bottles);
    XLSX.utils.book_append_sheet(workbook, bottlesSheet, '위스키 컬렉션');
  }

  // 시음 기록 시트
  if (data.tastings && data.tastings.length > 0) {
    const tastingsSheet = XLSX.utils.json_to_sheet(data.tastings);
    XLSX.utils.book_append_sheet(workbook, tastingsSheet, '시음 기록');
  }

  // 위시리스트 시트
  if (data.wishlist && data.wishlist.length > 0) {
    const wishlistSheet = XLSX.utils.json_to_sheet(data.wishlist);
    XLSX.utils.book_append_sheet(workbook, wishlistSheet, '위시리스트');
  }

  // 브랜드 시트
  if (data.brands && data.brands.length > 0) {
    const brandsSheet = XLSX.utils.json_to_sheet(data.brands);
    XLSX.utils.book_append_sheet(workbook, brandsSheet, '브랜드');
  }

  // 통계 시트
  if (data.statistics) {
    const statsSheet = XLSX.utils.json_to_sheet([data.statistics]);
    XLSX.utils.book_append_sheet(workbook, statsSheet, '통계');
  }

  return workbook;
}

// 향상된 데이터 가져오기
export async function enhancedImportData(
  file: File,
  user: any,
  options: ImportOptions,
  supabase: any
): Promise<string> {
  try {
    console.log('🔍 향상된 데이터 가져오기 시작:', options);

    // 백업 생성
    if (options.backupBeforeImport) {
      console.log('📋 가져오기 전 백업 생성...');
      await enhancedExportData(user, {
        includeBottles: true,
        includeTastings: true,
        includeWishlist: true,
        includeBrands: false,
        includeImages: false,
        format: 'json',
        compression: false,
        metadata: true
      }, supabase);
    }

    // 파일 읽기
    const fileContent = await file.text();
    let data: any;

    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error('JSON 파일 형식이 올바르지 않습니다.');
    }

    // 데이터 검증
    if (options.validateData) {
      const validationResult = validateImportData(data);
      if (!validationResult.isValid) {
        throw new Error(`데이터 검증 실패: ${validationResult.errors.join(', ')}`);
      }
    }

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 브랜드 가져오기
    if (data.brands && data.brands.length > 0) {
      for (const brand of data.brands) {
        try {
          if (options.skipDuplicates) {
            const { data: existing } = await supabase
              .from('brands')
              .select('id')
              .eq('name', brand.name)
              .single();
            
            if (existing) {
              skippedCount++;
              continue;
            }
          }

          const { error } = await supabase
            .from('brands')
            .insert({
              name: brand.name,
              country: brand.country,
              region: brand.region,
              description: brand.description
            });

          if (error) throw error;
          importedCount++;
        } catch (error) {
          console.error('브랜드 가져오기 오류:', error);
          errorCount++;
        }
      }
    }

    // 위스키 가져오기
    if (data.bottles && data.bottles.length > 0) {
      for (const bottle of data.bottles) {
        try {
          if (options.skipDuplicates) {
            const { data: existing } = await supabase
              .from('bottles')
              .select('id')
              .eq('name', bottle.name)
              .eq('user_id', user.id)
              .single();
            
            if (existing) {
              skippedCount++;
              continue;
            }
          }

          const bottleData = {
            ...bottle,
            user_id: user.id,
            brand_id: null // 브랜드 ID는 나중에 매핑
          };

          const { error } = await supabase
            .from('bottles')
            .insert(bottleData);

          if (error) throw error;
          importedCount++;
        } catch (error) {
          console.error('위스키 가져오기 오류:', error);
          errorCount++;
        }
      }
    }

    // 시음 기록 가져오기
    if (data.tastings && data.tastings.length > 0) {
      for (const tasting of data.tastings) {
        try {
          const tastingData = {
            ...tasting,
            user_id: user.id,
            bottle_id: null // 보틀 ID는 나중에 매핑
          };

          const { error } = await supabase
            .from('tastings')
            .insert(tastingData);

          if (error) throw error;
          importedCount++;
        } catch (error) {
          console.error('시음 기록 가져오기 오류:', error);
          errorCount++;
        }
      }
    }

    return `✅ 데이터 가져오기 완료!\n📥 새로 가져옴: ${importedCount}개\n⏭️ 건너뜀: ${skippedCount}개\n❌ 오류: ${errorCount}개`;

  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    throw new Error(`데이터 가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 데이터 검증
function validateImportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.metadata) {
    errors.push('메타데이터가 없습니다.');
  }

  if (!data.bottles && !data.tastings && !data.wishlist && !data.brands) {
    errors.push('가져올 데이터가 없습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 