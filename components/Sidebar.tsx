import React from 'react';
import { LayoutDashboard, TrendingUp, Search, Camera, Settings, Users, MessageSquare } from 'lucide-react';
import { AnalysisType } from '../types';

interface SidebarProps {
  activeTab: AnalysisType;
  setActiveTab: (tab: AnalysisType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: AnalysisType.STRATEGY, label: 'Strategy Advisor', icon: LayoutDashboard },
    { id: AnalysisType.SCREENSHOT, label: 'Dashboard Analyzer', icon: Camera },
    { id: AnalysisType.MARKET_RESEARCH, label: 'Market Research', icon: Search },
    { id: AnalysisType.COMPETITORS, label: 'Competitor Intel', icon: Users },
    { id: AnalysisType.REVIEWS, label: 'Review Insights', icon: MessageSquare },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
        <TrendingUp className="w-8 h-8 text-orange-500" />
        <span className="text-xl font-bold hidden md:block">AmzGenius</span>
      </div>

      <nav className="flex-1 py-6 px-2 md:px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6 min-w-[24px]" />
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-6 h-6 min-w-[24px]" />
          <span className="hidden md:block font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};