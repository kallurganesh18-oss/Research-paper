import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, Play, Loader2, Sparkles, BookOpen } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperTitle: string;
  extensionTitle: string;
  exactExtension: string;
  techStack: string[];
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  paperTitle,
  extensionTitle,
  exactExtension,
  techStack,
}) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      return;
    }

    const fetchCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/generate-starter-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paperTitle,
            extensionTitle,
            exactExtension,
            techStack,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to generate starter code');
        }

        const data = await res.json();
        setCode(data.code || '# No code generated');
      } catch (err: any) {
        setError(err.message || 'Error generating script');
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [isOpen, paperTitle, extensionTitle, exactExtension]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      // Strip markdown code fences if copying
      const cleanCode = code.replace(/^```python\s*/i, '').replace(/```\s*$/i, '');
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-100">
                  PyTorch Starter Blueprint
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Resume Project Starter
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {extensionTitle} — <span className="text-slate-300">{paperTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={loading || !code}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs rounded-lg transition-colors flex items-center space-x-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm font-sans">
                Synthesizing custom PyTorch module & benchmark loop for 3rd-year CS student...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-center">
              {error}
            </div>
          ) : (
            <div className="relative">
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed select-text font-mono">
                {code}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-sans">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ready to drop into Google Colab, Kaggle Notebook, or local PyTorch virtualenv.</span>
          </div>
          <div className="flex items-center space-x-2">
            {techStack.map((tech) => (
              <span key={tech} className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-[11px] font-mono">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
