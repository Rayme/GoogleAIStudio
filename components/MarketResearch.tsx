import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Globe } from 'lucide-react';
import { conductMarketResearch } from '../services/geminiService';
import { AnalysisResult } from '../types';
import ReactMarkdown from 'react-markdown';

export const MarketResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await conductMarketResearch(query);
      setResult(data);
    } catch (err) {
      setError("Failed to fetch market insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          Live Market Intelligence
        </h2>
        <p className="text-slate-500 mb-6">
          Use the power of Google Search to find real-time trends, competitor pricing, and demand signals.
        </p>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., 'Current trending kitchen gadgets on Amazon' or 'Competitors for bamboo toothbrushes'"
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Insight Report</h3>
          
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
            <ReactMarkdown>{result.markdown}</ReactMarkdown>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources & References</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {result.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium truncate flex-1">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};