import React, { useState, useCallback, KeyboardEvent } from 'react';
import { generateImage } from '../services/geminiService';
import { ASPECT_RATIOS, STYLE_PRESETS } from '../constants';
import { AspectRatio, StylePreset } from '../types';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { ImageDisplay } from './common/ImageDisplay';
import { ErrorMessage } from './common/ErrorMessage';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

export const GenerateImage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0].value);
  const [style, setStyle] = useState<StylePreset>(STYLE_PRESETS[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [typedPrompt, setTypedPrompt] = useState<string>('');

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setTypedPrompt(e.target.value);
    setHistoryIndex(-1); // Reset history navigation when user types
  };

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    // Add to history, ensuring no duplicates and limiting size
    setPromptHistory(prev => {
      const newHistory = [trimmedPrompt, ...prev.filter(p => p !== trimmedPrompt)];
      return newHistory.slice(0, 50); // Keep last 50 prompts
    });
    setHistoryIndex(-1);
    setTypedPrompt(trimmedPrompt);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, style);
      setResultImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, style]);

  const navigateHistory = (direction: 'up' | 'down') => {
    if (direction === 'up') { // Go to older prompts
      if (promptHistory.length > 0 && historyIndex < promptHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setPrompt(promptHistory[newIndex]);
      }
    } else { // Go to newer prompts / back to current typed prompt
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setPrompt(promptHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setPrompt(typedPrompt);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (promptHistory.length === 0) return;

    const { selectionStart, selectionEnd, value } = e.currentTarget;
    const isAtStart = selectionStart === 0 && selectionEnd === 0;
    const isAtEnd = selectionStart === value.length && selectionEnd === value.length;

    // Navigate up through history if ArrowUp is pressed at the start of the textarea
    if (e.key === 'ArrowUp' && isAtStart) {
      e.preventDefault();
      navigateHistory('up');
    } 
    // Navigate down through history if ArrowDown is pressed at the end of the textarea
    else if (e.key === 'ArrowDown' && isAtEnd) {
      e.preventDefault();
      navigateHistory('down');
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
            Prompt
            </label>
            {promptHistory.length > 0 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateHistory('up')}
                        disabled={historyIndex >= promptHistory.length - 1}
                        className="p-1 text-gray-400 rounded-md hover:bg-gray-700 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous prompt"
                        title="Previous prompt (Arrow Up)"
                    >
                        <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigateHistory('down')}
                        disabled={historyIndex < 0}
                        className="p-1 text-gray-400 rounded-md hover:bg-gray-700 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next prompt"
                        title="Next prompt (Arrow Down)"
                    >
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
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