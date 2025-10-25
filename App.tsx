import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabSelector } from './components/TabSelector';
import { GenerateImage } from './components/GenerateImage';
import { EditImage } from './components/EditImage';
import { Mode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.EDIT);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TabSelector currentMode={mode} onModeChange={setMode} />
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 sm:p-8">
            {mode === Mode.GENERATE ? <GenerateImage /> : <EditImage />}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;