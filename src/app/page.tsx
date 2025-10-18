"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader, AlertTriangle, ShieldCheck, Link, ServerCrash, ShieldOff,
    Sun, Moon, BarChart3, ListCollapse, Timer, FileText,
    Zap, Lock, Code
} from 'lucide-react';

interface AnalysisResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: { url: string; status: number | null }[];
  suspiciousPatterns: { type: string; value: string; level: 'medium' | 'high' }[];
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }
      
      setResult(data);
      setRecentAnalyses(prev => [data, ...prev.filter(item => item.originalUrl !== data.originalUrl)].slice(0, 5));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getRiskStyles = (level: AnalysisResult['riskLevel']) => {
    switch (level) {
      case 'dangerous': return { bgColor: 'bg-red-100 dark:bg-red-900/30', borderColor: 'border-red-500/50', textColor: 'text-red-500', icon: <ShieldOff className="h-6 w-6" /> };
      case 'suspicious': return { bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', borderColor: 'border-yellow-500/50', textColor: 'text-yellow-500', icon: <AlertTriangle className="h-6 w-6" /> };
      default: return { bgColor: 'bg-green-100 dark:bg-green-900/30', borderColor: 'border-green-500/50', textColor: 'text-green-500', icon: <ShieldCheck className="h-6 w-6" /> };
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-800 dark:text-gray-200 p-4 sm:p-8 font-sans transition-colors duration-300">
      
      <header className="w-full max-w-3xl flex flex-col items-center text-center mb-10">
        <div className="flex justify-between items-center w-full mb-4">
          <div style={{ width: '40px' }}></div>
          <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-blue-500" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">DarkLink Finder</h1>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-800" />}
          </button>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Advanced forensic tool for detecting hidden redirections, dark web connections, and suspicious URL patterns.
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> Real-time Analysis</div>
          <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Threat Detection</div>
          <div className="flex items-center gap-2"><Code className="h-4 w-4" /> Open Source</div>
        </div>
      </header>

      <main className="w-full max-w-3xl">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <form onSubmit={handleSubmit} className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL to analyze (e.g., http://darkmarketabcd123.onion)" className="w-full pl-12 pr-32 py-4 text-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow shadow-sm" />
            <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300">
              {loading ? <Loader className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
              <span>Analyze</span>
            </button>
          </form>
        </motion.div>
        
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {error && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-500/50 rounded-lg"><ServerCrash /><p>{error}</p></motion.div>)}
            {result && (<motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
              <div className={`flex items-center gap-4 p-4 mb-6 rounded-lg border ${getRiskStyles(result.riskLevel).bgColor} ${getRiskStyles(result.riskLevel).borderColor}`}>
                {getRiskStyles(result.riskLevel).icon}
                <div>
                    <h2 className={`text-xl font-bold ${getRiskStyles(result.riskLevel).textColor}`}>{result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} URL Detected</h2>
                    <p className="text-gray-600 dark:text-gray-300">{{'safe': 'No suspicious patterns detected. This URL appears to be safe.','suspicious': 'Potentially suspicious patterns detected. Exercise caution.','dangerous': 'High-risk patterns detected. Do not proceed with this URL.'}[result.riskLevel]}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FINAL Corrected URL Analysis Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20} /> URL Analysis</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="font-bold">Original URL</label>
                            <input
                                type="text"
                                readOnly
                                value={result.originalUrl}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none text-gray-600 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="font-bold">Final Destination</label>
                            <input
                                type="text"
                                readOnly
                                value={result.finalUrl}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none text-gray-600 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="font-bold">Total Redirects</label>
                            <p className="font-mono text-lg text-gray-800 dark:text-gray-200">{result.redirectChain.length > 1 ? result.redirectChain.length - 1 : 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ListCollapse size={20} /> Suspicious Patterns ({result.suspiciousPatterns.length})</h3>{result.suspiciousPatterns.length > 0 ? (<div className="space-y-2">{result.suspiciousPatterns.map((p, i) => (<div key={i} className="flex justify-between items-center text-sm"><p>{p.type}: <span className="font-mono text-gray-600 dark:text-gray-400">{p.value}</span></p><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.level === 'high' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'}`}>{p.level}</span></div>))}</div>) : <p className="text-sm text-gray-500">No suspicious patterns found.</p>}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 mt-6"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 size={20} /> Redirection Chain ({result.redirectChain.length} steps)</h3><div className="space-y-4">{result.redirectChain.map((step, index) => (<div key={index} className="flex items-center gap-4 text-sm"><div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">{index}</div><div className="flex-grow break-all text-gray-700 dark:text-gray-300">{step.url}</div>{step.status && <span className={`font-mono text-xs px-2 py-1 rounded-full ${step.status >= 400 ? 'bg-red-100 dark:bg-red-900 text-red-700' : step.status >= 300 ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'bg-green-100 dark:bg-green-900 text-green-700'}`}>HTTP {step.status}</span>}{index === result.redirectChain.length - 1 && <span className="text-xs font-bold text-green-500">✓ Final Destination</span>}</div>))}</div></div>
            </motion.div>)}
          </AnimatePresence>
        </div>
        {recentAnalyses.length > 0 && (<div className="w-full max-w-3xl mt-12"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Timer size={20} /> Recent Analyses</h3><div className="space-y-3">{recentAnalyses.map((item) => {const styles = getRiskStyles(item.riskLevel);return (<motion.div key={item.originalUrl} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className={`flex items-center justify-between p-3 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}><div className="flex items-center gap-3"><span className={styles.textColor}>{styles.icon}</span><span className="text-sm break-all">{item.originalUrl}</span></div><span className={`text-xs font-bold ${styles.textColor}`}>{item.riskLevel.toUpperCase()}</span></motion.div>);})}</div></div>)}
      </main>
      
      <footer className="text-center mt-12 text-sm text-gray-500"><p>DarkLink Finder is a forensic investigation tool for educational and security research purposes.</p><p>Always verify suspicious URLs through additional security measures before taking action.</p></footer>
    </div>
  );
}