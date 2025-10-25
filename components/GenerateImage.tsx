import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { ASPECT_RATIOS, STYLE_PRESETS } from '../constants';
import { AspectRatio, StylePreset } from '../types';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { ImageDisplay } from './common/ImageDisplay';
import { ErrorMessage } from './common/ErrorMessage';

export const GenerateImage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0].value);
  const [style, setStyle] = useState<StylePreset>(STYLE_PRESETS[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, style);
      setResultImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, style]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Prompt
        </label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photo of an astronaut riding a horse on Mars"
          className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm p-3 text-gray-200 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setStyle(preset.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                style === preset.value
                  ? 'bg-primary border-primary/80 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                aspectRatio === ratio.value
                  ? 'bg-primary border-primary/80 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
        {isLoading ? 'Generating...' : 'Generate Image'}
      </Button>
      
      <div className="mt-6 space-y-4">
        <ErrorMessage message={error} />
        <ImageDisplay isLoading={isLoading} imageUrl={resultImage} loadingText="Generating your masterpiece..." />
      </div>
    </div>
  );
};