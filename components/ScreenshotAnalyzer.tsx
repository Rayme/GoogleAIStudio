import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { analyzeScreenshot } from '../services/geminiService';
import { ExtractedSalesData } from '../types';
import ReactMarkdown from 'react-markdown';

export const ScreenshotAnalyzer: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ data: ExtractedSalesData | null; advice: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null); // Reset previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    
    // Remove Data URL prefix for API
    const base64Data = imagePreview.split(',')[1];
    
    try {
      const analysis = await analyzeScreenshot(base64Data);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please ensure it is a clear screenshot.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
      {/* Upload Column */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-600" />
            Screenshot Analysis
          </h2>
          <p className="text-slate-500 mb-6">
            Upload a screenshot of your Amazon Seller Central dashboard or a product page. Gemini will extract data and suggest improvements.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              imagePreview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-md object-contain" />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CameraIcon />
                </div>
                <p className="font-medium text-slate-700">Click to upload screenshot</p>
                <p className="text-sm text-slate-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          {imagePreview && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Dashboard...
                </>
              ) : (
                'Analyze Screenshot'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Results Column */}
      <div className="space-y-6">
        {analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[400px]">
             <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
             <p>Gemini is reading your dashboard data...</p>
           </div>
        )}

        {!analyzing && result && (
          <div className="animate-fade-in space-y-6">
            {/* Extracted Metrics Cards */}
            {result.data && (
              <div className="grid grid-cols-2 gap-4">
                 <StatCard 
                   label="Total Sales" 
                   value={result.data.totalSales ? `$${result.data.totalSales.toLocaleString()}` : 'N/A'} 
                   icon={DollarSign} 
                   color="text-emerald-600"
                   bgColor="bg-emerald-50"
                 />
                 <StatCard 
                   label="Units Sold" 
                   value={result.data.unitsSold?.toString() || 'N/A'} 
                   icon={Package} 
                   color="text-blue-600"
                   bgColor="bg-blue-50"
                 />
                 <StatCard 
                   label="Conversion Rate" 
                   value={result.data.conversionRate ? `${result.data.conversionRate}%` : 'N/A'} 
                   icon={TrendingUp} 
                   color="text-purple-600"
                   bgColor="bg-purple-50"
                 />
                 <StatCard 
                   label="Issues Detected" 
                   value={result.data.issues?.length.toString() || '0'} 
                   icon={AlertTriangle} 
                   color="text-orange-600"
                   bgColor="bg-orange-50"
                 />
              </div>
            )}

            {/* AI Advice */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                Action Plan
              </h3>
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{result.advice}</ReactMarkdown>
              </div>
            </div>
            
            {/* Raw Issues List */}
            {result.data?.issues && result.data.issues.length > 0 && (
               <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                 <h4 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> Attention Needed
                 </h4>
                 <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                   {result.data.issues.map((issue, i) => (
                     <li key={i}>{issue}</li>
                   ))}
                 </ul>
               </div>
            )}
          </div>
        )}
        
        {!analyzing && !result && !imagePreview && (
          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 min-h-[400px]">
            <p>Upload an image to see analysis results</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
