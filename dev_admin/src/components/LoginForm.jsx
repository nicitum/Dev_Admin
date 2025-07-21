import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import { CircleUser, KeyRound, Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/logo.jpg';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(username, password);
      if (!response.token) {
        toast.error('Unexpected error. Please try again.');
        return;
      }
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('dev_user', JSON.stringify({ username }));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center">
        <img
          src={logo}
          alt="Order Appu Logo"
          className="w-20 h-20 object-contain rounded-full shadow bg-white mb-2"
        />
        {/* Developer SVG Icon for a professional look */}
        <div className="w-14 h-14 mb-2 flex items-center justify-center bg-white rounded-full shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" className="w-10 h-10">
            <circle cx="32" cy="32" r="32" fill="#174ea6"/>
            <path d="M32 36c-6.627 0-12-2.239-12-5v3c0 2.761 5.373 5 12 5s12-2.239 12-5v-3c0 2.761-5.373 5-12 5z" fill="#fff"/>
            <circle cx="32" cy="26" r="7" fill="#fff"/>
            <path d="M25 24c0-3.866 3.134-7 7-7s7 3.134 7 7" fill="#174ea6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-[#174ea6] tracking-wide text-center uppercase mb-2">ORDER APPU DEVELOPER PANEL</h1>
        <p className="text-gray-600 text-base mb-5 text-center">Welcome back! Please sign in to continue.</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <CircleUser className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#174ea6] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50 text-base"
                placeholder="Enter your username"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#174ea6] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50 text-base"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-[#174ea6] text-white font-bold text-base hover:bg-[#0f3576] transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-xs">
          © {new Date().getFullYear()} Order Appu Developer Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}