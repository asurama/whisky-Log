import { supabase } from '@/lib/supabase';

// 사용자 인증 상태 확인
export const checkAuthStatus = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('인증 상태 확인 오류:', error);
      return { isAuthenticated: false, user: null, error };
    }
    
    if (!user) {
      console.log('사용자가 로그인되지 않음');
      return { isAuthenticated: false, user: null, error: null };
    }
    
    console.log('인증된 사용자:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });
    
    return { isAuthenticated: true, user, error: null };
  } catch (error) {
    console.error('인증 상태 확인 중 예외 발생:', error);
    return { isAuthenticated: false, user: null, error };
  }
};

// 세션 상태 확인
export const checkSessionStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('세션 상태 확인 오류:', error);
      return { hasSession: false, session: null, error };
    }
    
    if (!session) {
      console.log('활성 세션이 없음');
      return { hasSession: false, session: null, error: null };
    }
    
    console.log('활성 세션:', {
      user_id: session.user.id,
      expires_at: session.expires_at,
      access_token: session.access_token ? '있음' : '없음'
    });
    
    return { hasSession: true, session, error: null };
  } catch (error) {
    console.error('세션 상태 확인 중 예외 발생:', error);
    return { hasSession: false, session: null, error };
  }
};

// 데이터베이스 연결 테스트
export const testDatabaseConnection = async () => {
  try {
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('brands')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('데이터베이스 연결 테스트 오류:', error);
      return { isConnected: false, error };
    }
    
    console.log('데이터베이스 연결 성공');
    return { isConnected: true, error: null };
  } catch (error) {
    console.error('데이터베이스 연결 테스트 중 예외 발생:', error);
    return { isConnected: false, error };
  }
};

// RLS 정책 테스트 결과 타입
interface RLSTestResult {
  table: string;
  operation: string;
  success: boolean;
  error: any;
}

// RLS 정책 테스트
export const testRLSPolicies = async (userId: string): Promise<RLSTestResult[]> => {
  const tests: RLSTestResult[] = [];
  
  try {
    // 1. 위시리스트 읽기 테스트
    const wishlistTest = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    tests.push({
      table: 'wishlist',
      operation: 'SELECT',
      success: !wishlistTest.error,
      error: wishlistTest.error
    });
    
    // 2. 보틀 읽기 테스트
    const bottlesTest = await supabase
      .from('bottles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    tests.push({
      table: 'bottles',
      operation: 'SELECT',
      success: !bottlesTest.error,
      error: bottlesTest.error
    });
    
    // 3. 시음 읽기 테스트
    const tastingsTest = await supabase
      .from('tastings')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    tests.push({
      table: 'tastings',
      operation: 'SELECT',
      success: !tastingsTest.error,
      error: tastingsTest.error
    });
    
    // 4. 브랜드 읽기 테스트
    const brandsTest = await supabase
      .from('brands')
      .select('id')
      .limit(1);
    
    tests.push({
      table: 'brands',
      operation: 'SELECT',
      success: !brandsTest.error,
      error: brandsTest.error
    });
    
    console.log('RLS 정책 테스트 결과:', tests);
    return tests;
    
  } catch (error) {
    console.error('RLS 정책 테스트 중 예외 발생:', error);
    return tests;
  }
};

// 전체 진단 실행
export const runFullDiagnostic = async () => {
  console.log('=== 전체 진단 시작 ===');
  
  // 1. 인증 상태 확인
  const authStatus = await checkAuthStatus();
  console.log('인증 상태:', authStatus);
  
  // 2. 세션 상태 확인
  const sessionStatus = await checkSessionStatus();
  console.log('세션 상태:', sessionStatus);
  
  // 3. 데이터베이스 연결 테스트
  const dbConnection = await testDatabaseConnection();
  console.log('데이터베이스 연결:', dbConnection);
  
  // 4. RLS 정책 테스트 (인증된 사용자인 경우)
  let rlsTests: RLSTestResult[] = [];
  if (authStatus.isAuthenticated && authStatus.user) {
    rlsTests = await testRLSPolicies(authStatus.user.id);
  }
  
  console.log('=== 전체 진단 완료 ===');
  
  return {
    authStatus,
    sessionStatus,
    dbConnection,
    rlsTests
  };
}; 