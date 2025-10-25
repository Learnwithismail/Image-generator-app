import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
          Gemini Product Studio
        </h1>
      </div>
    </header>
  );
};