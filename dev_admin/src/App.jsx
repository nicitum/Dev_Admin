import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Clients from './components/Clients';
import DatabaseManagement from './components/DatabaseManagement';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import logo from './assets/logo.jpg';
import { logout } from './services/api';

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validatePassword(pw) {
    if (pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/.test(pw)) return 'Password must contain a lowercase letter.';
    if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must contain a symbol.';
    return '';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully. Please log in again.');
        localStorage.clear();
        navigate('/');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
        <div className="text-xs text-gray-500 mt-2">
          Password must be at least 8 characters, contain 1 symbol, 1 lowercase, and 1 uppercase letter.
        </div>
      </form>
    </div>
  );
}

function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="sidebar h-screen w-64 text-white bg-gradient-to-b from-[#003366] to-[#005599] shadow-xl flex-shrink-0 rounded-tr-2xl rounded-br-2xl">
      <div className="p-6 text-center">
        <img 
          src={logo}
          alt="Order Appu Admin Panel Logo" 
          className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer hover:scale-105 transition-transform duration-200 bg-transparent"
        />
      </div>
      <nav className="mt-4 space-y-2 px-4 flex-1">
        <Link to="/dashboard" className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-100 hover:bg-[#004080] font-semibold text-lg">
          Home
        </Link>
        <Link to="/dashboard/clients" className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-100 hover:bg-[#004080] font-semibold text-lg">
          Clients
        </Link>
        <Link to="/dashboard/database-management" className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-100 hover:bg-[#004080] font-semibold text-lg">
          Database Management
        </Link>
        <div>
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="flex items-center w-full px-4 py-2 rounded-lg transition-colors text-gray-100 hover:bg-[#004080] font-semibold text-lg focus:outline-none"
          >
            <span className="mr-2">⚙️</span> Settings
            <span className="ml-auto">{settingsOpen ? '▲' : '▼'}</span>
          </button>
          {settingsOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <Link to="/dashboard/change-password" className="block px-4 py-2 rounded hover:bg-[#004080] text-gray-100">Change Password</Link>
              <LogoutButton className="block w-full px-4 py-2 mt-2 rounded hover:bg-[#004080] text-gray-100 text-left" />
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

function LogoutButton({ className = "" }) {
  const navigate = useNavigate();
  return (
    <button
      className={`px-4 py-2 rounded transition ${className}`}
      onClick={async () => {
        const user = JSON.parse(localStorage.getItem('dev_user'));
        if (!user?.username) {
          localStorage.clear();
          navigate('/');
          return;
        }
        try {
          await logout(user.username);
          toast.success('Logged out successfully');
          localStorage.clear();
          navigate('/');
        } catch (err) {
          toast.error('Logout failed');
          // Still clear local storage and navigate even if server logout fails
          localStorage.clear();
          navigate('/');
        }
      }}
    >
      Logout
    </button>
  );
}

function DashboardHome() {
  return (
    <div className="p-8 relative">
      <LogoutButton className="absolute top-4 right-4 px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#004080] transition" />
      <h1 className="text-2xl font-bold mb-4">Dashboard Home</h1>
      <p className="text-gray-600">Welcome to the dashboard!</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/database-management" element={<DatabaseManagement />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter basename="/dev_admin">
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard/*" element={<RequireAuth><Dashboard /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
