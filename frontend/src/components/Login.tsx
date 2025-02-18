import React, { useState } from 'react';
import { Activity, Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    try {
        e.preventDefault();
        setLoading(true)
        const response = await axios.post("http://localhost:9000/api/v1/user/signin", {
            email,
            password
        })
        setLoading(false)
        localStorage.setItem('token', "Bearer " + response.data.token)
        alert("Login successful");
        navigate("/upload")
    } catch (error) {
        alert("Error while Logging in")
        console.log(error);
    } finally {
        setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity className="w-10 h-10 text-blue-400" />
          <span className="text-3xl font-bold text-white">AnomalyX</span>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
                {
                    loading ? 
                        <Loader2 className="w-5 h-5 animate-spin" />
                            :
                        <>
                            Sign In <LogIn className="w-5 h-5" />
                        </> 
                }
            </button>
          </form>
          
          <p className="mt-6 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}