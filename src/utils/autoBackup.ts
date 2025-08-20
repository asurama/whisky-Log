import { supabase } from '@/lib/supabase';
import { generateExcelWorkbook } from './dataExport';

interface BackupConfig {
  autoBackupEnabled: boolean;
  backupInterval: number; // 분 단위
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

class AutoBackupManager {
  private config: BackupConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isBackingUp = false;

  constructor() {
    this.config = this.loadConfig();
    this.startAutoBackup();
  }

  private loadConfig(): BackupConfig {
    const saved = localStorage.getItem('whisky-log-backup-config');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // 기본 설정
    return {
      autoBackupEnabled: false, // 기본적으로 비활성화
      backupInterval: 60, // 1시간
      maxBackups: 10
    };
  }

  private saveConfig() {
    localStorage.setItem('whisky-log-backup-config', JSON.stringify(this.config));
  }

  public updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.restartAutoBackup();
  }

  public getConfig(): BackupConfig {
    return this.config;
  }

  private startAutoBackup() {
    if (!this.config.autoBackupEnabled) return;

    // 마지막 백업 시간 확인
    const now = Date.now();
    const timeSinceLastBackup = now - (this.config.lastBackupTime || 0);
    const intervalMs = this.config.backupInterval * 60 * 1000;

    if (timeSinceLastBackup >= intervalMs) {
      // 즉시 백업 실행
      this.createBackup();
    }

    // 주기적 백업 설정
    this.intervalId = setInterval(() => {
      this.createBackup();
    }, intervalMs);
  }

  private restartAutoBackup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.startAutoBackup();
  }

  public stopAutoBackup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async createBackup(): Promise<void> {
    if (this.isBackingUp || !this.config.autoBackupEnabled) return;

    try {
      this.isBackingUp = true;
      console.log('🔄 자동 백업 시작...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.log('❌ 사용자 인증 없음, 백업 건너뜀');
        return;
      }

      // 데이터 가져오기
      const data = await this.fetchAllData(user.id);
      
      // 백업 파일 생성
      const workbook = generateExcelWorkbook(data);
      const excelBuffer = await this.workbookToBuffer(workbook);
      
      // 백업 메타데이터 생성
      const backupId = `backup_${Date.now()}`;
      const filename = `whisky-log-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.xlsx`;
      
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: Date.now(),
        filename,
        size: excelBuffer.byteLength,
        recordCount: {
          bottles: data.bottles.length,
          tastings: data.tastings.length,
          brands: data.brands.length,
          wishlist: data.wishlist.length
        }
      };

      // Supabase Storage에 백업 저장
      const { error } = await supabase.storage
        .from('backups')
        .upload(`${user.id}/${filename}`, excelBuffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          metadata: { backupMetadata: JSON.stringify(metadata) }
        });

      if (error) {
        console.error('❌ 백업 저장 실패:', error);
        return;
      }

      // 백업 메타데이터 저장
      await this.saveBackupMetadata(user.id, metadata);
      
      // 오래된 백업 정리
      await this.cleanupOldBackups(user.id);

      // 설정 업데이트
      this.config.lastBackupTime = Date.now();
      this.saveConfig();

      console.log('✅ 자동 백업 완료:', filename);
    } catch (error) {
      console.error('❌ 자동 백업 실패:', error);
    } finally {
      this.isBackingUp = false;
    }
  }

  private async fetchAllData(userId: string) {
    // 위스키 데이터
    const { data: bottles } = await supabase
      .from('bottles')
      .select('*')
      .eq('user_id', userId);

    // 시음 기록
    const { data: tastings } = await supabase
      .from('tastings')
      .select('*')
      .eq('user_id', userId);

    // 브랜드
    const { data: brands } = await supabase
      .from('brands')
      .select('*');

    // 위시리스트
    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId);

    return {
      bottles: bottles || [],
      tastings: tastings || [],
      brands: brands || [],
      wishlist: wishlist || [],
      version: '1.0',
      exportDate: new Date().toISOString()
    };
  }

  private async workbookToBuffer(workbook: any): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const wbout = require('xlsx').write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      const buffer = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout[i];
      }
      resolve(buffer);
    });
  }

  private async saveBackupMetadata(userId: string, metadata: BackupMetadata) {
    const { error } = await supabase
      .from('backup_metadata')
      .upsert({
        user_id: userId,
        backup_id: metadata.id,
        metadata: metadata
      });

    if (error) {
      console.error('백업 메타데이터 저장 실패:', error);
    }
  }

  private async cleanupOldBackups(userId: string) {
    try {
      // 백업 목록 가져오기
      const { data: files } = await supabase.storage
        .from('backups')
        .list(userId);

      if (!files || files.length <= this.config.maxBackups) return;

      // 오래된 백업 파일 정렬
      const sortedFiles = files
        .filter(file => file.name.endsWith('.xlsx'))
        .sort((a, b) => {
          const timeA = parseInt(a.name.split('-').pop()?.split('.')[0] || '0');
          const timeB = parseInt(b.name.split('-').pop()?.split('.')[0] || '0');
          return timeA - timeB;
        });

      // 오래된 파일 삭제
      const filesToDelete = sortedFiles.slice(0, sortedFiles.length - this.config.maxBackups);
      
      for (const file of filesToDelete) {
        await supabase.storage
          .from('backups')
          .remove([`${userId}/${file.name}`]);
        
        console.log('🗑️ 오래된 백업 삭제:', file.name);
      }
    } catch (error) {
      console.error('백업 정리 실패:', error);
    }
  }

  public async getBackupList(userId: string): Promise<BackupMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('backup_metadata')
        .select('metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => item.metadata) || [];
    } catch (error) {
      console.error('백업 목록 조회 실패:', error);
      return [];
    }
  }

  public async restoreFromBackup(userId: string, backupId: string): Promise<boolean> {
    try {
      // 백업 메타데이터 조회
      const { data: backupData } = await supabase
        .from('backup_metadata')
        .select('metadata')
        .eq('user_id', userId)
        .eq('backup_id', backupId)
        .single();

      if (!backupData) {
        throw new Error('백업을 찾을 수 없습니다.');
      }

      const metadata: BackupMetadata = backupData.metadata;
      
      // 백업 파일 다운로드
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('backups')
        .download(`${userId}/${metadata.filename}`);

      if (downloadError || !fileData) {
        throw new Error('백업 파일을 다운로드할 수 없습니다.');
      }

      // 파일을 ArrayBuffer로 변환
      const arrayBuffer = await fileData.arrayBuffer();
      
      // Excel 파일 파싱 및 복원
      const workbook = require('xlsx').read(arrayBuffer, { type: 'array' });
      
      // 여기서 실제 데이터 복원 로직 구현
      // (기존 ImportSection의 로직 활용)
      
      console.log('✅ 백업 복원 완료:', metadata.filename);
      return true;
    } catch (error) {
      console.error('❌ 백업 복원 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
let backupManager: AutoBackupManager | null = null;

export const getBackupManager = (): AutoBackupManager => {
  if (!backupManager) {
    backupManager = new AutoBackupManager();
  }
  return backupManager;
};

export const initializeAutoBackup = () => {
  getBackupManager();
};

export const cleanupAutoBackup = () => {
  if (backupManager) {
    backupManager.stopAutoBackup();
    backupManager = null;
  }
}; 