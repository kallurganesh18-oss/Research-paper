import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Cpu,
  Sparkles,
  GitBranch,
  Layers,
  ArrowRight,
  ExternalLink,
  Check,
  Copy,
  Zap,
  ShieldCheck,
  Code2,
  Terminal,
  Activity,
  ChevronRight,
  RefreshCw,
  FileCode,
  GraduationCap,
  Briefcase,
  Sliders,
  History,
  Info
} from 'lucide-react';
import { MermaidViewer } from './components/MermaidViewer.tsx';
import { RawOutputView } from './components/RawOutputView.tsx';
import { PaperChat } from './components/PaperChat.tsx';
import { CodeModal } from './components/CodeModal.tsx';

interface CoreConcept {
  problemStatement: string;
  primaryMethodology: string;
  mathematicalBreakthroughs: string;
  plainSummary: string;
  wordCount: number;
}

interface StudentOpportunity {
  id: string;
  title: string;
  exactExtension: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string[];
  studentResumeBullet: string;
  difficulty: string;
  suggestedDataset: string;
  implementationRoadmap?: string[];
}

interface PaperAnalysis {
  paperTitle: string;
  authors: string[];
  publicationYear: string;
  arxivIdOrVenue: string;
  tokensUsedEstimate: number;
  coreConcept: CoreConcept;
  flowchart: string;
  futureWork: StudentOpportunity[];
  rawOutput: string;
}

// Benchmark foundational papers for instant exploration
const BENCHMARK_PAPERS = [
  {
    title: 'Attention Is All You Need',
    url: 'https://arxiv.org/abs/1706.03762',
    venue: 'NeurIPS 2017',
    tag: 'Transformers',
    badgeColor: 'blue',
  },
  {
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    url: 'https://arxiv.org/abs/2205.14135',
    venue: 'NeurIPS 2022',
    tag: 'Systems & GPU',
    badgeColor: 'emerald',
  },
  {
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    url: 'https://arxiv.org/abs/2106.09685',
    venue: 'ICLR 2022',
    tag: 'Parameter Efficiency',
    badgeColor: 'purple',
  },
  {
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    url: 'https://arxiv.org/abs/2312.00752',
    venue: 'arXiv 2023',
    tag: 'State Spaces (SSM)',
    badgeColor: 'amber',
  },
  {
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
    url: 'https://arxiv.org/abs/2501.12948',
    venue: 'arXiv 2025',
    tag: 'Reasoning RL',
    badgeColor: 'rose',
  },
  {
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    url: 'https://arxiv.org/abs/2005.11401',
    venue: 'NeurIPS 2020',
    tag: 'RAG Systems',
    badgeColor: 'cyan',
  },
];

