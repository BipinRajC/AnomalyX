
import { Activity, Shield, Zap, Database, Network, LineChart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Appbar from './Appbar';

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Appbar />
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-12 h-12 text-blue-400" />
            <span className="text-4xl font-bold text-white">AnomalyX</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-3xl">
            Next-Generation Network Anomaly Detection
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl">
            Ensure network resilience through adaptive threat detection strategies with real-time monitoring and intelligent analysis.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors" onClick={() => navigate("/upload")}>
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="bg-slate-800 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-16">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-700 p-6 rounded-lg">
              <Network className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Network Topology</h3>
              <p className="text-slate-300">Advanced SDN topology simulation for comprehensive network monitoring and analysis.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg">
              <Database className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Time-Series Storage</h3>
              <p className="text-slate-300">Efficient storage and management of packet data and model results for real-time analysis.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg">
              <LineChart className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Anomaly Detection</h3>
              <p className="text-slate-300">Real-time threat detection and analysis using advanced algorithms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-900 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Shield className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Enhanced Security</h3>
                <p className="text-slate-300">Proactive threat detection and response mechanisms to protect your network infrastructure.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Processing</h3>
                <p className="text-slate-300">Near real-time anomaly detection and analysis for immediate threat response.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-6 h-6" />
            <span className="text-xl font-semibold">AnomalyX</span>
          </div>
          <p>© {new Date().getFullYear()} AnomalyX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
