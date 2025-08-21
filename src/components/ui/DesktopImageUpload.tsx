'use client';

import { useRef, useState } from 'react';
import ImageEditor from './ImageEditor';

interface DesktopImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageEdit?: (file: File) => void; // 편집된 이미지 콜백 추가
  onImageDelete?: () => void; // 이미지 삭제 콜백 추가
  currentImage?: string | null;
  disabled?: boolean;
}

export default function DesktopImageUpload({ 
  onImageSelect, 
  onImageEdit,
  onImageDelete,
  currentImage, 
  disabled = false 
}: DesktopImageUploadProps) {
  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일을 URL로 변환하여 편집기에 전달
      const imageUrl = URL.createObjectURL(file);
      setSelectedImageUrl(imageUrl);
      setShowEditor(true);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
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

  return (
    <div style={{ width: '100%' }}>
      {/* 현재 이미지 표시 */}
      {currentImage && (
        <div style={{
          position: 'relative',
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#374151',
          border: '2px dashed #6B7280',
        }}>
          <img
            src={currentImage}
            alt="위스키 이미지"
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
            }}
          />
          {/* 편집/삭제 버튼 컨테이너 */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
          }}>
            {/* 기존 이미지 편집 버튼 */}
            <button
              type="button"
              onClick={() => {
                if (currentImage) {
                  setSelectedImageUrl(currentImage);
                  setShowEditor(true);
                }
              }}
              disabled={disabled || !currentImage}
              style={{
                backgroundColor: currentImage ? 'rgba(59, 130, 246, 0.9)' : 'rgba(107, 114, 128, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: (disabled || !currentImage) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
              }}
            >
              ✂️ 자르기
            </button>
            {/* 새 이미지 선택 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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
                type="button"
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

      {/* 드래그 앤 드롭 영역 */}
      {!currentImage && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #6B7280',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#374151',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
          <div style={{ 
            fontSize: '18px', 
            color: 'white', 
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            이미지를 여기에 드래그하거나 클릭하세요
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#9CA3AF'
          }}>
            JPG, PNG, GIF 파일 지원 (최대 5MB)
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6B7280',
            marginTop: '8px'
          }}>
            ✨ 선택 후 편집 가능
          </div>
        </div>
      )}

      {/* 파일 선택 버튼 */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        📁 파일 선택
      </button>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 이미지 편집 모달 */}
      {showEditor && selectedImageUrl && (
        <ImageEditor
          imageUrl={selectedImageUrl}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          onDelete={onImageDelete} // 삭제 콜백 전달
          aspectRatio={1} // 정사각형 비율
        />
      )}
    </div>
  );
} 