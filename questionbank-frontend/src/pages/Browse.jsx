import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestions, deleteQuestion } from '../api/questions';
import { useAuthStore } from '../store/authStore';
import FilterSidebar from '../components/filters/FilterSidebar';
import SearchBar from '../components/filters/SearchBar';
import QuestionCard from '../components/questions/QuestionCard';
import { HelpCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function Browse() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category_id: '',
    subcategory_id: '',
    difficulty: '',
    type: '',
    language: '',
    search: '',
  });

  const fetchQuestionsList = () => {
    setLoading(true);
    getQuestions({
      page,
      ...filters
    })
      .then((res) => {
        setQuestions(res.data);
        setPagination({
          current_page: res.current_page,
          last_page: res.last_page,
          total: res.total
        });
      })
      .catch((err) => console.error('Error fetching questions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestionsList();
  }, [page, filters]);

  // Reset page when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchChange = (searchQuery) => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
    setPage(1);
  };

  const handleQuestionDelete = async (id) => {
    try {
      await deleteQuestion(id);
      fetchQuestionsList(); // Reload list after delete
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        {/* Right Side: Questions listing */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <SearchBar 
            value={filters.search} 
            onSearchChange={handleSearchChange} 
          />

          {/* Loading spinner */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={36} className="text-brand-electric animate-spin mb-4" />
              <p className="text-sm text-slate-500 font-medium">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-brand-navy/20 border border-slate-800 rounded-2xl p-12 text-center">
              <HelpCircle size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-base text-slate-400 font-semibold">{t('questions.noQuestions')}</p>
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

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-slate-800 bg-brand-navy/30 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-slate-400 font-medium">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <button
                    disabled={page >= pagination.last_page}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-slate-800 bg-brand-navy/30 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
