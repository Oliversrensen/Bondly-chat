'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { X, Check } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
    // Update canvas when image loads
    setTimeout(updateCanvas, 100);
  }

  function onDownloadCropClick() {
    if (!completedCrop || !imgRef.current) {
      alert('Please select an area to crop');
      return;
    }

    // Create a new canvas for the final crop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const image = imgRef.current;
    const crop = completedCrop;

    // Set canvas size to 256x256 for high quality
    canvas.width = 256;
    canvas.height = 256;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate crop area
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Draw the cropped image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      256,
      256
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }
      onCropComplete(blob);
    }, 'image/jpeg', 0.9);
  }

  const updateCanvas = useCallback(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      console.log('Canvas update skipped:', { completedCrop: !!completedCrop, canvas: !!previewCanvasRef.current, image: !!imgRef.current });
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    console.log('Updating canvas with crop:', crop);

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to 128x128 for preview
    canvas.width = 128;
    canvas.height = 128;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate crop area
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    console.log('Drawing to canvas:', { cropX, cropY, cropWidth, cropHeight });

    // Draw the cropped image to the canvas
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      128,
      128
    );
  }, [completedCrop, scale, rotate]);

  // Update canvas when crop changes
  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Crop Your Profile Picture</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(95vh-140px)] pb-20 md:pb-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Image Cropper */}
            <div className="flex-1 min-w-0">
              <div className="max-h-80 sm:max-h-96 overflow-auto border border-gray-200 rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => {
                    setCompletedCrop(c);
                    // Update canvas immediately when crop changes
                    setTimeout(updateCanvas, 50);
                  }}
                  aspect={aspect}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>

              {/* Controls */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale: {Math.round(scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotate: {rotate}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotate}
                    onChange={(e) => setRotate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>
            </div>

            {/* Preview */}
            <div className="lg:w-64 w-full">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  This is how your profile picture will look
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 pb-20 md:pb-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onDownloadCropClick}
            disabled={!completedCrop}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
          >
            <Check className="w-4 h-4" />
            Use This Picture
          </button>
        </div>
      </div>
    </div>
  );
}
