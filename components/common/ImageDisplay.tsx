import React from 'react';
import { Spinner } from './Spinner';
import { PhotoIcon } from '../icons/PhotoIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

interface ImageDisplayProps {
  isLoading: boolean;
  imageUrl: string | null;
  loadingText: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ isLoading, imageUrl, loadingText }) => {
  return (
    <div className={`relative w-full aspect-square bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden transition-colors`}>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Result" 
          className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`} 
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-900/50">
          <Spinner className="w-12 h-12 mx-auto mb-3" />
          <p>{loadingText}</p>
        </div>
      )}

      {!isLoading && !imageUrl && (
        <div className="text-center text-gray-500">
            <PhotoIcon className="w-16 h-16 mx-auto mb-2 opacity-50"/>
            <p>Your image will appear here</p>
        </div>
      )}

      {imageUrl && !isLoading && (
        <a
          href={imageUrl}
          download="gemini-image.png"
          className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full text-white hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary"
          aria-label="Download image"
        >
          <DownloadIcon className="w-5 h-5" />
        </a>
      )}
    </div>
  );
};