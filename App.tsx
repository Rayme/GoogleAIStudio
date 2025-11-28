import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MarketResearch } from './components/MarketResearch';
import { ScreenshotAnalyzer } from './components/ScreenshotAnalyzer';
import { StrategyAdvisor } from './components/StrategyAdvisor';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { ReviewAnalysis } from './components/ReviewAnalysis';
import { AnalysisType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<AnalysisType>(AnalysisType.STRATEGY);

  const renderContent = () => {
    switch (activeTab) {
      case AnalysisType.MARKET_RESEARCH:
        return <MarketResearch />;
      case AnalysisType.SCREENSHOT:
        return <ScreenshotAnalyzer />;
      case AnalysisType.STRATEGY:
        return <StrategyAdvisor />;
      case AnalysisType.COMPETITORS:
        return <CompetitorAnalysis />;
      case AnalysisType.REVIEWS:
        return <ReviewAnalysis />;
      default:
        return <StrategyAdvisor />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === AnalysisType.STRATEGY && "Dashboard & Strategy"}
              {activeTab === AnalysisType.SCREENSHOT && "Visual Analysis"}
              {activeTab === AnalysisType.MARKET_RESEARCH && "Market Intelligence"}
              {activeTab === AnalysisType.COMPETITORS && "Competitor Intelligence"}
              {activeTab === AnalysisType.REVIEWS && "Customer Sentiment"}
            </h1>
            <p className="text-slate-500 mt-1">
              AI-Powered insights for your Amazon Business
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
             <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full">
               Gemini Active
             </span>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default App;