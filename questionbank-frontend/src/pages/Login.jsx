import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-brand-electric/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md bg-brand-navy/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-sm text-slate-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Errors display */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-start gap-2 text-brand-danger text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{validationError || error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-electric transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-electric transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-electric hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-brand-electric/15 hover:scale-102 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} />
                {t('auth.loginBtn')}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="text-brand-electric hover:underline font-semibold">
            {t('auth.registerBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
