/**
 * 이미지 처리 유틸리티 함수들
 */

import { supabase } from '@/lib/supabase';

/**
 * 파일을 Base64로 변환
 * @param file - 변환할 파일
 * @returns Promise<string> - Base64 문자열
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * 이미지 파일 크기 검증
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 크기 (MB)
 * @returns boolean - 검증 결과
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // 파일 크기 검증
  if (file.size > maxSizeMB * 1024 * 1024) {
    return false;
  }
  
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  return true;
}

/**
 * 이미지 압축 (Canvas 사용)
 * @param file - 압축할 파일
 * @param maxWidth - 최대 너비
 * @param maxHeight - 최대 높이
 * @param quality - 품질 (0-1)
 * @returns Promise<File> - 압축된 파일
 */
export function compressImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    console.log('🔄 compressImage 시작:', { maxWidth, maxHeight, quality });
    
    try {
      console.log('📐 Canvas 생성 시작');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ Canvas 2D 컨텍스트 생성 실패');
        reject(new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.'));
        return;
      }
      console.log('✅ Canvas 2D 컨텍스트 생성 성공');
      
      console.log('🖼️ Image 객체 생성');
      const img = new Image();
      
      console.log('🔗 Object URL 생성');
      // 이미지 소스 설정
      const objectUrl = URL.createObjectURL(file);
      console.log('🔗 Object URL 생성 완료:', objectUrl.substring(0, 50) + '...');
      
      // 메모리 정리를 위한 함수
      const cleanup = () => {
        console.log('🧹 Object URL 정리');
        URL.revokeObjectURL(objectUrl);
      };
      
      img.onload = () => {
        console.log('🖼️ 이미지 로드 완료:', { 
          naturalWidth: img.naturalWidth, 
          naturalHeight: img.naturalHeight 
        });
        
        try {
          console.log('📏 비율 계산 시작');
          // 비율 계산
          let { width, height } = img;
          console.log('📏 원본 크기:', { width, height });
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
            console.log('📏 너비 조정 후:', { width, height });
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
            console.log('📏 높이 조정 후:', { width, height });
          }
          
          // 최소 크기 보장
          if (width < 1) width = 1;
          if (height < 1) height = 1;
          
          const finalWidth = Math.round(width);
          const finalHeight = Math.round(height);
          console.log('📏 최종 크기:', { finalWidth, finalHeight });
          
          console.log('🎨 Canvas 크기 설정');
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          
          console.log('🎨 이미지 그리기 시작');
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);
          console.log('✅ 이미지 그리기 완료');
          
          console.log('💾 Blob 변환 시작');
          // Blob으로 변환 (더 안전한 방식)
          canvas.toBlob(
            (blob) => {
              console.log('💾 toBlob 콜백 호출됨, blob:', blob ? '존재' : 'null');
              
              if (blob) {
                try {
                  console.log('📁 File 객체 생성 시작');
                  const compressedFile = new File([blob], file.name, {
                    type: file.type || 'image/jpeg',
                    lastModified: Date.now()
                  });
                  console.log('✅ File 객체 생성 완료:', {
                    name: compressedFile.name,
                    size: compressedFile.size,
                    type: compressedFile.type
                  });
                  cleanup(); // 성공 시 정리
                  resolve(compressedFile);
                } catch (fileError) {
                  console.error('❌ File 생성 오류:', fileError);
                  cleanup(); // 실패 시에도 정리
                  reject(new Error('압축된 파일을 생성할 수 없습니다.'));
                }
              } else {
                console.error('❌ Blob이 null입니다');
                cleanup(); // 실패 시에도 정리
                reject(new Error('이미지를 Blob으로 변환할 수 없습니다.'));
              }
            },
            file.type || 'image/jpeg',
            quality
          );
          console.log('💾 toBlob 호출 완료');
        } catch (drawError) {
          console.error('❌ 이미지 그리기 오류:', drawError);
          cleanup(); // 실패 시에도 정리
          reject(new Error('이미지를 Canvas에 그릴 수 없습니다.'));
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ 이미지 로드 오류:', error);
        cleanup(); // 실패 시에도 정리
        reject(new Error('이미지를 로드할 수 없습니다.'));
      };
      
      img.src = objectUrl;
      console.log('🖼️ 이미지 소스 설정 완료');
      
    } catch (error) {
      console.error('❌ 압축 함수 초기화 오류:', error);
      reject(new Error('이미지 압축을 초기화할 수 없습니다.'));
    }
  });
} 

