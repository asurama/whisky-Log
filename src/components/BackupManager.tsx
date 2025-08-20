'use client';

import { useState, useEffect } from 'react';
import { getBackupManager } from '@/utils/autoBackup';

interface BackupManagerProps {
  user: any;
}

interface BackupConfig {
  autoBackupEnabled: boolean;
  backupInterval: number;
  maxBackups: number;
  lastBackupTime?: number;
}

interface BackupMetadata {
  id: string;
  timestamp: number;
  filename: string;
  size: number;
  recordCount: {
    bottles: number;
    tastings: number;
    brands: number;
    wishlist: number;
  };
}

export default function BackupManager({ user }: BackupManagerProps) {
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: true,
    backupInterval: 60,
    maxBackups: 10
  });
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const backupManager = getBackupManager();

  useEffect(() => {
    loadConfig();
    loadBackups();
  }, []);

  const loadConfig = () => {
    const currentConfig = backupManager.getConfig();
    setConfig(currentConfig);
  };

  const loadBackups = async () => {
    if (!user?.id) return;
    
    try {
      const backupList = await backupManager.getBackupList(user.id);
      setBackups(backupList);
    } catch (error) {
      console.error('백업 목록 로딩 실패:', error);
    }
  };

  const updateConfig = (newConfig: Partial<BackupConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    backupManager.updateConfig(updatedConfig);
    setMessage('설정이 저장되었습니다.');
    setTimeout(() => setMessage(''), 3000);
  };

  const createManualBackup = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // 수동 백업 실행
      await backupManager['createBackup']();
      await loadBackups();
      setMessage('수동 백업이 완료되었습니다.');
    } catch (error) {
      setMessage('백업 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!user?.id) return;
    
    if (!confirm('정말로 이 백업으로 복원하시겠습니까? 현재 데이터가 덮어써집니다.')) {
      return;
    }
    
    setLoading(true);
    try {
      const success = await backupManager.restoreFromBackup(user.id, backupId);
      if (success) {
        setMessage('백업 복원이 완료되었습니다. 페이지를 새로고침해주세요.');
      } else {
        setMessage('백업 복원에 실패했습니다.');
      }
    } catch (error) {
      setMessage('백업 복원 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div style={{
      backgroundColor: '#1F2937',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #374151',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>자동 백업 관리</h3>
      
      {/* 설정 섹션 */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#D1D5DB' }}>
          백업 설정
        </h4>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* 자동 백업 활성화 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '14px', color: '#9CA3AF' }}>
              자동 백업
            </label>
            <input
              type="checkbox"
              checked={config.autoBackupEnabled}
              onChange={(e) => updateConfig({ autoBackupEnabled: e.target.checked })}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#3B82F6'
              }}
            />
          </div>

          {/* 백업 간격 */}
          <div>
            <label style={{ fontSize: '14px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>
              백업 간격 (분)
            </label>
            <select
              value={config.backupInterval}
              onChange={(e) => updateConfig({ backupInterval: parseInt(e.target.value) })}
              disabled={!config.autoBackupEnabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value={30}>30분</option>
              <option value={60}>1시간</option>
              <option value={180}>3시간</option>
              <option value={360}>6시간</option>
              <option value={720}>12시간</option>
              <option value={1440}>24시간</option>
            </select>
          </div>

          {/* 최대 백업 개수 */}
          <div>
            <label style={{ fontSize: '14px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>
              최대 백업 개수
            </label>
            <select
              value={config.maxBackups}
              onChange={(e) => updateConfig({ maxBackups: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
            </select>
          </div>

          {/* 마지막 백업 시간 */}
          {config.lastBackupTime && (
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              마지막 백업: {formatDate(config.lastBackupTime)}
            </div>
          )}
        </div>
      </div>

      {/* 수동 백업 버튼 */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={createManualBackup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#10B981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '백업 중...' : '📦 수동 백업 생성'}
        </button>
      </div>

      {/* 백업 목록 */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#D1D5DB' }}>
          백업 목록 ({backups.length}개)
        </h4>
        
        {backups.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#6B7280',
            fontSize: '14px'
          }}>
            백업이 없습니다.
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {backups.map((backup) => (
              <div
                key={backup.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #4B5563'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                    {backup.filename}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {formatFileSize(backup.size)}
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
                  {formatDate(backup.timestamp)}
                </div>
                
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                  📊 위스키: {backup.recordCount.bottles}개 | 
                  🍷 시음: {backup.recordCount.tastings}개 | 
                  🏷️ 브랜드: {backup.recordCount.brands}개 | 
                  ❤️ 위시: {backup.recordCount.wishlist}개
                </div>
                
                <button
                  onClick={() => restoreBackup(backup.id)}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3B82F6',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  🔄 복원
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메시지 */}
      {message && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: message.includes('완료') || message.includes('저장') ? '#065F46' : '#7F1D1D',
          color: 'white',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
} 