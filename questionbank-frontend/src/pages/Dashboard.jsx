import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { getQuestions, deleteQuestion } from '../api/questions';
import QuestionCard from '../components/questions/QuestionCard';
import { Link } from 'react-router-dom';
import { PlusCircle, HelpCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserQuestions = () => {
    if (!user) return;
    setLoading(true);
    getQuestions({ my_questions: 1 })
      .then((res) => {
        setQuestions(res.data || []);
      })
      .catch((err) => console.error('Error loading my questions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserQuestions();
  }, [user]);

  const handleQuestionDelete = async (id) => {
    try {
      await deleteQuestion(id);
      fetchUserQuestions();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          {t('dashboard.welcome', { name: user?.name })}
        </h1>
        <p className="text-slate-400 max-w-xl">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
            {t('dashboard.quickActions')}
          </h2>
          <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 space-y-3">
            <Link
              to="/add-question"
              className="flex items-center gap-2 w-full text-left px-4 py-2.5 bg-brand-electric hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <PlusCircle size={16} />
              Add Question
            </Link>
          </div>
        </div>

        {/* Right column: My Submissions */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
            {t('dashboard.mySubmissions')} ({questions.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-brand-navy/10 border border-slate-850 rounded-2xl">
              <Loader2 size={32} className="text-brand-electric animate-spin mb-4" />
              <p className="text-sm text-slate-500">Loading your submissions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-brand-navy/15 border border-slate-800 rounded-2xl p-12 text-center">
              <HelpCircle size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-4">You haven't contributed any questions yet.</p>
              <Link
                to="/add-question"
                className="inline-flex items-center gap-1.5 text-brand-electric hover:underline text-sm font-bold"
              >
                Submit your first question
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  currentUserId={user?.id}
                  isAdmin={user?.role === 'admin'}
                  onDelete={handleQuestionDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
