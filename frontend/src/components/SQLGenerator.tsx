import React, { useState } from 'react';
import { Activity, Database, ArrowRight, History, Copy, Check, MessageSquare } from 'lucide-react';
import Appbar from './Appbar';

function Query() {
  const [query, setQuery] = useState('');
  const [sqlResult, setSqlResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [queryHistory, setQueryHistory] = useState<Array<{ natural: string; sql: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    // Simulated API call - replace with actual backend call
    setTimeout(() => {
      const result = `SELECT * FROM network_traffic 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND anomaly_score > 0.8
ORDER BY anomaly_score DESC
LIMIT 100;`;

      setSqlResult(result);
      setQueryHistory(prev => [...prev, { natural: query, sql: result }]);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sqlResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <Appbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">
            Natural Language to SQL Query
          </h1>
          <p className="text-xl text-slate-300 text-center mb-12">
            Describe your data needs in plain English, and we'll generate the appropriate SQL query.
          </p>

          {/* Query Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-blue-400 mt-3" />
                <div className="flex-1">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: Show me all network traffic with high anomaly scores from the last hour"
                    className="w-full h-32 bg-slate-900 text-slate-200 rounded-lg p-4 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className={`mt-4 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${isLoading || !query.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate SQL
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* SQL Result */}
          {sqlResult && (
            <div className="bg-slate-800 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Generated SQL Query</h2>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-slate-300">{sqlResult}</code>
              </pre>
            </div>
          )}

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Recent Queries</h2>
              </div>
              <div className="space-y-4">
                {queryHistory.slice().reverse().map((item, index) => (
                  <div key={index} className="border-b border-slate-700 last:border-0 pb-4 last:pb-0">
                    <p className="text-slate-300 mb-2">{item.natural}</p>
                    <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto">
                      <code className="text-sm text-slate-400">{item.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© {new Date().getFullYear()} AnomalyX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Query;
