import React, { useState, useCallback } from 'react';
import { editImage, getPromptSuggestions, refinePromptFromBanglish } from '../services/geminiService';
import { parseDataUrl } from '../utils/fileUtils';
import { Button } from './common/Button';
import { ImageDisplay } from './common/ImageDisplay';
import { ImageUpload } from './common/ImageUpload';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { Spinner } from './common/Spinner';
import { ImageData } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorMessage } from './common/ErrorMessage';

const RefinedPromptDisplay: React.FC<{
  label: string;
  prompt: string;
  onCopy: () => void;
  isCopied: boolean;
}> = ({ label, prompt, onCopy, isCopied }) => (
  <div className="relative">
    <label className="block text-xs font-medium text-gray-400 mb-1">{label}:</label>
    <textarea
      readOnly
      rows={4}
      value={prompt}
      className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 pr-12 text-gray-300 text-sm font-mono"
      aria-label={label}
    />
    <button
      onClick={onCopy}
      aria-label={`Copy ${label}`}
      className="absolute top-8 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
    >
      {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
    </button>
  </div>
);


export const EditImage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // State for Text Translation
  const [textToTranslate, setTextToTranslate] = useState<string>('');
  const [translatedPrompt, setTranslatedPrompt] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [isTranslatedCopied, setIsTranslatedCopied] = useState<boolean>(false);
  
  // State for Style Refinement
  const [refinedStylePrompt, setRefinedStylePrompt] = useState<string>('');
  const [isRefiningStyle, setIsRefiningStyle] = useState<boolean>(false);
  const [refineStyleError, setRefineStyleError] = useState<string | null>(null);
  const [isRefinedStyleCopied, setIsRefinedStyleCopied] = useState<boolean>(false);


  const handleGenerate = useCallback(async () => {
    if (!productImage) {
      setError('Please upload a product image.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Generating...');

    try {
      const imagesToProcess: ImageData[] = [];
      const sourceImageForEdit = historyIndex > -1 ? history[historyIndex] : productImage;
      
      if (sourceImageForEdit) {
          imagesToProcess.push(parseDataUrl(sourceImageForEdit));
      }

      if (referenceImage) {
        imagesToProcess.push(parseDataUrl(referenceImage));
      }

      const newImageUrl = await editImage(prompt, imagesToProcess);

      const newHistory = [...history.slice(0, historyIndex + 1), newImageUrl];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [prompt, productImage, referenceImage, history, historyIndex]);

  const handleGetSuggestions = useCallback(async () => {
    if (!productImage || isSuggesting) {
      return;
    }

    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions([]);

    try {
      const imageData = parseDataUrl(productImage);
      const newSuggestions = await getPromptSuggestions(imageData);
      setSuggestions(newSuggestions);
    } catch (err: any) {
      setSuggestionError(err.message || 'Failed to get suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  }, [productImage, isSuggesting]);

  const handleTranslateText = useCallback(async () => {
    if (!textToTranslate.trim()) {
        setTranslateError('Please enter text to translate and refine.');
        return;
    }
    setIsTranslating(true);
    setTranslateError(null);
    setTranslatedPrompt('');
    setIsTranslatedCopied(false);

    try {
        const result = await refinePromptFromBanglish(textToTranslate);
        setTranslatedPrompt(result);
    } catch (err: any) {
        setTranslateError(err.message || 'Failed to translate prompt.');
    } finally {
        setIsTranslating(false);
    }
  }, [textToTranslate]);

  const handleRefineFromStyle = useCallback(async (suggestion: string) => {
    if (!referenceImage) {
      setRefineStyleError("A reference image is required to refine from style.");
      return;
    };

    setIsRefiningStyle(true);
    setRefineStyleError(null);
    setRefinedStylePrompt('');
    setIsRefinedStyleCopied(false);
    
    try {
        const refImageData = parseDataUrl(referenceImage);
        const result = await refinePromptFromBanglish(suggestion, refImageData);
        setRefinedStylePrompt(result);
    } catch (err: any) {
        setRefineStyleError(err.message || 'Failed to refine prompt from style.');
    } finally {
        setIsRefiningStyle(false);
    }
  }, [referenceImage]);

  const handleCopy = useCallback((textToCopy: string, type: 'translate' | 'style') => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    if (type === 'translate') {
      setIsTranslatedCopied(true);
      setTimeout(() => setIsTranslatedCopied(false), 2000);
    } else {
      setIsRefinedStyleCopied(true);
      setTimeout(() => setIsRefinedStyleCopied(false), 2000);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > -1) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history.length]);

  const canUndo = historyIndex > -1;
  const canRedo = historyIndex < history.length - 1;

  const displayImage = historyIndex > -1 ? history[historyIndex] : null;
  const styleRefinementSuggestions = [
    { label: "Match Style & Mood", prompt: "Match the overall style, lighting, and mood of the reference image." },
    { label: "Adopt Color Palette", prompt: "Adopt the color palette from the reference image." },
    { label: "Match Background", prompt: "Recreate the background and composition of the reference image." },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left Column: Controls */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageUpload 
            label="Product Image" 
            imageUrl={productImage} 
            onFileSelect={(file) => {
              setProductImage(file);
              setHistory([]);
              setHistoryIndex(-1);
              setSuggestions([]);
              setSuggestionError(null);
            }}
          />
          <ImageUpload 
            label="Reference Image" 
            imageUrl={referenceImage} 
            onFileSelect={setReferenceImage}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300">
              Prompt
            </label>
            {productImage && (
              <button
                onClick={handleGetSuggestions}
                disabled={isSuggesting}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-cyan-300 bg-gray-700/80 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSuggesting ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <LightbulbIcon className="w-4 h-4" />
                )}
                Get Suggestions
              </button>
            )}
          </div>
          <textarea
            id="edit-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"e.g., Place the product on a marble countertop with soft morning light."}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm p-3 text-gray-200 focus:ring-primary focus:border-primary transition"
          />
          <div className="mt-2">
            <ErrorMessage message={suggestionError} size="sm" />
          </div>

          {suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-400">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="px-2.5 py-1.5 text-xs text-gray-200 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prompt Enhancer */}
        <div className="border-t border-gray-700 pt-6 space-y-8">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-cyan-400" />
                        Translate & Refine Prompt
                    </h3>
                    <p className="text-sm text-gray-400">Write in Banglish or simple English to get a professional prompt.</p>
                </div>
                
                <textarea
                    id="translate-prompt"
                    rows={3}
                    value={textToTranslate}
                    onChange={(e) => setTextToTranslate(e.target.value)}
                    placeholder="e.g., product er background change kore দাও..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm p-3 text-gray-200 focus:ring-primary focus:border-primary transition"
                />
                
                <Button 
                  onClick={handleTranslateText} 
                  disabled={isTranslating || !textToTranslate.trim()} 
                  className="w-full flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isTranslating ? <><Spinner className="w-5 h-5 mr-2" /> Translating...</> : 'Translate & Refine'}
                </Button>
                
                <ErrorMessage message={translateError} size="sm" />
                
                {translatedPrompt && (
                  <RefinedPromptDisplay
                    label="Translated Prompt"
                    prompt={translatedPrompt}
                    onCopy={() => handleCopy(translatedPrompt, 'translate')}
                    isCopied={isTranslatedCopied}
                  />
                )}
            </div>

            {referenceImage && (
              <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-cyan-400" />
                        Refine with Reference Image
                    </h3>
                    <p className="text-sm text-gray-400">Generate a prompt that applies the reference image's style to your product.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {styleRefinementSuggestions.map(suggestion => (
                     <button
                      key={suggestion.label}
                      onClick={() => handleRefineFromStyle(suggestion.prompt)}
                      disabled={isRefiningStyle}
                      className="px-3 py-2 text-sm text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
                
                {isRefiningStyle && <div className="flex items-center justify-center text-sm text-gray-400 gap-2 py-2"><Spinner className="w-4 h-4"/> Refining from reference style...</div>}

                <ErrorMessage message={refineStyleError} size="sm" />
                
                {refinedStylePrompt && (
                  <RefinedPromptDisplay
                    label="Refined Style Prompt"
                    prompt={refinedStylePrompt}
                    onCopy={() => handleCopy(refinedStylePrompt, 'style')}
                    isCopied={isRefinedStyleCopied}
                  />
                )}
              </div>
            )}
        </div>


        <div className="space-y-2 pt-4 border-t border-gray-700">
          <Button onClick={handleGenerate} disabled={isLoading || !productImage || !prompt.trim()}>
            {isLoading ? loadingStep : 'Generate'}
          </Button>
          <ErrorMessage message={error} />
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="space-y-4 sticky top-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
            Result
          </label>
          <ImageDisplay 
            isLoading={isLoading} 
            imageUrl={displayImage}
            loadingText={loadingStep || "Generating your image..."} 
          />
        </div>
        
        {history.length > 0 && (
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleUndo} 
              disabled={!canUndo || isLoading}
              aria-label="Undo last generation"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <UndoIcon className="w-5 h-5" />
              Undo
            </button>
            <button 
              onClick={handleRedo} 
              disabled={!canRedo || isLoading}
              aria-label="Redo last generation"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RedoIcon className="w-5 h-5" />
              Redo
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="pt-4 border-t border-gray-700 mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-3 text-center">
              History
            </label>
            <div className="flex overflow-x-auto space-x-4 pb-2 -mx-1 px-1">
              {/* Original Product Image Thumbnail */}
              {productImage && (
                <button
                  onClick={() => setHistoryIndex(-1)}
                  aria-label="Revert to original image state"
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary transition-all duration-200 group ${
                    historyIndex === -1
                      ? 'ring-2 ring-primary'
                      : 'ring-1 ring-gray-600 hover:ring-primary'
                  }`}
                >
                  <img
                    src={productImage}
                    alt="Original product image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Original</span>
                  </div>
                  {historyIndex === -1 && <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"></div>}
                </button>
              )}

              {/* Generated Images History */}
              {history.map((histImage, index) => (
                <button
                  key={index}
                  onClick={() => setHistoryIndex(index)}
                  aria-label={`Select history item ${index + 1}`}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary transition-all duration-200 ${
                    historyIndex === index
                      ? 'ring-2 ring-primary'
                      : 'ring-1 ring-gray-600 hover:ring-primary'
                  }`}
                >
                  <img
                    src={histImage}
                    alt={`History item ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {historyIndex === index && <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"></div>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};