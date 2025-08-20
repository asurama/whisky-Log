'use client';

import { useState } from 'react';
import { importData } from '@/utils/dataImport';
import { runFullDiagnostic } from '@/utils/authHelper';
import { ImportOptions, defaultImportOptions } from '@/types/import';

interface ImportSectionProps {
  user: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
  supabase: any;
}

export default function ImportSection({ user, loading, setLoading, setMessage, supabase }: ImportSectionProps) {
  const [importOptions, setImportOptions] = useState<ImportOptions>(defaultImportOptions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setMessage('');

    try {
      // 먼저 진단 실행
      console.log('=== 데이터 가져오기 전 진단 시작 ===');
      const diagnostic = await runFullDiagnostic();
      console.log('진단 결과:', diagnostic);
      
      if (!diagnostic.authStatus.isAuthenticated) {
        throw new Error('사용자가 인증되지 않았습니다. 다시 로그인해주세요.');
      }
      
      if (!diagnostic.dbConnection.isConnected) {
        throw new Error('데이터베이스 연결에 문제가 있습니다.');
      }
      
      // RLS 정책 실패가 있는지 확인
      const failedTests = diagnostic.rlsTests.filter(test => !test.success);
      if (failedTests.length > 0) {
        console.error('RLS 정책 실패:', failedTests);
        setMessage('권한 문제가 발생했습니다. 페이지를 새로고침하고 다시 시도해주세요.');
        return;
      }
      
      const result = await importData(selectedFile, user, supabase, importOptions);
      setMessage(result);
      
      // 파일 입력 초기화
      setSelectedFile(null);
    } catch (error) {
      console.error('불러오기 오류:', error);
      setMessage(`데이터 불러오기 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9CA3AF' }}>
        데이터 불러오기
      </h4>
      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#9CA3AF' }}>
        백업 파일을 선택하여 데이터를 복원합니다.
        <br />
        <strong>지원 형식:</strong> JSON 백업 파일, CSV 파일, Excel 파일(.xlsx, .xls)
      </p>
      
      {/* 파일 선택 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="file"
          accept=".json,.csv,.xlsx,.xls"
          onChange={handleFileSelect}
          disabled={loading}
          style={{
            padding: '8px',
            border: '1px solid #374151',
            borderRadius: '6px',
            backgroundColor: '#111827',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        />
        {selectedFile && (
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10B981' }}>
            선택된 파일: {selectedFile.name}
          </p>
        )}
      </div>

      {/* 가져오기 옵션 */}
      {selectedFile && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF' }}>
            가져오기 옵션
          </h5>
          
          {/* 카테고리별 선택 */}
          <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="importBottles"
                checked={importOptions.importBottles}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importBottles: e.target.checked }))}
                disabled={loading}
              />
              <label htmlFor="importBottles" style={{ fontSize: '12px', color: 'white' }}>
                위스키 컬렉션
              </label>
              {importOptions.importBottles && (
                <select
                  value={importOptions.bottlesMode}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, bottlesMode: e.target.value as any }))}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  <option value="add">추가</option>
                  <option value="replace">전체 대체</option>
                  <option value="merge">스마트 병합</option>
                </select>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="importTastings"
                checked={importOptions.importTastings}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importTastings: e.target.checked }))}
                disabled={loading}
              />
              <label htmlFor="importTastings" style={{ fontSize: '12px', color: 'white' }}>
                시음 기록
              </label>
              {importOptions.importTastings && (
                <select
                  value={importOptions.tastingsMode}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, tastingsMode: e.target.value as any }))}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  <option value="add">추가</option>
                  <option value="replace">전체 대체</option>
                  <option value="merge">스마트 병합</option>
                </select>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="importWishlist"
                checked={importOptions.importWishlist}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importWishlist: e.target.checked }))}
                disabled={loading}
              />
              <label htmlFor="importWishlist" style={{ fontSize: '12px', color: 'white' }}>
                위시리스트
              </label>
              {importOptions.importWishlist && (
                <select
                  value={importOptions.wishlistMode}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, wishlistMode: e.target.value as any }))}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  <option value="add">추가</option>
                  <option value="replace">전체 대체</option>
                  <option value="merge">스마트 병합</option>
                </select>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="importBrands"
                checked={importOptions.importBrands}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importBrands: e.target.checked }))}
                disabled={loading}
              />
              <label htmlFor="importBrands" style={{ fontSize: '12px', color: 'white' }}>
                브랜드 정보
              </label>
              {importOptions.importBrands && (
                <select
                  value={importOptions.brandsMode}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, brandsMode: e.target.value as any }))}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  <option value="add">추가</option>
                  <option value="replace">전체 대체</option>
                  <option value="merge">스마트 병합</option>
                </select>
              )}
            </div>
          </div>

          {/* 가져오기 버튼 */}
          <button
            onClick={handleImport}
            disabled={loading || !selectedFile}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: loading || !selectedFile ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedFile ? 0.6 : 1,
              fontSize: '14px'
            }}
          >
            {loading ? '가져오는 중...' : '데이터 가져오기'}
          </button>
        </div>
      )}
    </div>
  );
} 