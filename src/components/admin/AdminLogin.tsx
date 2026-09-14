import React, { useState } from 'react';
import { RenalLogo } from '../common/RenalLogo.tsx';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../lib/apiFallback.ts';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: { name: string; email: string; role: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@renalmedicare.com');
  const [password, setPassword] = useState('Admin@RenalMedicare2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('rm_admin_token', data.token);
        localStorage.setItem('rm_admin_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Invalid credentials. Please verify email and password.');
      }
    } catch {
      setError('Network error during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-10 space-y-5 sm:space-y-6">
        
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <RenalLogo size="md" variant="stacked" />
          </div>
          <div className="pt-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#005BBD] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Portal
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Staff &amp; Doctor Sign In
            </h2>
            <p className="text-xs text-slate-500">
              Access the clinical dashboard to manage appointments, hospitals, and services.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@renalmedicare.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            id="admin-login-submit-btn"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
          <span className="font-bold block text-[11px] uppercase tracking-wider text-[#005BBD]">
            Default Admin Credentials
          </span>
          <p className="text-slate-600 font-mono text-[11px]">Email: <strong>admin@renalmedicare.com</strong></p>
          <p className="text-slate-600 font-mono text-[11px]">Pass: <strong>Admin@RenalMedicare2026</strong></p>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
