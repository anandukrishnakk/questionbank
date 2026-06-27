import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminStats, getAdminUsers, updateAdminUserRole, approveAdminQuestion, rejectAdminQuestion, downloadPdfExport, fetchOnlineQuestions } from '../../api/admin';
import { getQuestions, deleteQuestion } from '../../api/questions';
import { getCategories } from '../../api/categories';
import QuestionCard from '../../components/questions/QuestionCard';
import { LayoutDashboard, ShieldAlert, Users, FileText, CheckCircle, XCircle, Trash2, Download, Loader2, CloudDownload } from 'lucide-react';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending'); // pending, users, export
  
  // Data states
  const [stats, setStats] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Action loading states
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchSource, setFetchSource] = useState('local'); // local, opentdb, openai
  const [fetchTopic, setFetchTopic] = useState('general');
  const [fetchCategoryId, setFetchCategoryId] = useState('');
  const [fetchSubcategoryId, setFetchSubcategoryId] = useState('');
  const [fetchSubcategories, setFetchSubcategories] = useState([]);


  const handleFetchCategoryChange = (catId) => {
    setFetchCategoryId(catId);
    setFetchSubcategoryId('');
    
    const selectedCat = categories.find(c => c.id === parseInt(catId));
    if (selectedCat && selectedCat.subcategories) {
      setFetchSubcategories(selectedCat.subcategories);
    } else {
      setFetchSubcategories([]);
    }
  };

  const handleFetchOnline = async (e) => {
    if (e) e.preventDefault();
    if ((fetchSource === 'openai' || fetchSource === 'gemini') && !fetchTopic.trim()) {
      alert(`Please enter a custom topic for ${fetchSource === 'openai' ? 'OpenAI' : 'Gemini'} fetching.`);
      return;
    }
    setFetchLoading(true);
    try {
      const res = await fetchOnlineQuestions({
        source: fetchSource,
        topic: fetchSource === 'opentdb' ? 'computer-science' : fetchTopic,
        category_id: fetchCategoryId || undefined,
        subcategory_id: fetchSubcategoryId || undefined,
      });
      alert(res.message || `${res.imported_count} questions imported successfully!`);
      loadStats();
      if (activeTab === 'pending') {
        loadPendingQuestions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch online questions.');
    } finally {
      setFetchLoading(false);
    }
  };

  // PDF Export Filters
  const [exportFilters, setExportFilters] = useState({
    category_id: '',
    difficulty: '',
    language: '',
  });

  const loadStats = () => {
    getAdminStats()
      .then(setStats)
      .catch((err) => console.error('Error loading admin stats:', err));
  };

  const loadPendingQuestions = () => {
    setLoading(true);
    getQuestions({ status: 'pending' })
      .then((res) => {
        setPendingQuestions(res.data || []);
      })
      .catch((err) => console.error('Error loading pending queue:', err))
      .finally(() => setLoading(false));
  };

  const loadUsersList = () => {
    getAdminUsers()
      .then(setUsers)
      .catch((err) => console.error('Error loading users:', err));
  };

  const loadCategoriesList = () => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Error loading categories:', err));
  };

  useEffect(() => {
    loadStats();
    loadCategoriesList();
    if (activeTab === 'pending') loadPendingQuestions();
    if (activeTab === 'users') loadUsersList();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await approveAdminQuestion(id);
      loadPendingQuestions();
      loadStats();
    } catch (err) {
      alert('Failed to approve question');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdminQuestion(id);
      loadPendingQuestions();
      loadStats();
    } catch (err) {
      alert('Failed to reject question');
    }
  };

  const handleQuestionDelete = async (id) => {
    try {
      await deleteQuestion(id);
      loadPendingQuestions();
      loadStats();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateAdminUserRole(userId, newRole);
      loadUsersList();
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleExportPdf = async (e) => {
    e.preventDefault();
    setExportLoading(true);
    try {
      const blob = await downloadPdfExport(exportFilters);
      
      // Create local file URL and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `questionbank-export-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert(err.response?.data?.message || 'No approved questions found matching these filters to export.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{t('admin.dashboard')}</h1>
          <p className="text-slate-400 text-sm">System statistics, user moderation, pending queue, and PDF downloads.</p>
        </div>
      </div>

      {/* Stats Board */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-brand-electric">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.approved_questions}</p>
              <p className="text-xs text-slate-400 font-medium">{t('admin.approvedQuestions')}</p>
            </div>
          </div>

          <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-brand-accent">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.pending_questions}</p>
              <p className="text-xs text-slate-400 font-medium">{t('admin.pendingQuestions')}</p>
            </div>
          </div>

          <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-brand-success">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.total_users}</p>
              <p className="text-xs text-slate-400 font-medium">{t('admin.totalUsers')}</p>
            </div>
          </div>

          <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.total_categories}</p>
              <p className="text-xs text-slate-400 font-medium">{t('landing.categories')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/15'
                : 'text-slate-400 hover:text-white hover:bg-brand-navy/30'
            }`}
          >
            <ShieldAlert size={18} />
            {t('admin.questions')}
            {stats?.pending_questions > 0 && (
              <span className="ml-auto bg-brand-accent/20 text-brand-accent text-xs px-2 py-0.5 rounded-full font-bold">
                {stats.pending_questions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/15'
                : 'text-slate-400 hover:text-white hover:bg-brand-navy/30'
            }`}
          >
            <Users size={18} />
            {t('admin.users')}
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/15'
                : 'text-slate-400 hover:text-white hover:bg-brand-navy/30'
            }`}
          >
            <FileText size={18} />
            {t('admin.export')}
          </button>

          <button
            onClick={() => setActiveTab('fetch')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'fetch'
                ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/15'
                : 'text-slate-400 hover:text-white hover:bg-brand-navy/30'
            }`}
          >
            <CloudDownload size={18} />
            Fetch Questions
          </button>
        </div>

        {/* Workspace Panels */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: PENDING QUEUE */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-1">
                {t('admin.pendingQueue')}
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-brand-navy/10 border border-slate-800 rounded-2xl">
                  <Loader2 size={32} className="text-brand-electric animate-spin mb-3" />
                  <p className="text-sm text-slate-500">Loading pending questions...</p>
                </div>
              ) : pendingQuestions.length === 0 ? (
                <div className="bg-brand-navy/10 border border-slate-850 rounded-2xl p-12 text-center">
                  <CheckCircle size={40} className="text-brand-success mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">All caught up! No pending questions to verify.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  {pendingQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      currentUserId={0} // No edit check here
                      isAdmin={true}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={handleQuestionDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-1">
                Registered Users List
              </h2>

              <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/40">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('admin.role')}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Language</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-transparent text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand-electric">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{u.name}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-brand-dark border border-slate-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-electric cursor-pointer capitalize"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 uppercase font-semibold">
                            {u.preferred_lang}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PDF EXPORT TOOL */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-1">
                {t('admin.exportTitle')}
              </h2>

              <div className="bg-brand-navy/30 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl space-y-6">
                <p className="text-slate-400 text-sm">
                  {t('admin.exportSubtitle')}
                </p>

                <form onSubmit={handleExportPdf} className="space-y-6 max-w-xl">
                  {/* Category select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Filter</label>
                    <select
                      value={exportFilters.category_id}
                      onChange={(e) => setExportFilters({ ...exportFilters, category_id: e.target.value })}
                      className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Config row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty Filter</label>
                      <select
                        value={exportFilters.difficulty}
                        onChange={(e) => setExportFilters({ ...exportFilters, difficulty: e.target.value })}
                        className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                      >
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language Filter</label>
                      <select
                        value={exportFilters.language}
                        onChange={(e) => setExportFilters({ ...exportFilters, language: e.target.value })}
                        className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                      >
                        <option value="">All Languages</option>
                        <option value="en">English</option>
                        <option value="ml">Malayalam (മലയാളം)</option>
                      </select>
                    </div>
                  </div>

                  {/* Export Trigger */}
                  <button
                    type="submit"
                    disabled={exportLoading}
                    className="flex items-center gap-2 bg-brand-electric hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-brand-electric/15 hover:scale-102 transition-all duration-200 cursor-pointer"
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Document...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        {t('admin.exportBtn')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: FETCH ONLINE QUESTIONS */}
          {activeTab === 'fetch' && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-1">
                Fetch Online Questions
              </h2>

              <div className="bg-brand-navy/30 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl space-y-6">
                <p className="text-slate-400 text-sm">
                  Automatically import programming or general computer science questions from online repositories and specialized question seeds directly into your target Question Bank.
                </p>

                 <form onSubmit={handleFetchOnline} className="space-y-6 max-w-xl">
                  {/* Source Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Question Source</label>
                    <select
                      value={fetchSource}
                      onChange={(e) => {
                        const newSource = e.target.value;
                        setFetchSource(newSource);
                        if (newSource === 'local') {
                          setFetchTopic('general');
                        } else if (newSource === 'openai' || newSource === 'gemini') {
                          setFetchTopic('');
                        } else {
                          setFetchTopic('opentdb');
                        }
                      }}
                      className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                      disabled={fetchLoading}
                    >
                      <option value="local">Local Seed Pool (Offline Pool)</option>
                      <option value="opentdb">Open Trivia Database (API)</option>
                      <option value="openai">OpenAI GPT (AI Generator)</option>
                      <option value="gemini">Google Gemini (AI Generator)</option>
                    </select>
                  </div>

                  {/* Topic Select/Input */}
                  {fetchSource !== 'opentdb' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {fetchSource === 'openai' || fetchSource === 'gemini' ? 'Custom Topic to Generate' : 'Topic to Fetch'}
                      </label>
                      {fetchSource === 'openai' || fetchSource === 'gemini' ? (
                        <input
                          type="text"
                          value={fetchTopic}
                          onChange={(e) => setFetchTopic(e.target.value)}
                          placeholder="e.g., Kubernetes Network Policies, Next.js Middleware, SOLID principles"
                          className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
                          disabled={fetchLoading}
                        />
                      ) : (
                        <select
                          value={fetchTopic}
                          onChange={(e) => setFetchTopic(e.target.value)}
                          className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                          disabled={fetchLoading}
                        >
                          <option value="general">General Software Engineering (SOLID, Agile, OOP, Testing)</option>
                          <option value="react">React JS</option>
                          <option value="angular">Angular</option>
                          <option value="vue">Vue.js</option>
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="php">PHP</option>
                          <option value="laravel">Laravel</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="sql">SQL Databases</option>
                          <option value="html">HTML5</option>
                          <option value="css">CSS3 Grid & Flexbox</option>
                          <option value="docker">Docker Containers</option>
                          <option value="kubernetes">Kubernetes Orchestration</option>
                          <option value="git">Git Version Control</option>
                        </select>
                      )}
                    </div>
                  )}

                  {/* Query Info Panel */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Connection Info</label>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="overflow-x-auto whitespace-nowrap text-slate-400 font-mono scrollbar-none py-1">
                        {fetchSource === 'opentdb' 
                          ? 'https://opentdb.com/api.php?amount=15&category=18&type=multiple'
                          : fetchSource === 'openai'
                          ? 'AI Model: gpt-4o-mini (Generates 10 customized technical questions)'
                          : fetchSource === 'gemini'
                          ? 'AI Model: gemini-2.5-flash (Generates 10 customized technical questions)'
                          : `Local Seed Pool: Predefined ${fetchTopic === 'general' ? 'software engineering' : fetchTopic} pool of questions`}
                      </div>
                      {fetchSource === 'opentdb' && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('https://opentdb.com/api.php?amount=15&category=18&type=multiple');
                            alert('OpenTDB sample query URL copied to clipboard!');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-300 rounded-lg transition-colors font-semibold cursor-pointer shrink-0"
                        >
                          Copy URL
                        </button>
                      )}
                    </div>
                  </div>


                  {/* Target Category (Question Bank) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Question Bank (Category)</label>
                    <select
                      value={fetchCategoryId}
                      onChange={(e) => handleFetchCategoryChange(e.target.value)}
                      className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                      disabled={fetchLoading}
                    >
                      <option value="">Default (Based on Topic)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Subcategory */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Subcategory</label>
                    <select
                      value={fetchSubcategoryId}
                      onChange={(e) => setFetchSubcategoryId(e.target.value)}
                      className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                      disabled={fetchLoading || !fetchCategoryId}
                    >
                      <option value="">Default / First Subcategory</option>
                      {fetchSubcategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                    {!fetchCategoryId && (
                      <p className="text-xs text-slate-500 mt-1.5">Select a target Question Bank first to pick a subcategory.</p>
                    )}
                  </div>

                  {/* Fetch Trigger */}
                  <button
                    type="submit"
                    disabled={fetchLoading}
                    className="flex items-center gap-2 bg-brand-electric hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-brand-electric/15 hover:scale-102 transition-all duration-200 cursor-pointer"
                  >
                    {fetchLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Fetching Questions...
                      </>
                    ) : (
                      <>
                        <CloudDownload size={18} />
                        Fetch & Import
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
