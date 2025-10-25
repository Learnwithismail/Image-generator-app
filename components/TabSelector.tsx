
import React from 'react';
import { Mode } from '../types';
import { PhotoIcon } from './icons/PhotoIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';

interface TabSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ currentMode, onModeChange }) => {
  const tabs = [
    { mode: Mode.GENERATE, label: 'Generate Image', icon: <PhotoIcon className="w-5 h-5 mr-2" /> },
    { mode: Mode.EDIT, label: 'Edit Image', icon: <PaintBrushIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="flex justify-center bg-gray-900 p-1 rounded-lg border border-gray-700 max-w-sm mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          onClick={() => onModeChange(tab.mode)}
          className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary ${
            currentMode === tab.mode
              ? 'bg-primary text-white shadow'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};