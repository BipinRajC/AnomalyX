import React, { useState } from 'react';
import { Upload, Wifi, ArrowRight, FileSpreadsheet, Activity as PulseIcon, Loader2 } from 'lucide-react';
import Appbar from './Appbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { DFAtom, FileNameAtom } from '../atoms';

function UploadComponent() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setDf = useSetRecoilState(DFAtom);
  const setFileName = useSetRecoilState(FileNameAtom);

  async function isAuthenticated() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in.");
      navigate("/login");
      return false; 
    }
  
    try {
      const res = await axios.post(
        "http://localhost:9000/api/v1/user/authenticate",
        {},
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      console.log(res);
      if (!res.data.LoggedIn) {
        alert("You are not logged in");
        navigate("/login");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Authentication failed. Please try again.");
      return false; 
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv") {
        setSelectedFile(file);
        setFileName(file.name)
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    try {
      const isAuthenticatedResult = await isAuthenticated();
    if (!isAuthenticatedResult) return
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile!);
  
      const response = await axios.post("http://127.0.0.1:5000/load_dataset", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setDf(response.data.columns)
      alert(response.data.message)
      navigate("/analysis")
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load dataset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <Appbar />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          Choose Analysis Method
        </h1>
        <p className="text-xl text-slate-300 text-center mb-16 max-w-2xl mx-auto">
          Select your preferred method of network analysis: upload historical data via CSV or monitor network activity in real-time.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* CSV Upload Option */}
          <div className="bg-slate-800 rounded-xl p-8 border-2 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <FileSpreadsheet className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">CSV Analysis</h2>
            </div>

            <p className="text-slate-300 mb-6">
              Upload historical network data in CSV format for comprehensive analysis and anomaly detection.
            </p>

            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400'}
                ${selectedFile ? 'bg-green-500/10 border-green-500' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              {selectedFile ? (
                <>
                  <p className="text-green-400 font-medium mb-2">File selected:</p>
                  <p className="text-slate-300">{selectedFile.name}</p>
                </>
              ) : (
                <>
                  <p className="text-slate-300 mb-2">Drag and drop your CSV file here</p>
                  <p className="text-slate-400">or</p>
                  <label className="block mt-2">
                    <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block transition-colors">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileInput}
                    />
                  </label>
                </>
              )}
            </div>

            <button
              className={`w-full py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors
                ${selectedFile
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
              disabled={!selectedFile}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
               <>Start Analysis <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>

          {/* Real-time Analysis Option */}
          <div className="bg-slate-800 rounded-xl p-8 border-2 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <Wifi className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Real-Time Monitoring</h2>
            </div>

            <p className="text-slate-300 mb-6">
              Monitor your network traffic in real-time with instant anomaly detection and alerts.
            </p>

            <div className="border-2 border-slate-600 rounded-lg p-8 mb-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <PulseIcon className="w-full h-full text-blue-400 animate-pulse" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-slate-300 mb-2">Ready to start monitoring</p>
              <p className="text-slate-400">Secure real-time analysis</p>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors" onClick={() => window.open("http://localhost:5601", "_blank")}> 
              Begin Monitoring
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© {new Date().getFullYear()} AnomalyX. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
}

export default UploadComponent;
