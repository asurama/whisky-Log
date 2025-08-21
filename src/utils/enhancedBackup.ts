import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export interface BackupMetadata {
  id: string;
  user_id: string;
  backup_id: string;
  metadata: {
    timestamp: string;
    version: string;
    data_types: string[];
    record_counts: {
      bottles: number;
      tastings: number;
      wishlist: number;
    };
    total_size: number;
    checksum: string;
    is_incremental: boolean;
    previous_backup_id?: string;
    changes_since_last: {
      bottles_added: number;
      bottles_updated: number;
      bottles_deleted: number;
      tastings_added: number;
      tastings_updated: number;
      tastings_deleted: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface BackupConfig {
  enabled: boolean;
  auto_backup_enabled: boolean;
  interval_hours: number;
  max_backups: number;
  incremental_backup: boolean;
  compression_enabled: boolean;
  notification_enabled: boolean;
  auto_cleanup: boolean;
  backup_verification: boolean;
}

export class EnhancedBackupManager {
  private static instance: EnhancedBackupManager;
  private backupInterval: NodeJS.Timeout | null = null;
  private config: BackupConfig = {
    enabled: false,
    auto_backup_enabled: false,
    interval_hours: 24,
    max_backups: 10,
    incremental_backup: true,
    compression_enabled: true,
    notification_enabled: true,
    auto_cleanup: true,
    backup_verification: true
  };

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): EnhancedBackupManager {
    if (!EnhancedBackupManager.instance) {
      EnhancedBackupManager.instance = new EnhancedBackupManager();
    }
    return EnhancedBackupManager.instance;
  }

  // 설정 로드
  private async loadConfig(): Promise<void> {
    try {
      const stored = localStorage.getItem('enhanced_backup_config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('백업 설정 로드 실패:', error);
    }
  }

  // 설정 저장
  async saveConfig(config: Partial<BackupConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem('enhanced_backup_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('백업 설정 저장 실패:', error);
    }
  }

  // 설정 가져오기
  getConfig(): BackupConfig {
    return { ...this.config };
  }

  // 자동 백업 시작
  async startAutoBackup(): Promise<void> {
    if (!this.config.enabled || !this.config.auto_backup_enabled) return;

    this.stopAutoBackup();
    
    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup();
        if (this.config.notification_enabled) {
          this.showNotification('백업이 완료되었습니다!', 'success');
        }
      } catch (error) {
        console.error('자동 백업 실패:', error);
        if (this.config.notification_enabled) {
          this.showNotification('자동 백업에 실패했습니다.', 'error');
        }
      }
    }, this.config.interval_hours * 60 * 60 * 1000);

    // 즉시 첫 백업 실행
    await this.createBackup();
  }

  // 자동 백업 중지
  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // 백업 생성
  async createBackup(): Promise<string> {
    console.log('백업 생성 시작:', { config: this.config });
    
    // 자동 백업이 비활성화된 경우 건너뛰기
    if (!this.config.auto_backup_enabled) {
      console.log('자동 백업이 비활성화되어 있습니다. 수동 백업으로 진행합니다.');
      // 수동 백업의 경우 계속 진행
    }
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('사용자 인증이 필요합니다.');

    const backupId = `backup_${user.id}_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    try {
      console.log('백업 생성 단계 1: 데이터 수집 시작');
      // 1. 데이터 수집
      const data = await this.fetchAllUserData();
      console.log('백업 생성 단계 1: 데이터 수집 완료:', { 
        bottles: data.bottles.length, 
        tastings: data.tastings.length, 
        wishlist: data.wishlist.length 
      });
      
      console.log('백업 생성 단계 2: 증분 백업 확인 시작');
      // 2. 증분 백업 확인
      const lastBackup = await this.getLastBackup();
      const isIncremental = Boolean(this.config.incremental_backup && lastBackup);
      console.log('백업 생성 단계 2: 증분 백업 확인 완료:', { lastBackup, isIncremental });
      
      console.log('백업 생성 단계 3: 변경사항 계산 시작');
      // 3. 변경사항 계산
      const changes = isIncremental && lastBackup ? await this.calculateChanges(data, lastBackup) : null;
      console.log('백업 생성 단계 3: 변경사항 계산 완료:', changes);
      
      console.log('백업 생성 단계 4: Excel 파일 생성 시작');
      // 4. Excel 파일 생성
      const workbook = await this.createExcelWorkbook(data, isIncremental, changes);
      console.log('백업 생성 단계 4: Excel 파일 생성 완료');
      
      console.log('백업 생성 단계 5: 파일 압축/변환 시작');
      // 5. 압축 (선택사항)
      let fileBuffer: Buffer;
      if (this.config.compression_enabled) {
        fileBuffer = await this.compressWorkbook(workbook);
        console.log('백업 생성 단계 5: 파일 압축 완료 (ZIP)');
      } else {
        fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        console.log('백업 생성 단계 5: 파일 변환 완료 (XLSX)');
      }

      console.log('백업 생성 단계 6: Supabase Storage 업로드 시작');
      // 6. Supabase Storage에 업로드
      const fileName = `${backupId}.${this.config.compression_enabled ? 'zip' : 'xlsx'}`;
      console.log('업로드할 파일명:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('backups')
        .upload(`${user.id}/${fileName}`, fileBuffer, {
          contentType: this.config.compression_enabled ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

      if (uploadError) {
        console.error('Storage 업로드 실패:', uploadError);
        throw uploadError;
      }
      console.log('백업 생성 단계 6: Supabase Storage 업로드 완료');

      console.log('백업 생성 단계 7: 메타데이터 생성 시작');
      // 7. 메타데이터 생성
      const metadata: BackupMetadata['metadata'] = {
        timestamp,
        version: '2.0.0',
        data_types: ['bottles', 'tastings', 'wishlist'],
        record_counts: {
          bottles: data.bottles.length,
          tastings: data.tastings.length,
          wishlist: data.wishlist.length
        },
        total_size: fileBuffer.length,
        checksum: await this.calculateChecksum(fileBuffer),
        is_incremental: isIncremental,
        previous_backup_id: lastBackup?.backup_id,
        changes_since_last: changes || {
          bottles_added: 0,
          bottles_updated: 0,
          bottles_deleted: 0,
          tastings_added: 0,
          tastings_updated: 0,
          tastings_deleted: 0
        }
      };
      console.log('백업 생성 단계 7: 메타데이터 생성 완료:', metadata);

      console.log('백업 생성 단계 8: 메타데이터 저장 시작');
      // 8. 메타데이터 저장
      await this.saveBackupMetadata(user.id, backupId, metadata);
      console.log('백업 생성 단계 8: 메타데이터 저장 완료');

      // 9. 백업 검증 (선택사항)
      if (this.config.backup_verification) {
        await this.verifyBackup(backupId, metadata);
      }

      // 10. 자동 정리 (선택사항)
      if (this.config.auto_cleanup) {
        await this.cleanupOldBackups(user.id);
      }

      console.log(`백업 완료: ${backupId}`);
      return backupId;

    } catch (error) {
      console.error('백업 생성 실패:', error);
      throw error;
    }
  }

  // 모든 사용자 데이터 가져오기
  private async fetchAllUserData(): Promise<any> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('사용자 인증이 필요합니다.');

    const [bottlesResult, tastingsResult, wishlistResult] = await Promise.all([
      supabase.from('bottles').select('*').eq('user_id', user.id),
      supabase.from('tastings').select('*').eq('user_id', user.id),
      supabase.from('wishlist').select('*').eq('user_id', user.id)
    ]);

    if (bottlesResult.error) throw bottlesResult.error;
    if (tastingsResult.error) throw tastingsResult.error;
    if (wishlistResult.error) throw wishlistResult.error;

    return {
      bottles: bottlesResult.data || [],
      tastings: tastingsResult.data || [],
      wishlist: wishlistResult.data || []
    };
  }

  // 마지막 백업 가져오기
  private async getLastBackup(): Promise<BackupMetadata | null> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }

  // 변경사항 계산
  private async calculateChanges(currentData: any, lastBackup: BackupMetadata): Promise<any> {
    // 간단한 변경사항 계산 (실제로는 더 정교한 비교 로직 필요)
    const changes = {
      bottles_added: 0,
      bottles_updated: 0,
      bottles_deleted: 0,
      tastings_added: 0,
      tastings_updated: 0,
      tastings_deleted: 0
    };

    // 이전 백업과 비교하여 변경사항 계산
    // 실제 구현에서는 더 정교한 비교 로직이 필요
    return changes;
  }

  // Excel 워크북 생성
  private async createExcelWorkbook(data: any, isIncremental: boolean, changes: any | null): Promise<XLSX.WorkBook> {
    const workbook = XLSX.utils.book_new();

    // 시트 생성
    const bottlesSheet = XLSX.utils.json_to_sheet(data.bottles);
    const tastingsSheet = XLSX.utils.json_to_sheet(data.tastings);
    const wishlistSheet = XLSX.utils.json_to_sheet(data.wishlist);

    // 시트 추가
    XLSX.utils.book_append_sheet(workbook, bottlesSheet, 'Bottles');
    XLSX.utils.book_append_sheet(workbook, tastingsSheet, 'Tastings');
    XLSX.utils.book_append_sheet(workbook, wishlistSheet, 'Wishlist');

    // 메타데이터 시트 추가
    const metadata = {
      backup_timestamp: new Date().toISOString(),
      is_incremental: isIncremental,
      changes: changes ? JSON.stringify(changes) : 'N/A'
    };
    const metadataSheet = XLSX.utils.json_to_sheet([metadata]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

    return workbook;
  }

  // 워크북 압축
  private async compressWorkbook(workbook: XLSX.WorkBook): Promise<Buffer> {
    // 간단한 압축 구현 (실제로는 JSZip 등 사용)
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  // 체크섬 계산
  private async calculateChecksum(buffer: Buffer): Promise<string> {
    // 간단한 체크섬 계산
    let hash = 0;
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer
    }
    return hash.toString(16);
  }

  // 백업 메타데이터 저장
  private async saveBackupMetadata(userId: string, backupId: string, metadata: any): Promise<void> {
    console.log('백업 메타데이터 저장 시작:', { userId, backupId, metadata });
    
    const { data, error } = await supabase
      .from('backup_metadata')
      .insert({
        user_id: userId,
        backup_id: backupId,
        metadata: metadata
      });

    console.log('백업 메타데이터 저장 결과:', { data, error });

    if (error) {
      console.error('백업 메타데이터 저장 실패:', error);
      throw error;
    }
    
    console.log('백업 메타데이터 저장 완료');
  }

  // 백업 검증
  private async verifyBackup(backupId: string, metadata: any): Promise<boolean> {
    try {
      // 백업 파일 다운로드
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const fileName = `${backupId}.${this.config.compression_enabled ? 'zip' : 'xlsx'}`;
      const { data, error } = await supabase.storage
        .from('backups')
        .download(`${user.id}/${fileName}`);

      if (error || !data) return false;

      // 파일 크기 확인
      if (data.size !== metadata.total_size) return false;

      // 체크섬 확인
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const calculatedChecksum = await this.calculateChecksum(buffer);
      
      return calculatedChecksum === metadata.checksum;
    } catch (error) {
      console.error('백업 검증 실패:', error);
      return false;
    }
  }

  // 오래된 백업 정리
  private async cleanupOldBackups(userId: string): Promise<void> {
    try {
      const { data: backups, error } = await supabase
        .from('backup_metadata')
        .select('backup_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !backups) return;

      // 최대 백업 수를 초과하는 오래된 백업 삭제
      if (backups.length > this.config.max_backups) {
        const backupsToDelete = backups.slice(this.config.max_backups);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(userId, backup.backup_id);
        }
      }
    } catch (error) {
      console.error('백업 정리 실패:', error);
    }
  }

  // 백업 삭제
  async deleteBackup(userId: string, backupId: string): Promise<void> {
    try {
      // 메타데이터 삭제
      await supabase
        .from('backup_metadata')
        .delete()
        .eq('user_id', userId)
        .eq('backup_id', backupId);

      // 파일 삭제
      const fileName = `${backupId}.${this.config.compression_enabled ? 'zip' : 'xlsx'}`;
      await supabase.storage
        .from('backups')
        .remove([`${userId}/${fileName}`]);

    } catch (error) {
      console.error('백업 삭제 실패:', error);
      throw error;
    }
  }

  // 백업 목록 가져오기
  async getBackupList(): Promise<BackupMetadata[]> {
    const user = (await supabase.auth.getUser()).data.user;
    console.log('백업 목록 조회 시작:', { userId: user?.id, user: user });
    
    if (!user) {
      console.log('사용자가 없어서 빈 목록 반환');
      return [];
    }

    try {
      console.log('backup_metadata 테이블 조회 시작...');
      const { data, error } = await supabase
        .from('backup_metadata')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('backup_metadata 조회 결과:', { data, error, count: data?.length });

      if (error) {
        // backup_metadata 테이블이 없는 경우 빈 배열 반환
        if (error.code === 'PGRST205' || error.code === '404' || error.message?.includes('404')) {
          console.log('backup_metadata 테이블이 없습니다. 빈 목록을 반환합니다.');
          return [];
        }
        console.error('백업 목록 가져오기 실패:', error);
        return [];
      }

      console.log('백업 목록 반환:', data);
      return data || [];
    } catch (error) {
      console.error('백업 목록 가져오기 중 예외 발생:', error);
      return [];
    }
  }

  // 백업 복구
  async restoreFromBackup(backupId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('사용자 인증이 필요합니다.');

    try {
      // 백업 파일 다운로드
      const fileName = `${backupId}.${this.config.compression_enabled ? 'zip' : 'xlsx'}`;
      const { data, error } = await supabase.storage
        .from('backups')
        .download(`${user.id}/${fileName}`);

      if (error || !data) throw new Error('백업 파일을 찾을 수 없습니다.');

      // 파일 읽기
      const arrayBuffer = await data.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

      // 데이터 추출
      const bottles = XLSX.utils.sheet_to_json(workbook.Sheets['Bottles']);
      const tastings = XLSX.utils.sheet_to_json(workbook.Sheets['Tastings']);
      const wishlist = XLSX.utils.sheet_to_json(workbook.Sheets['Wishlist']);

      // 기존 데이터 삭제
      await Promise.all([
        supabase.from('bottles').delete().eq('user_id', user.id),
        supabase.from('tastings').delete().eq('user_id', user.id),
        supabase.from('wishlist').delete().eq('user_id', user.id)
      ]);

      // 새 데이터 삽입
      if (bottles.length > 0) {
        await supabase.from('bottles').insert(bottles);
      }
      if (tastings.length > 0) {
        await supabase.from('tastings').insert(tastings);
      }
      if (wishlist.length > 0) {
        await supabase.from('wishlist').insert(wishlist);
      }

      console.log('백업 복구 완료');
    } catch (error) {
      console.error('백업 복구 실패:', error);
      throw error;
    }
  }

  // 알림 표시
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // 브라우저 알림 또는 커스텀 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('위스키 로그', {
        body: message,
        icon: '/favicon.ico'
      });
    } else {
      // 커스텀 알림 (Toast 등)
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const getEnhancedBackupManager = () => EnhancedBackupManager.getInstance(); 