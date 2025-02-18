import React, { useState } from 'react';
import { Activity, Loader2, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
        e.preventDefault();
        setLoading(true)
        await axios.post("http://localhost:9000/api/v1/user/signup", {
            email,
            name,
            password
        })
        setLoading(false)
        alert("SignUp successful");
        navigate("/login")
    } catch (error) {
        alert("Error while Signing up")
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
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                minLength={3}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
            
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
                minLength={6}
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
                            Create Account <UserPlus className="w-5 h-5" />
                        </> 
                }
              
            </button>
          </form>
          
          <p className="mt-6 text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}