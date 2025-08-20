import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 정적 사이트 생성과 호환되도록 설정
export const dynamic = 'force-static';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '1000'); // 기본값을 1000으로 증가
  const offset = parseInt(searchParams.get('offset') || '0');
  const debug = searchParams.get('debug') === 'true';

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  try {
    console.log(`🔍 데이터베이스에서 "${query}" 검색 시작`);

    // 전체 텍스트 검색
    const { data: searchResults, error: searchError } = await supabase
      .from('whiskybase_data')
      .select('*')
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english'
      })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (searchError) {
      console.error('검색 오류:', searchError);
      throw searchError;
    }

    // 전체 텍스트 검색 결과가 없으면 부분 매칭 검색
    let results = searchResults || [];
    
    if (results.length === 0) {
      console.log('전체 텍스트 검색 결과 없음, 부분 매칭 검색 시도');
      
      const { data: partialResults, error: partialError } = await supabase
        .from('whiskybase_data')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,distillery.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1);

      if (partialError) {
        console.error('부분 매칭 검색 오류:', partialError);
        throw partialError;
      }

      results = partialResults || [];
    }

    // 결과 형식 변환
    const formattedResults = results.map(whisky => ({
      id: whisky.whiskybase_id,
      name: whisky.name,
      brand: whisky.brand,
      age: whisky.age_years?.toString() || '',
      abv: whisky.abv ? `${whisky.abv}%` : '',
      region: whisky.region || '',
      type: whisky.type || '',
      rating: whisky.rating?.toString() || '',
      vintage: whisky.vintage?.toString() || '',
      bottled_year: whisky.bottled_year?.toString() || '',
      volume_ml: whisky.volume_ml?.toString() || '',
      cask_number: whisky.cask_number || '',
      imageUrl: whisky.image_url || '',
      url: whisky.whiskybase_url || '',
      description: whisky.description || '',
      distillery: whisky.distillery || whisky.brand
    }));

    console.log(`✅ 데이터베이스 검색 완료: ${formattedResults.length}개 결과`);

    const response: any = {
      results: formattedResults,
      total: formattedResults.length,
      query: query,
      source: 'database'
    };

    // 디버그 모드일 때 추가 정보 포함
    if (debug) {
      response.debug = {
        searchQuery: query,
        timestamp: new Date().toISOString(),
        limit: limit,
        offset: offset,
        totalResults: formattedResults.length,
        sampleResults: formattedResults.slice(0, 3).map(r => ({
          name: r.name,
          brand: r.brand,
          age: r.age,
          abv: r.abv,
          rating: r.rating,
          region: r.region,
          type: r.type
        }))
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('데이터베이스 검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// 데이터베이스에 새로운 위스키 추가 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, age_years, abv, region, type, rating, image_url, whiskybase_url, description, distillery } = body;

    if (!name || !brand) {
      return NextResponse.json({ error: '이름과 브랜드는 필수입니다.' }, { status: 400 });
    }

    const whiskyData = {
      whiskybase_id: `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      brand,
      age_years: age_years ? parseInt(age_years) : null,
      abv: abv ? parseFloat(abv) : null,
      region,
      type,
      rating: rating ? parseFloat(rating) : null,
      image_url,
      whiskybase_url,
      description,
      distillery: distillery || brand,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('whiskybase_data')
      .insert(whiskyData)
      .select()
      .single();

    if (error) {
      console.error('데이터 추가 오류:', error);
      return NextResponse.json({ error: '데이터 추가에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('POST 요청 오류:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 