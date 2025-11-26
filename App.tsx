import React, { useState, useEffect } from 'react';
import { translateCode, explainMigration } from './services/geminiService';
import { DEFAULT_ORACLE_CODE, MIGRATION_LABELS } from './constants';
import { MigrationType } from './types';
import { CodeEditor } from './components/CodeEditor';
import { Icons } from './components/Icon';

const App: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>(DEFAULT_ORACLE_CODE);
  const [targetCode, setTargetCode] = useState<string>('');
  const [migrationType, setMigrationType] = useState<MigrationType>(MigrationType.SCHEMA);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceCode.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    setExplanation(null);
    
    try {
      const result = await translateCode(sourceCode, migrationType);
      setTargetCode(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during translation.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExplain = async () => {
    if (!sourceCode || !targetCode) return;
    
    setIsExplaining(true);
    try {
      const result = await explainMigration(sourceCode, targetCode);
      setExplanation(result);
    } catch (err) {
      // Silent fail on explanation
    } finally {
      setIsExplaining(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
              <Icons.Database className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-blue-400">
              Ora2PG-Web
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
              Gemini Powered
            </span>
          </div>

          <div className="flex items-center space-x-4">
             <a href="https://github.com/darold/ora2pg" target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden md:block">
              Inspired by ora2pg
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
        
        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={migrationType}
                onChange={(e) => setMigrationType(e.target.value as MigrationType)}
                className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 pr-8"
              >
                {Object.entries(MIGRATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <button
              onClick={() => setSourceCode('')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <Icons.Clear size={16} />
              <span>Clear</span>
            </button>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceCode}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-lg shadow-indigo-500/20 
                ${isTranslating || !sourceCode 
                  ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'}`}
            >
              {isTranslating ? (
                <>
                  <Icons.Loading size={18} className="animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Icons.Convert size={18} />
                  <span>Convert to Postgres</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          
          {/* Source */}
          <div className="flex flex-col h-[500px] lg:h-auto">
            <CodeEditor 
              label="Source (Oracle)"
              language="Oracle"
              value={sourceCode}
              onChange={setSourceCode}
              color="orange"
            />
          </div>

          {/* Target */}
          <div className="flex flex-col h-[500px] lg:h-auto relative">
             {error ? (
                 <div className="absolute inset-0 z-10 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 border-2 border-red-900/50 rounded-lg">
                   <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md text-center">
                     <Icons.Error className="w-12 h-12 text-red-500 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-red-200 mb-2">Translation Error</h3>
                     <p className="text-red-300/80 mb-4">{error}</p>
                     <button 
                        onClick={() => setError(null)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
                     >
                        Dismiss
                     </button>
                   </div>
                 </div>
             ) : null}
            <CodeEditor 
              label="Target (PostgreSQL)"
              language="PostgreSQL"
              value={targetCode}
              readOnly={true}
              color="blue"
              onCopy={() => copyToClipboard(targetCode)}
            />
          </div>

          {/* Floating Action Button for Mobile or Desktop */}
           {!isTranslating && targetCode && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
                <div className="bg-slate-900 p-2 rounded-full border border-slate-700 shadow-xl">
                  <Icons.Convert className="text-slate-400" size={24} />
                </div>
              </div>
           )}
        </div>

        {/* Explanation Section */}
        {targetCode && !error && (
            <div className="mt-6 border-t border-slate-800 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                        <Icons.Info size={18} className="text-blue-400"/>
                        Migration Insights
                    </h3>
                    <button 
                        onClick={handleExplain}
                        disabled={isExplaining}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                        {isExplaining ? "Analyzing..." : "Refresh Analysis"}
                    </button>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 text-slate-300 text-sm leading-relaxed">
                    {!explanation && !isExplaining && (
                         <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                             <p>Click "Refresh Analysis" to get an AI summary of changes.</p>
                         </div>
                    )}
                    {isExplaining && (
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Icons.Loading className="animate-spin" size={16}/>
                            Analyzing schema differences...
                        </div>
                    )}
                    {explanation && !isExplaining && (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line">
                            {explanation}
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;