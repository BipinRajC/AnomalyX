import { useState } from 'react';
import Appbar from './Appbar';
import { Loader2 } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { DFAtom, FileNameAtom } from '../atoms';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Anomaly {
  anomaly: boolean;
  ds: string;
  y: number;
}

interface Plots {
  hourlyAnomalies: string;
  anomalyIntensity: string;
  timeSeries: string;
}

function Analysis() {
  const df = useRecoilValue(DFAtom)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const fileName = useRecoilValue(FileNameAtom)
  const [isPreprocessed, setIsPreprocessed] = useState(false);
  const [isDetectedAnomalies, SetIsDetectedAnomalies] = useState(false);
  const [plots, setPlots] = useState<Plots | null>(null);
  const [isPlotting, setIsPlotting] = useState(false);

  if (!df) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center text-center bg-gray-100">
        <p className="text-lg font-medium text-gray-700">Please upload a dataset</p>
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition" onClick={() => navigate("/upload")}>
          Go Back
        </button>
      </div>
    );
  }

  const handlePreprocess = async () => {
    try {
      setIsLoading(true);
      setIsPreprocessed(false);
      setMessage('');
      await axios.post("http://127.0.0.1:5000/preprocess_data", {
        "file_path": `uploads/${fileName}`,
        "timestamp_col": "Stime",
        "value_col": "Dload"
      });
      setIsLoading(false);
      setIsPreprocessed(true);
      setMessage('Data processed successfully');
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to preprocess data");
    } finally {
      setIsLoading(false);
      setIsPreprocessed(true);
    }
  };

  const handleDetectAnomalies = async () => {
    try {
      setIsDetecting(true);
      SetIsDetectedAnomalies(false);
      const response = await axios.post("http://127.0.0.1:5000/detect_anomalies", {
        "file_path": `uploads/${fileName}`,
        "level": 85
      })
      
      setAnomalies(response.data.anomalies)
      setIsDetecting(false);
      SetIsDetectedAnomalies(true)
    } catch (error) {
      console.error("Error:", error);
      alert("Error while detecting anomalies");
    } finally {
      setIsDetecting(false);
      SetIsDetectedAnomalies(true)
    }
  };

  const handlePlotAnomalies = async () => {
    try {
      setIsPlotting(true);

      const response1 = await axios.post("http://127.0.0.1:5000/advanced_anomaly_analysis", {
        "file_path": `uploads/${fileName}`,
        "level": 85
      }, { responseType: "blob" });
  
      const url1 = URL.createObjectURL(response1.data);
      const response2 = await axios.get("http://127.0.0.1:5000/download_anomaly_intensity_plot", {
        responseType: "blob"
      });
  
      const url2 = URL.createObjectURL(response2.data);
      const response3 = await axios.post("http://127.0.0.1:5000/plot_anomalies", {
        "file_path": `uploads/${fileName}`,
        "level": 85
      }, { responseType: "blob" });
  
      const url3 = URL.createObjectURL(response3.data);
  
      setPlots({
        hourlyAnomalies: url1,
        anomalyIntensity: url2,
        timeSeries: url3
      });
  
    } catch (error) {
      console.error("Error fetching anomaly plots:", error);
    } finally {
      setIsPlotting(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      <Appbar />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h2 className="text-slate-200 text-lg font-semibold mb-3">Dataset Columns</h2>
          <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
            <div className="inline-flex gap-2">
              {df.map((column, index) => (
                <span
                  key={column}
                  className="inline-block px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                >
                  {column}{index < df.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePreprocess}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 disabled:cursor-not-allowed
                     text-white font-semibold px-6 py-3 rounded-lg 
                     transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Preprocess Data'
            )}
          </button>

          {message && (
            <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg">
              {message}
            </div>
          )}
          <button
            onClick={handleDetectAnomalies}
            disabled={isDetecting || !isPreprocessed}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400/40 disabled:cursor-not-allowed
                       text-white disabled:text-white/60 font-semibold px-6 py-3 rounded-lg 
                       transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Detecting...
              </>
            ) : (
              'Detect Anomalies'
            )}
          </button>

          {anomalies.length > 0 && (
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Slno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {anomalies.map((anomaly, index) => (
                      <tr key={index} className="hover:bg-slate-700/50">
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-300'>
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {new Date(anomaly.ds).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {anomaly.y.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-400">
                            Anomaly Detected
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handlePlotAnomalies  }
            disabled={isPlotting || !isPreprocessed || !isDetectedAnomalies}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400/40 disabled:cursor-not-allowed
                       text-white disabled:text-white/60 font-semibold px-6 py-3 rounded-lg 
                       transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isPlotting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Plotting...
              </>
            ) : (
              'Plot Graphs'
            )}
          </button>
          {plots && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-slate-200 text-lg font-semibold mb-4">
                Anomaly Analysis Plots
              </h2>
              <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <h3 className="text-slate-300 font-medium">Hourly Analysis</h3>
                  <div className="w-full bg-slate-700 rounded-lg overflow-hidden">
                    <img
                      src={plots.hourlyAnomalies}
                      alt="Time Series Analysis"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-slate-300 font-medium">Distribution Analysis</h3>
                  <div className="w-full bg-slate-700 rounded-lg overflow-hidden">
                    <img
                      src={plots.anomalyIntensity}
                      alt="Distribution Analysis"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-slate-300 font-medium">Time Series Analysis</h3>
                  <div className="w-full bg-slate-700 rounded-lg overflow-hidden">
                    <img
                      src={plots.timeSeries}
                      alt="Correlation Analysis"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>        
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© {new Date().getFullYear()} AnomalyX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Analysis;