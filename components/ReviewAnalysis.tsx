import React, { useState } from 'react';
import { MessageSquare, Loader2, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';
import { analyzeReviews } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const ReviewAnalysis: React.FC = () => {
  const [reviews, setReviews] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!reviews.trim()) return;
    setLoading(true);
    try {
      const response = await analyzeReviews(reviews);
      setAnalysis(response);
    } catch (e) {
      console.error(e);
      setAnalysis("Sorry, I encountered an error analyzing the reviews.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Review Sentiment Analyzer
        </h2>
        <p className="text-slate-500 mb-6">
          Paste your customer reviews below to uncover sentiment, recurring complaints, and areas for improvement.
        </p>

        <div className="space-y-4">
          <textarea
            className="w-full p-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none min-h-[200px] text-slate-800 font-mono text-sm placeholder:font-sans"
            placeholder="Paste your reviews here (one per line or as a block of text)..."
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
          />
          <div className="flex justify-between items-center">
             <span className="text-xs text-slate-400">Gemini Pro Reasoning Enabled</span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !reviews.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Sentiment...
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4" /> Analyze Reviews
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
             <div className="p-2 bg-green-100 rounded-full text-green-600"><ThumbsUp className="w-5 h-5" /></div>
             <div className="p-2 bg-red-100 rounded-full text-red-600"><ThumbsDown className="w-5 h-5" /></div>
             <h3 className="text-xl font-bold text-slate-900">Sentiment Report</h3>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:text-purple-900 prose-strong:text-purple-800">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};