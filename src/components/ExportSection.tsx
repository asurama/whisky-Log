'use client';

import { exportData } from '@/utils/dataExport';

interface ExportSectionProps {
  user: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
  supabase: any;
}

export default function ExportSection({ user, loading, setLoading, setMessage, supabase }: ExportSectionProps) {
  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await exportData(user, format, supabase);
      setMessage(result);
    } catch (error) {
      console.error('내보내기 오류:', error);
      setMessage('데이터 내보내기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9CA3AF' }}>
        데이터 내보내기
      </h4>
      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#9CA3AF' }}>
        모든 위스키, 시음 기록, 위시리스트를 JSON, CSV 또는 Excel 파일로 백업합니다.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleExport('json')}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리중...' : 'JSON 내보내기'}
        </button>
        <button
          onClick={() => handleExport('csv')}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10B981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리중...' : 'CSV 내보내기'}
        </button>
        <button
          onClick={() => handleExport('excel')}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#F59E0B',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리중...' : 'Excel 내보내기'}
        </button>
      </div>
    </div>
  );
} 