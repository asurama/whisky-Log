'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  onDelete?: () => void; // 이미지 삭제 콜백 추가
  aspectRatio?: number; // 16/9, 1, 4/3 등
}

export default function ImageEditor({ 
  imageUrl, 
  onSave, 
  onCancel, 
  onDelete,
  aspectRatio = 0 // 기본값을 자유 비율로 변경
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !completedCrop) {
        reject(new Error('이미지나 자르기 영역이 없습니다.'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
        return;
      }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      try {
        ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 변환에 실패했습니다.'));
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        // CORS 오류 처리 - 이미지를 fetch로 다운로드 후 처리
        if (error instanceof Error && error.name === 'SecurityError') {
          console.warn('CORS 오류 발생, fetch로 이미지 다운로드 시도...');
          
          fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                  reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
                  return;
                }

                canvas.width = completedCrop.width;
                canvas.height = completedCrop.height;

                ctx.drawImage(
                  img,
                  completedCrop.x * scaleX,
                  completedCrop.y * scaleY,
                  completedCrop.width * scaleX,
                  completedCrop.height * scaleY,
                  0,
                  0,
                  completedCrop.width,
                  completedCrop.height
                );

                canvas.toBlob((newBlob) => {
                  if (newBlob) {
                    resolve(newBlob);
                  } else {
                    reject(new Error('이미지 변환에 실패했습니다.'));
                  }
                }, 'image/jpeg', 0.9);
              };
              img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
              img.src = URL.createObjectURL(blob);
            })
            .catch(fetchError => {
              console.error('이미지 다운로드 실패:', fetchError);
              reject(new Error('이미지를 다운로드할 수 없습니다.'));
            });
        } else {
          reject(error);
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      onSave(croppedBlob);
    } catch (error) {
      console.error('이미지 자르기 오류:', error);
      alert('이미지 자르기에 실패했습니다.');
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">이미지 편집</h3>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              ✅ 확인
            </button>
          </div>
        </div>

        {/* 이미지 편집 영역 */}
        <div className="flex justify-center mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined} // 자유 비율
            className="max-w-full max-h-[50vh]"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="편집할 이미지"
              crossOrigin="anonymous"
              className="max-w-full max-h-[50vh] object-contain"
            />
          </ReactCrop>
        </div>

        {/* 이미지 삭제 버튼 제거 - 이제 이미지 위에 편집/삭제 버튼이 있음 */}

        {/* 사용법 안내 */}
        <div className="text-sm text-gray-300 space-y-1">
          <p>• 드래그하여 자르기 영역을 조정하세요</p>
          <p>• 모서리를 드래그하여 크기를 조정하세요</p>
          <p>• 비율을 선택하여 위스키 보틀에 맞게 편집하세요</p>
          <p>• <strong>확인</strong> 버튼을 클릭하면 편집이 완료됩니다</p>
        </div>
      </div>
    </div>
  );
} 