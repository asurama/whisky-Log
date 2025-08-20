'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import ExportSection from './ExportSection';
import ImportSection from './ImportSection';
import BackupManager from './BackupManager';
import EnhancedBackupManager from './EnhancedBackupManager';
import BrandManager from './BrandManager';
import { useDevice } from '@/hooks/useDevice';

interface DataExportProps {
  user: any;
  onBrandsUpdate?: (updatedBrand?: any, deletedBrandId?: string) => void;
  brands?: any[];
}

export default function DataExport({ user, onBrandsUpdate, brands }: DataExportProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isMobile } = useDevice();

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '20px',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: isMobile ? '20px' : '24px', 
        fontWeight: '700', 
        color: 'white',
        wordBreak: 'keep-all'
      }}>
        데이터 관리
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: isMobile ? '16px' : '20px',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        {/* 브랜드 관리 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #374151',
          height: 'fit-content',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: isMobile ? '16px' : '18px', 
            color: 'white',
            wordBreak: 'keep-all'
          }}>
            🏷️ 브랜드 관리
          </h3>
          <BrandManager user={user} onBrandsUpdate={onBrandsUpdate} brands={brands} />
        </div>

        {/* 강화된 백업 관리 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #374151',
          height: 'fit-content',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: isMobile ? '16px' : '18px', 
            color: 'white',
            wordBreak: 'keep-all'
          }}>
            💾 백업 관리
          </h3>
          <EnhancedBackupManager />
        </div>

        {/* 내보내기 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #374151',
          height: 'fit-content',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: isMobile ? '16px' : '18px', 
            color: 'white',
            wordBreak: 'keep-all'
          }}>
            📤 데이터 내보내기
          </h3>
          <ExportSection 
            user={user}
            loading={loading}
            setLoading={setLoading}
            setMessage={setMessage}
            supabase={supabase}
          />
        </div>

        {/* 불러오기 */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #374151',
          height: 'fit-content',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: isMobile ? '16px' : '18px', 
            color: 'white',
            wordBreak: 'keep-all'
          }}>
            📥 데이터 불러오기
          </h3>
          <ImportSection 
            user={user}
            loading={loading}
            setLoading={setLoading}
            setMessage={setMessage}
            supabase={supabase}
          />
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          backgroundColor: '#10B981',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          wordBreak: 'keep-all'
        }}>
          {message}
        </div>
      )}
    </div>
  );
} 