import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../api/categories';
import { createQuestion, uploadQuestionImage } from '../api/questions';
import MCQOptions from '../components/questions/MCQOptions';
import ImageUpload from '../components/questions/ImageUpload';
import { Save, AlertCircle } from 'lucide-react';

export default function AddQuestion() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Core form fields
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    question_text: '',
    question_text_ml: '',
    answer_text: '',
    answer_text_ml: '',
    type: 'descriptive', // mcq or descriptive
    difficulty: 'medium', // easy, medium, hard
    language: 'en', // en or ml
    tags: '', // comma-separated
  });

  // MCQ choices
  const [options, setOptions] = useState([
    { option_text: '', option_text_ml: '', is_correct: true },
    { option_text: '', option_text_ml: '', is_correct: false },
  ]);

  // Uploaded diagram file
  const [imageFile, setImageFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');

  // Category specific fields (metadata)
  const [metadata, setMetadata] = useState({
    company: '',
    role: '',
    subject: '',
    class: '',
    exam: '',
    year: '',
    paper: '',
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData({
      ...formData,
      category_id: catId,
      subcategory_id: '', // reset subcategory
    });

    const selectedCat = categories.find(c => c.id === parseInt(catId));
    if (selectedCat && selectedCat.subcategories) {
      setSubcategories(selectedCat.subcategories);
    } else {
      setSubcategories([]);
    }

    // Reset metadata when category changes
    setMetadata({
      company: '',
      role: '',
      subject: '',
      class: '',
      exam: '',
      year: '',
      paper: '',
    });
  };

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleMetadataChange = (e) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (file, caption) => {
    setImageFile(file);
    setImageCaption(caption);
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImageCaption('');
  };

  const getSelectedCategoryType = () => {
    const cat = categories.find(c => c.id === parseInt(formData.category_id));
    return cat ? cat.type : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.question_text) {
      setError('Category and Question Text are required.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare tags as array
    const tagsArr = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];

    // Filter metadata to keep only non-empty fields
    const filteredMetadata = Object.keys(metadata).reduce((acc, key) => {
      if (metadata[key]) acc[key] = metadata[key];
      return acc;
    }, {});

    const payload = {
      ...formData,
      metadata: Object.keys(filteredMetadata).length > 0 ? filteredMetadata : null,
      tags: tagsArr,
    };

    if (formData.type === 'mcq') {
      payload.options = options;
    }

    try {
      // 1. Create Question
      const question = await createQuestion(payload);

      // 2. Upload Diagram image if exists
      if (imageFile && question.id) {
        await uploadQuestionImage(question.id, imageFile, imageCaption);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const catType = getSelectedCategoryType();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-brand-navy/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-xl">
        <h2 className="text-2xl font-extrabold text-white mb-6">
          {t('questions.addTitle')}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-start gap-2 text-brand-danger text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.category')} *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleCategoryChange}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {i18n.language === 'ml' && c.name_ml ? c.name_ml : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.subcategory')}
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
                disabled={subcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {i18n.language === 'ml' && sc.name_ml ? sc.name_ml : sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC METADATA FIELDS BASED ON CATEGORY TYPE */}
          {catType === 'interview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company Name (e.g. Google)</label>
                <input
                  type="text"
                  name="company"
                  value={metadata.company}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Role (e.g. Software Engineer)</label>
                <input
                  type="text"
                  name="role"
                  value={metadata.role}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          {(catType === 'school' || catType === 'college') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Subject (e.g. Physics)</label>
                <input
                  type="text"
                  name="subject"
                  value={metadata.subject}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Class/Year (e.g. Class 10 / BTech Year 1)</label>
                <input
                  type="text"
                  name="class"
                  value={metadata.class}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chapter (e.g. Trigonometry)</label>
                <input
                  type="text"
                  name="paper" // Reuse paper slot for chapter
                  value={metadata.paper}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          {catType === 'competitive' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Exam Name (e.g. UPSC Prelims)</label>
                <input
                  type="text"
                  name="exam"
                  value={metadata.exam}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="e.g. Kerala PSC LDC"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Exam Year</label>
                <input
                  type="text"
                  name="year"
                  value={metadata.year}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="e.g. 2024"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Paper / Section</label>
                <input
                  type="text"
                  name="paper"
                  value={metadata.paper}
                  onChange={handleMetadataChange}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  placeholder="e.g. Paper II"
                />
              </div>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.type')}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
              >
                <option value="descriptive">{t('questions.descriptive')}</option>
                <option value="mcq">{t('questions.mcq')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.difficulty')}
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
              >
                <option value="easy">{t('questions.easy')}</option>
                <option value="medium">{t('questions.medium')}</option>
                <option value="hard">{t('questions.hard')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.lang')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>

          {/* Question Text in English and Malayalam */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.qTextEn')} *
              </label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleTextChange}
                rows={3}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
                placeholder="Type question here..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('questions.qTextMl')}
              </label>
              <textarea
                name="question_text_ml"
                value={formData.question_text_ml}
                onChange={handleTextChange}
                rows={3}
                className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
                placeholder="മലയാളത്തിലുള്ള ചോദ്യം ഇവിടെ ചേർക്കാം (നിർബന്ധമില്ല)..."
              />
            </div>
          </div>

          {/* MCQ Option Builder OR Descriptive Answer */}
          {formData.type === 'mcq' ? (
            <MCQOptions options={options} onChange={setOptions} />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t('questions.aTextEn')}
                </label>
                <textarea
                  name="answer_text"
                  value={formData.answer_text}
                  onChange={handleTextChange}
                  rows={4}
                  className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
                  placeholder="Type full correct explanation here..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t('questions.aTextMl')}
                </label>
                <textarea
                  name="answer_text_ml"
                  value={formData.answer_text_ml}
                  onChange={handleTextChange}
                  rows={4}
                  className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
                  placeholder="മലയാളത്തിലുള്ള വിശദീകരണം ഇവിടെ ചേർക്കാം..."
                />
              </div>
            </div>
          )}

          {/* Diagram Upload */}
          <ImageUpload
            onSelect={handleImageSelect}
            onClear={handleImageClear}
            selectedFile={imageFile}
          />

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('questions.tags')}
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleTextChange}
              className="block w-full px-4 py-3 bg-brand-dark/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-electric"
              placeholder="e.g. calculus, binary-search, kerala-psc-2023"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-electric hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-electric/15 hover:scale-101 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save size={18} />
                {t('questions.submitBtn')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
