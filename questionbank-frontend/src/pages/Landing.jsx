import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuestions } from '../api/questions';
import { BookOpen, Award, GraduationCap, ChevronRight, Users, Eye, HelpCircle } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const [totalQuestions, setTotalQuestions] = useState(24); // fallback mock

  useEffect(() => {
    // Quick load total count from API if running
    getQuestions({ per_page: 1 })
      .then((res) => {
        if (res?.total) {
          setTotalQuestions(res.total);
        }
      })
      .catch((err) => console.log('API offline or loading:', err));
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-between">
      {/* Background blobs for premium appearance */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-electric/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            {t('landing.title')}
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          {t('landing.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link
            to="/browse"
            className="w-full sm:w-auto bg-brand-electric hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-electric/20 hover:scale-102 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t('landing.ctaBrowse')}
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/add-question"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-700 hover:scale-102 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t('landing.ctaAdd')}
          </Link>
        </div>

        {/* Dynamic Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
          <div className="bg-brand-navy/55 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{totalQuestions}+</p>
            <p className="text-sm text-slate-400 font-medium">{t('landing.totalQuestions')}</p>
          </div>
          <div className="bg-brand-navy/55 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-2">4</p>
            <p className="text-sm text-slate-400 font-medium">{t('landing.categories')}</p>
          </div>
          <div className="bg-brand-navy/55 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-2">15+</p>
            <p className="text-sm text-slate-400 font-medium">{t('landing.contributors')}</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="border-t border-slate-900 pt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">
            {t('landing.features.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Interview Card */}
            <div className="bg-gradient-to-b from-brand-navy to-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-brand-electric mb-6">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('landing.features.interview')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('landing.features.interviewDesc')}
              </p>
            </div>

            {/* Academics Card */}
            <div className="bg-gradient-to-b from-brand-navy to-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-brand-success mb-6">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('landing.features.academics')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('landing.features.academicsDesc')}
              </p>
            </div>

            {/* Competitive Exams Card */}
            <div className="bg-gradient-to-b from-brand-navy to-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-brand-accent mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('landing.features.competitive')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('landing.features.competitiveDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
