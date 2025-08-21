'use client';

import { useDevice } from '@/hooks/useDevice';
import MobileImageUpload from './MobileImageUpload';
import DesktopImageUpload from './DesktopImageUpload';

interface ResponsiveImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageEdit?: (file: File) => void; // 편집된 이미지 콜백 추가
  onImageDelete?: () => void; // 이미지 삭제 콜백 추가
  currentImage?: string | null;
  preview?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export default function ResponsiveImageUpload(props: ResponsiveImageUploadProps) {
  const { isMobile } = useDevice();
  
  // preview를 currentImage로 매핑 (preview가 우선)
  const imageProps = {
    ...props,
    currentImage: props.preview || props.currentImage || null
  };



  return isMobile ? (
    <MobileImageUpload {...imageProps} />
  ) : (
    <DesktopImageUpload {...imageProps} />
  );
} 