/**
 * Supabase Storage에 이미지 업로드
 * @param file - 업로드할 파일
 * @param bucket - 버킷 이름
 * @param path - 저장 경로
 * @returns Promise<string> - 업로드된 이미지 URL
 */
export async function uploadImageToSupabase(
  file: File, 
  bucket: string = 'testing-images',
  path?: string
): Promise<string> {
  try {
    console.log('🖼️ 이미지 업로드 시작:', { bucket, fileName: file.name, fileSize: file.size });
    
    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // 저장 경로 설정
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    console.log('📁 파일 경로:', filePath);
    
    // 버킷 존재 여부 확인
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketsError);
    } else {
      console.log('📦 사용 가능한 버킷들:', buckets?.map(b => b.name));
      const bucketExists = buckets?.some(b => b.name === bucket);
      console.log(`🔍 버킷 '${bucket}' 존재 여부:`, bucketExists);
      
      if (!bucketExists) {
        console.error(`❌ 버킷 '${bucket}'이 존재하지 않습니다!`);
        throw new Error(`버킷 '${bucket}'이 존재하지 않습니다. 사용 가능한 버킷: ${buckets?.map(b => b.name).join(', ')}`);
      }
    }
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ 이미지 업로드 오류:', error);
      console.error('❌ 오류 상세 정보:', {
        message: error.message,
        name: error.name
      });
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
    
    console.log('✅ 이미지 업로드 성공:', data);
    
    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    console.log('🔗 공개 URL 생성:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('❌ 이미지 업로드 중 오류:', error);
    throw error;
  }
}

/**
 * Supabase Storage에서 이미지 삭제
 * @param imageUrl - 삭제할 이미지 URL
 * @param bucket - 버킷 이름
 * @returns Promise<boolean> - 삭제 성공 여부
 */
export async function deleteImageFromSupabase(
  imageUrl: string,
  bucket: string = 'testing-images'
): Promise<boolean> {
  try {
    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) {
      console.error('이미지 삭제 오류:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('이미지 삭제 중 오류:', error);
    return false;
  }
} 

/**
 * 위스키 컬렉션용 이미지 업로드 (whisky-bottles 버킷 사용)
 */
export async function uploadWhiskyImageToSupabase(
  file: File, 
  path?: string
): Promise<string> {
  return uploadImageToSupabase(file, 'whisky-bottles', path);
}

/**
 * 위스키 컬렉션용 이미지 삭제 (whisky-bottles 버킷)
 * @param imageUrl - 삭제할 이미지 URL
 * @returns Promise<boolean> - 삭제 성공 여부
 */
export async function deleteWhiskyImageFromSupabase(
  imageUrl: string
): Promise<boolean> {
  return deleteImageFromSupabase(imageUrl, 'whisky-bottles');
}

/**
 * 시음 기록용 이미지 업로드 (testing-images 버킷 사용)
 */
export async function uploadTastingImageToSupabase(
  file: File, 
  path?: string
): Promise<string> {
  return uploadImageToSupabase(file, 'testing-images', path);
}

/**
 * 시음 기록용 이미지 삭제 (testing-images 버킷)
 * @param imageUrl - 삭제할 이미지 URL
 * @returns Promise<boolean> - 삭제 성공 여부
 */
export async function deleteTastingImageFromSupabase(
  imageUrl: string
): Promise<boolean> {
  return deleteImageFromSupabase(imageUrl, 'testing-images');
} 