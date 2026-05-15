import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Maximize2, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspect?: number;
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

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspect: initialAspect }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [useAspect, setUseAspect] = useState(!!initialAspect);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (useAspect && initialAspect) {
      setCrop(centerAspectCrop(width, height, initialAspect));
    } else {
      // Default free crop area
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      });
    }
  }

  const toggleAspect = () => {
    if (!useAspect && initialAspect && imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, initialAspect));
    }
    setUseAspect(!useAspect);
  };

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Get the actual scale of the image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Ensure dimensions are valid
    const cropWidth = Math.floor(completedCrop.width * scaleX);
    const cropHeight = Math.floor(completedCrop.height * scaleY);

    if (cropWidth <= 0 || cropHeight <= 0) return;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95 // High quality
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-border my-auto">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card z-10">
          <div className="flex flex-col">
            <h3 className="font-black text-2xl leading-tight">Crop Image</h3>
            <p className="text-sm text-muted-foreground">Adjust the crop area from all sides</p>
          </div>
          <div className="flex items-center gap-3">
            {initialAspect && (
              <button 
                type="button"
                onClick={toggleAspect}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  useAspect 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Maximize2 size={14} />
                {useAspect ? 'Fixed Ratio' : 'Free Crop'}
              </button>
            )}
            <button type="button" onClick={onCancel} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="relative overflow-auto max-h-[60vh] flex items-center justify-center bg-black/20 p-4 md:p-8">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={useAspect ? initialAspect : undefined}
            className="max-w-full shadow-2xl"
          >
            <img
              ref={imgRef}
              alt="Crop area"
              src={imageSrc}
              onLoad={onImageLoad}
              crossOrigin="anonymous"
              className="max-w-full block"
              style={{ maxHeight: '55vh', objectFit: 'contain' }}
            />
          </ReactCrop>
        </div>
        
        <div className="p-8 bg-card z-10 border-t border-border">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex items-center gap-4 text-muted-foreground">
              <div className="p-3 bg-muted rounded-2xl hidden sm:block">
                <Move size={20} className="text-orange-500" />
              </div>
              <p className="text-xs font-medium leading-relaxed">
                Drag the <span className="text-foreground font-bold">corners</span> to resize and the <span className="text-foreground font-bold">center</span> to move the crop box.
              </p>
            </div>
            <div className="flex gap-4 min-w-[300px]">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 font-bold rounded-2xl border border-border hover:bg-muted transition-all text-sm active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCrop}
                disabled={!completedCrop}
                className="flex-1 py-4 font-bold rounded-2xl bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Check size={20} /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



