import React, { useState } from 'react';
import { Copy, Check, FileText, CheckCircle2 } from 'lucide-react';

interface RawOutputViewProps {
  rawText: string;
  paperTitle: string;
}

export const RawOutputView: React.FC<RawOutputViewProps> = ({ rawText, paperTitle }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
            Verbatim CS Research Agent Specification Output
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
            Structured Formatted Output
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors flex items-center space-x-1.5 border border-slate-700 font-sans"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Full Output' : 'Copy All Output'}</span>
        </button>
      </div>

      <div className="p-6 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap">
        {rawText}
      </div>

      <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Includes Core Concept (&lt;300 words), [FLOWCHART] block, and 3 Student Extensions</span>
        </div>
        <span className="font-mono text-slate-500">Target token budget &lt; 25,000 tokens compliant</span>
      </div>
    </div>
  );
};
