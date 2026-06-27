import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { BookOpen, User, PlusCircle, LogOut, LayoutDashboard, Globe, LogIn, UserPlus, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-brand-dark/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-brand-electric to-blue-600 rounded-lg text-white group-hover:scale-105 transition-transform duration-200">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                QBank
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm flex items-center gap-1">
              {t('nav.browse')}
            </Link>

            {user && (
              <>
                <Link to="/add-question" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm flex items-center gap-1">
                  <PlusCircle size={16} />
                  {t('nav.addQuestion')}
                </Link>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm flex items-center gap-1">
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-brand-accent hover:text-amber-400 transition-colors duration-200 font-semibold text-sm flex items-center gap-1">
                    {t('nav.admin')}
                  </Link>
                )}
              </>
            )}

            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              <Globe size={14} />
              {t('nav.toggleLang')}
            </button>

            {/* Authentication Action */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-brand-electric font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white max-w-[120px] truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-brand-danger hover:bg-red-500/10 rounded-lg cursor-pointer transition-all duration-200"
                  title={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1"
                >
                  <LogIn size={15} />
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-electric hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md shadow-brand-electric/25 flex items-center gap-1"
                >
                  <UserPlus size={15} />
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-xs cursor-pointer"
            >
              <Globe size={12} />
              {t('nav.toggleLang')}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-dark/95 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {t('nav.browse')}
            </Link>

            {user && (
              <>
                <Link
                  to="/add-question"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  {t('nav.addQuestion')}
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  {t('nav.dashboard')}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-brand-accent hover:bg-slate-800"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
              </>
            )}

            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-800 mt-2 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-brand-electric font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1 text-brand-danger bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-800 mt-2 space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full bg-brand-electric hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
