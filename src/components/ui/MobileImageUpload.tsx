'use client';

import { useState, useRef } from 'react';
import ImageEditor from './ImageEditor';

interface MobileImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageEdit?: (file: File) => void; // 편집된 이미지 콜백 추가
  onImageDelete?: () => void; // 이미지 삭제 콜백 추가
  currentImage?: string | null;
  disabled?: boolean;
}

export default function MobileImageUpload({ 
  onImageSelect, 
  onImageEdit,
  onImageDelete,
  currentImage, 
  disabled = false 
}: MobileImageUploadProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일을 URL로 변환하여 편집기에 전달
      const imageUrl = URL.createObjectURL(file);
      setSelectedImageUrl(imageUrl);
      setShowEditor(true);
    }
  };

  const handleEditSave = (croppedImageBlob: Blob) => {
    // 편집된 이미지를 File 객체로 변환
    const editedFile = new File([croppedImageBlob], 'edited-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    
    // 편집된 이미지 콜백이 있으면 사용, 없으면 기존 방식 사용
    if (onImageEdit) {
      onImageEdit(editedFile);
    } else {
      onImageSelect(editedFile);
    }
    
    // 편집 모달 닫기 및 정리
    setShowEditor(false);
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl(null);
    }
  };

  const handleEditCancel = () => {
    setShowEditor(false);
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl(null);
    }
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('📷 카메라 시작 시도...');
      
      // 모바일에서 카메라 접근 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 카메라를 지원하지 않습니다.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCapturing(true);
        console.log('✅ 카메라 시작 성공');
      }
    } catch (error) {
      console.error('❌ 카메라 접근 실패:', error);
      
      let errorMessage = '카메라에 접근할 수 없습니다.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = '카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '카메라를 찾을 수 없습니다.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = '이 브라우저는 카메라를 지원하지 않습니다.';
        } else {
          errorMessage = `카메라 오류: ${error.message}`;
        }
      }
      
      setCameraError(errorMessage);
      
      // 5초 후 에러 메시지 제거
      setTimeout(() => setCameraError(null), 5000);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // 비디오 크기에 맞춰 캔버스 설정
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
          context.drawImage(video, 0, 0);
          console.log('📸 이미지 캡처 성공');

          canvas.toBlob((blob) => {
            if (blob) {
              // 캡처된 이미지를 URL로 변환하여 편집기에 전달
              const imageUrl = URL.createObjectURL(blob);
              setSelectedImageUrl(imageUrl);
              setShowEditor(true);
              stopCamera();
            } else {
              console.error('❌ Blob 생성 실패');
              alert('이미지 캡처에 실패했습니다.');
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          console.error('❌ 이미지 캡처 오류:', error);
          alert('이미지 캡처 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach((track: any) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setCameraError(null);
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    // 모바일에서 카메라 앱으로 직접 촬영
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    } else {
      // 폴백: 웹 카메라 사용
      startCamera();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 현재 이미지 표시 */}
      {currentImage && !isCapturing && (
        <div style={{
          position: 'relative',
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#374151',
        }}>
          <img
            src={currentImage}
            alt="위스키 이미지"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
            }}
          />
          {/* 편집/삭제 버튼 컨테이너 */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}>
            {/* 기존 이미지 편집 버튼 */}
            <button
              onClick={() => {
                if (currentImage) {
                  setSelectedImageUrl(currentImage);
                  setShowEditor(true);
                }
              }}
              disabled={disabled}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.95)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.95)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              ✂️ 편집
            </button>
            {/* 새 이미지 선택 버튼 */}
          <button
            onClick={openGallery}
            disabled={disabled}
            style={{
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
              }}
            >
              📷 새로
            </button>
            {onImageDelete && (
              <button
                onClick={onImageDelete}
                disabled={disabled}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
              cursor: disabled ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
                  gap: '6px',
                  fontWeight: '600',
            }}
          >
                🗑️ 삭제
          </button>
            )}
          </div>
        </div>
      )}

      {/* 카메라 에러 메시지 */}
      {cameraError && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          {cameraError}
        </div>
      )}

      {/* 카메라 캡처 모드 */}
      {isCapturing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              flex: 1,
              width: '100%',
              objectFit: 'cover',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* 카메라 컨트롤 */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ❌
            </button>
            <button
              type="button"
              onClick={captureImage}
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                border: '4px solid white',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                fontSize: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📸
            </button>
          </div>
        </div>
      )}

      {/* 업로드 버튼들 */}
      {!isCapturing && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <button
            type="button"
            onClick={openCamera}
            disabled={disabled}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            📷 카메라
          </button>
          <button
            type="button"
            onClick={openGallery}
            disabled={disabled}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            📁 갤러리
          </button>
        </div>
      )}

      {/* 갤러리용 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 카메라용 파일 입력 (모바일 카메라 앱 호출) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 이미지 편집 모달 */}
      {showEditor && selectedImageUrl && (
        <ImageEditor
          imageUrl={selectedImageUrl}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          onDelete={onImageDelete}
        />
      )}
    </div>
  );
} 