import React from 'react';
import { Icons } from './Icon';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  language: 'Oracle' | 'PostgreSQL';
  readOnly?: boolean;
  color: 'orange' | 'blue';
  onCopy?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  label,
  language,
  readOnly = false,
  color,
  onCopy
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simple border color mapping
  const borderColor = color === 'orange' ? 'border-orange-500' : 'border-blue-500';
  const badgeColor = color === 'orange' ? 'bg-orange-600' : 'bg-blue-600';

  return (
    <div className={`flex flex-col h-full rounded-lg border-2 ${borderColor} bg-slate-900 shadow-xl overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${badgeColor}`}>
            {language}
          </span>
          <h3 className="text-slate-300 font-medium text-sm">{label}</h3>
        </div>
        <div className="flex items-center space-x-2">
           {readOnly && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
              title="Copy Code"
            >
              {copied ? <Icons.Check size={16} className="text-green-500" /> : <Icons.Copy size={16} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="relative flex-1 group">
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          className={`w-full h-full p-4 bg-[#0f172a] text-slate-300 font-mono text-sm resize-none focus:outline-none ${readOnly ? 'cursor-text' : ''}`}
          placeholder={readOnly ? "Translation will appear here..." : "-- Paste your Oracle SQL/PLSQL code here..."}
          spellCheck={false}
        />
      </div>
    </div>
  );
};