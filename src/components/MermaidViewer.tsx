import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Code, Maximize2, Minimize2 } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  paperTitle?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, paperTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sanitize chart code to prevent common Mermaid syntax issues
  const cleanChart = (code: string) => {
    let clean = code
      .replace(/```mermaid/gi, '')
      .replace(/```/g, '')
      .replace(/\[FLOWCHART\]/gi, '')
      .trim();

    if (!clean.startsWith('graph ') && !clean.startsWith('flowchart ')) {
      clean = `graph TD\n    ${clean}`;
    }

    return clean;
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Fira Code, monospace',
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
        padding: 16,
      },
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        edgeLabelBackground: '#1e293b',
        nodeBorder: '#3b82f6',
      },
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setError(null);
        const cleaned = cleanChart(chart);
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, cleaned);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Syntax error in generated Mermaid diagram.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanChart(chart));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(paperTitle || 'architecture-flowchart').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-slate-950 border-slate-700' : 'h-[520px]'
    }`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            System Architecture Flowchart (Mermaid.js)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/60 font-mono">
            graph TD
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.4))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Toggle Raw Code */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center space-x-1 transition-colors ${
              showCode 
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Toggle Raw Mermaid Code"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Code</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download SVG */}
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Export as SVG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-auto bg-slate-950 p-6 flex items-center justify-center">
        {showCode ? (
          <div className="w-full h-full p-4 font-mono text-xs text-blue-300 bg-slate-900/90 rounded-lg overflow-auto select-text border border-slate-800">
            <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800 text-slate-400">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">[FLOWCHART] Specification</span>
              <span className="text-[11px] text-slate-500">Mermaid.js Syntax</span>
            </div>
            <pre className="whitespace-pre leading-relaxed">{cleanChart(chart)}</pre>
          </div>
        ) : error ? (
          <div className="max-w-md p-5 bg-red-950/40 border border-red-800/60 rounded-xl text-center">
            <p className="text-sm font-medium text-red-300 mb-2">Diagram Rendering Notice</p>
            <p className="text-xs text-red-400/90 mb-4">{error}</p>
            <button
              onClick={() => setShowCode(true)}
              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs rounded-lg transition-colors"
            >
              View Raw Mermaid Code
            </button>
          </div>
        ) : !svgContent ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono">Synthesizing layer topology...</p>
          </div>
        ) : (
          <div 
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 flex items-center justify-center w-full min-h-full cursor-grab active:cursor-grabbing select-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Zoom badge indicator */}
        <div className="absolute bottom-3 right-4 bg-slate-900/80 border border-slate-800/80 rounded-md px-2 py-0.5 text-[11px] text-slate-400 font-mono backdrop-blur-sm pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};
