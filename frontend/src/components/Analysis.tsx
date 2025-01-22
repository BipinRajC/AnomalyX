import { Activity, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Brain, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Appbar from './Appbar';

function Analysis() {
  // Sample data - replace with actual data from backend
  const timeSeriesData = [
    { timestamp: '00:00', anomalyScore: 0.2, packetCount: 150 },
    { timestamp: '01:00', anomalyScore: 0.8, packetCount: 320 },
    { timestamp: '02:00', anomalyScore: 0.4, packetCount: 230 },
    { timestamp: '03:00', anomalyScore: 0.9, packetCount: 450 },
    { timestamp: '04:00', anomalyScore: 0.3, packetCount: 180 },
    { timestamp: '05:00', anomalyScore: 0.6, packetCount: 280 },
  ];

  const protocolDistribution = [
    { name: 'TCP', value: 65 },
    { name: 'UDP', value: 25 },
    { name: 'ICMP', value: 10 },
  ];

  const anomalyTypes = [
    { type: 'DDoS Attack', count: 45 },
    { type: 'Port Scan', count: 30 },
    { type: 'Data Exfiltration', count: 15 },
    { type: 'Malware Traffic', count: 10 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const insights = [
    {
      title: 'High Risk Detection',
      description: 'Detected potential DDoS attack patterns between 01:00 and 03:00 with anomaly scores exceeding 0.8',
      icon: AlertTriangle,
      color: 'text-red-400',
    },
    {
      title: 'Traffic Pattern Analysis',
      description: 'TCP traffic dominates the network (65%), suggesting heavy reliance on connection-oriented protocols',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      title: 'AI Recommendation',
      description: 'Consider implementing rate limiting on affected endpoints to mitigate potential DDoS attacks',
      icon: Brain,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <Appbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Network Traffic Analysis</h1>
          <p className="text-slate-300">Comprehensive analysis of network traffic patterns and anomalies</p>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <insight.icon className={`w-8 h-8 ${insight.color}`} />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                  <p className="text-slate-300 text-sm">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Anomaly Score Timeline */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <LineChartIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Anomaly Score Timeline</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="anomalyScore" stroke="#3B82F6" name="Anomaly Score" />
                  <Line type="monotone" dataKey="packetCount" stroke="#10B981" name="Packet Count" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protocol Distribution */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Protocol Distribution</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {protocolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly Types */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Anomaly Types Distribution</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyTypes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Analysis Report
          </button>
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

export default Analysis;
