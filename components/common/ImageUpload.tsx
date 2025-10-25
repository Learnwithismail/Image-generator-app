import React, { useRef, useState, useCallback } from 'react';
import { fileToDataUrl } from '../../utils/fileUtils';
import { Spinner } from './Spinner';
import { UploadIcon } from '../icons/UploadIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface ImageUploadProps {
  label: string;
  onFileSelect: (dataUrl: string | null) => void;
  imageUrl: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, onFileSelect, imageUrl }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        onFileSelect(dataUrl);
      } catch (err) {
        console.error('Failed to load image:', err);
        onFileSelect(null); // Notify parent about failure
      } finally {
        setIsLoading(false);
      }
    }
  }, [onFileSelect]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleUploadKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUploadClick();
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering the upload click
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={handleUploadKeyDown}
        onClick={handleUploadClick}
        className="relative flex flex-col items-center justify-center p-1 border-2 border-dashed border-gray-600 rounded-lg aspect-square bg-gray-900 transition hover:border-primary cursor-pointer group"
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        {isLoading ? (
          <Spinner className="w-12 h-12" />
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="max-w-full max-h-full object-contain rounded-md" />
            <button
              onClick={handleClear}
              aria-label={`Remove ${label}`}
              className="absolute top-2 right-2 p-1 bg-gray-800/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">Click to upload</p>
            <p className="text-xs">PNG, JPG, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
};