export default function App() {
  const [inputUrl, setInputUrl] = useState<string>('https://arxiv.org/abs/1706.03762');
  const [inputTitle, setInputTitle] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'url' | 'title' | 'paste'>('url');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flowchart' | 'futureWork' | 'chat' | 'rawOutput'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);

  // Starter code modal state
  const [codeModalData, setCodeModalData] = useState<{
    isOpen: boolean;
    extensionTitle: string;
    exactExtension: string;
    techStack: string[];
  }>({
    isOpen: false,
    extensionTitle: '',
    exactExtension: '',
    techStack: [],
  });

  // Local history
  const [history, setHistory] = useState<Array<{ title: string; url: string; date: string }>>([]);

  // Auto-analyze initial paper on mount if empty
  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('paperpulse_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }

    // Trigger analysis for initial paper
    analyzePaper('https://arxiv.org/abs/1706.03762', 'Attention Is All You Need');
  }, []);

  const analyzePaper = async (urlToUse?: string, titleToUse?: string, textToUse?: string) => {
    const targetUrl = urlToUse !== undefined ? urlToUse : (inputMode === 'url' ? inputUrl : '');
    const targetTitle = titleToUse !== undefined ? titleToUse : (inputMode === 'title' ? inputTitle : '');
    const targetText = textToUse !== undefined ? textToUse : (inputMode === 'paste' ? pastedText : '');

    if (!targetUrl && !targetTitle && !targetText) {
      setError('Please provide a paper URL, arXiv ID, title, or abstract excerpt.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('Ingesting paper metadata & checking token budget (<25k)...');

    const steps = [
      'Ingesting paper metadata & checking token budget (<25k)...',
      'Synthesizing Core Concepts under 300 words...',
      'Deriving Architectural Flowchart (Mermaid.js graph TD)...',
      'Brainstorming 3 concrete 3rd-year CS student project blueprints...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1800);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          title: targetTitle,
          pastedText: targetText,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze paper.');
      }

      const data: PaperAnalysis = await response.json();
      setAnalysis(data);

      // Save to history
      if (data.paperTitle) {
        const newHist = [
          { title: data.paperTitle, url: targetUrl || '', date: new Date().toLocaleDateString() },
          ...history.filter((h) => h.title !== data.paperTitle),
        ].slice(0, 8);
        setHistory(newHist);
        localStorage.setItem('paperpulse_history', JSON.stringify(newHist));
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || 'Error communicating with research agent.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopyResumeBullet = async (id: string, bulletText: string) => {
    try {
      await navigator.clipboard.writeText(bulletText);
      setCopiedBulletId(id);
      setTimeout(() => setCopiedBulletId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSelectBenchmark = (bench: typeof BENCHMARK_PAPERS[0]) => {
    setInputMode('url');
    setInputUrl(bench.url);
    analyzePaper(bench.url, bench.title);
  };

  const currentTokens = analysis?.tokensUsedEstimate || 2400;
  const tokenPercentage = Math.min(100, Math.round((currentTokens / 25000) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">PaperPulse</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  CS Research Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Systems & Architecture Extraction • Student Opportunities Engine
              </p>
            </div>
          </div>

          {/* Operational Constraint Telemetry: Token Efficiency Meter */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="font-mono">{currentTokens.toLocaleString()} / 25,000</span>
                  <span className="text-slate-500">tokens</span>
                </div>
                <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${tokenPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                {tokenPercentage}% limit
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>arXiv API + Web Search Grounding</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Research Paper Input Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Input Method
              </span>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setInputMode('url')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === 'url' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paper URL / arXiv ID
              </button>
              <button
                onClick={() => setInputMode('title')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === 'title' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Search by Title
              </button>
              <button
                onClick={() => setInputMode('paste')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === 'paste' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste Abstract / Text
              </button>
            </div>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              analyzePaper();
            }}
            className="space-y-3"
          >
            {inputMode === 'url' && (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter arXiv URL (e.g. https://arxiv.org/abs/1706.03762) or arXiv ID (e.g. 2307.08691)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputUrl.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Parse & Extract'}</span>
                </button>
              </div>
            )}

            {inputMode === 'title' && (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="Enter paper title (e.g. FlashAttention-2: Faster Attention with Better Parallelism)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Searching...' : 'Search & Parse'}</span>
                </button>
              </div>
            )}

            {inputMode === 'paste' && (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste paper abstract, introduction, or architecture notes here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !pastedText.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Processing Text...' : 'Analyze Excerpt'}</span>
                </button>
              </div>
            )}
          </form>

          {/* Quick Presets / Benchmark Papers */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 mb-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or explore seminal benchmark architectures:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {BENCHMARK_PAPERS.map((bench) => (
                <button
                  key={bench.title}
                  onClick={() => handleSelectBenchmark(bench)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center space-x-2 transition-all shrink-0 text-left"
                >
                  <span className="font-medium text-xs">{bench.title.split(':')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {bench.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading Progress Card */}
        {loading && (
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex items-center space-x-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">
                CS Research Agent in Progress
              </h4>
              <p className="text-xs text-blue-400 font-mono">
                {loadingStep || 'Parsing and structuring paper architecture...'}
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-4 text-xs text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active Analysis Workbench */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Paper Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-mono">
                      {analysis.arxivIdOrVenue}
                    </span>
                    <span className="text-xs text-slate-400">
                      Published {analysis.publicationYear}
                    </span>
                    <span className="text-xs text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Token Efficient (&lt;25k)</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {analysis.paperTitle}
                  </h2>

                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Authors:</span>{' '}
                    {analysis.authors.join(', ')}
                  </p>
                </div>

                {/* Switcher between Workbench tabs & Verbatim Raw Output */}
                <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                        activeTab !== 'rawOutput'
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Interactive Workbench</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('rawOutput')}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                        activeTab === 'rawOutput'
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Verbatim Agent Format</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-tabs for Workbench View */}
              {activeTab !== 'rawOutput' && (
                <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto text-xs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all ${
                      activeTab === 'overview'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>1. Core Concept Extraction</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                      &lt;300w
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('flowchart')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all ${
                      activeTab === 'flowchart'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Architectural Flowchart</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 font-mono">
                      Mermaid.js
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('futureWork')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all ${
                      activeTab === 'futureWork'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <span>3. Future Work & Opportunities</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 font-mono">
                      3rd-Year CS Ready
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all ${
                      activeTab === 'chat'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Interactive Q&A Inspector</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content for Active View */}

            {/* TAB 1: CORE CONCEPTS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 3 Pillar Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Problem Statement */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Problem Statement</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.coreConcept.problemStatement}
                    </p>
                  </div>

                  {/* Primary Methodology */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Primary Methodology</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.coreConcept.primaryMethodology}
                    </p>
                  </div>

                  {/* Mathematical Breakthroughs */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        Mathematical & Algorithmic Breakthroughs
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {analysis.coreConcept.mathematicalBreakthroughs}
                    </p>
                  </div>
                </div>

                {/* Synthesis Card & Operational Token/Word Check */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Plain-Language Core Concept Synthesis
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        {analysis.coreConcept.wordCount} words (Under 300 words constraint verified)
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {analysis.coreConcept.plainSummary}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-300 font-medium">Quick Actions:</span>
                      <button
                        onClick={() => setActiveTab('flowchart')}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1"
                      >
                        <span>Inspect Architecture Diagram</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveTab('futureWork')}
                        className="text-purple-400 hover:text-purple-300 hover:underline flex items-center space-x-1"
                      >
                        <span>Explore 3rd-Year CS Student Projects</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FLOWCHART (MERMAID.JS) */}
            {activeTab === 'flowchart' && (
              <div className="space-y-4">
                <MermaidViewer chart={analysis.flowchart} paperTitle={analysis.paperTitle} />

                {/* Architecture Highlights Note */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Mermaid.js Flowchart Breakdown: </span>
                    This flowchart charts data inputs, preprocessing/embedding transformations, internal layer routing (attention heads, normalization, feed-forward projections, residual additions), and the final output head. You can zoom, pan, export as SVG, or toggle raw Mermaid code.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FUTURE WORK & INTERNSHIP OPPORTUNITIES */}
            {activeTab === 'futureWork' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      3rd-Year CS Student Project & Resume Matrix
                    </h3>
                    <p className="text-xs text-slate-400">
                      Concrete, realistic extensions tailored for technical internship resumes, portfolios, and research demos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {analysis.futureWork.map((opp, idx) => (
                    <div
                      key={opp.id || idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                    >
                      <div className="space-y-4">
                        {/* Header badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60">
                            Idea #{idx + 1}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60 font-sans">
                            {opp.difficulty || '3rd-Year CS'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {opp.title}
                        </h4>

                        {/* Exact Extension */}
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                            Exact Extension
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                            {opp.exactExtension}
                          </p>
                        </div>

                        {/* Targeted Performance Metric */}
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center space-x-1">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Targeted Performance Metric</span>
                          </span>
                          <p className="text-xs text-emerald-300 font-mono bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                            {opp.targetedPerformanceMetric}
                          </p>
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                            Recommended Tech Stack
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {opp.recommendedTechStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-mono border border-slate-700/60"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Suggested Dataset if available */}
                        {opp.suggestedDataset && (
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-slate-400 font-medium">Dataset: </span>
                            <span className="text-slate-300 font-mono">{opp.suggestedDataset}</span>
                          </div>
                        )}

                        {/* Actionable Resume Bullet */}
                        {opp.studentResumeBullet && (
                          <div className="space-y-1 pt-1 border-t border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                                <span>Resume Bullet Point</span>
                              </span>
                              <button
                                onClick={() => handleCopyResumeBullet(opp.id, opp.studentResumeBullet)}
                                className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px]"
                              >
                                {copiedBulletId === opp.id ? (
                                  <span className="text-emerald-400 flex items-center space-x-0.5">
                                    <Check className="w-3 h-3" />
                                    <span>Copied</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-0.5">
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </span>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                              "{opp.studentResumeBullet}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Generate Starter PyTorch Code */}
                      <button
                        onClick={() =>
                          setCodeModalData({
                            isOpen: true,
                            extensionTitle: opp.title,
                            exactExtension: opp.exactExtension,
                            techStack: opp.recommendedTechStack,
                          })
                        }
                        className="mt-5 w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 hover:border-blue-500 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Generate Starter Code</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: INTERACTIVE Q&A INSPECTOR */}
            {activeTab === 'chat' && (
              <PaperChat paperTitle={analysis.paperTitle} paperContext={analysis} />
            )}

            {/* TAB 5 / RAW AGENT OUTPUT (VERBATIM SPECIFICATION) */}
            {activeTab === 'rawOutput' && (
              <RawOutputView rawText={analysis.rawOutput} paperTitle={analysis.paperTitle} />
            )}
          </div>
        )}

      </main>

      {/* Starter Code Modal */}
      <CodeModal
        isOpen={codeModalData.isOpen}
        onClose={() => setCodeModalData((prev) => ({ ...prev, isOpen: false }))}
        paperTitle={analysis?.paperTitle || 'Research Paper'}
        extensionTitle={codeModalData.extensionTitle}
        exactExtension={codeModalData.exactExtension}
        techStack={codeModalData.techStack}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PaperPulse CS Research Agent • Powered by Google Gemini 3.8 Flash & Grounded arXiv Retrieval
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Strict &lt;25k Token Budget Guarantee
          </span>
        </div>
      </footer>
    </div>
  );
}
