import React, { useState } from 'react';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import { generateStrategy } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const StrategyAdvisor: React.FC = () => {
  const [input, setInput] = useState('');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await generateStrategy(input);
      setStrategy(response);
    } catch (e) {
      console.error(e);
      setStrategy("Sorry, I encountered an error generating your strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          FBA Strategy Consultant
        </h2>
        <p className="text-slate-500 mb-6">
          Describe your current situation (e.g., "Sales dropped 20% this week" or "Launching a new garlic press").
          Gemini will think through the problem and provide a detailed plan.
        </p>

        <div className="space-y-4">
          <textarea
            className="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none min-h-[120px] text-slate-800"
            placeholder="Example: My ACOS is 45% on my main product, but I want to rank higher for keyword 'organic dog treats'. What should I do?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Generate Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {strategy && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Strategic Recommendations</h3>
          <div className="prose prose-slate max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600">
            <ReactMarkdown>{strategy}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
