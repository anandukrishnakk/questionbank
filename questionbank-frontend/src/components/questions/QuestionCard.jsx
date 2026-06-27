import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Tag as TagIcon, Check, Calendar, User, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuestionCard({ question, currentUserId, isAdmin, onApprove, onReject, onDelete }) {
  const { t, i18n } = useTranslation();
  const [reveal, setReveal] = useState(false);

  const lang = i18n.language; // en or ml

  // Helper to resolve text translation
  const getQuestionText = () => {
    if (lang === 'ml' && question.question_text_ml) {
      return question.question_text_ml;
    }
    return question.question_text;
  };

  const getAnswerText = () => {
    if (lang === 'ml' && question.answer_text_ml) {
      return question.answer_text_ml;
    }
    return question.answer_text;
  };

  const getOptionText = (opt) => {
    if (lang === 'ml' && opt.option_text_ml) {
      return opt.option_text_ml;
    }
    return opt.option_text;
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      case 'rejected': return 'bg-brand-danger/10 text-brand-danger border-brand-danger/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const isOwner = question.user_id === currentUserId;

  return (
    <div className="bg-brand-navy/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300">
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
            {lang === 'ml' && question.category?.name_ml ? question.category.name_ml : question.category?.name}
          </span>
          {/* Subcategory */}
          {question.subcategory && (
            <span className="px-2.5 py-1 bg-slate-800/50 text-slate-400 rounded-lg text-xs">
              {lang === 'ml' && question.subcategory?.name_ml ? question.subcategory.name_ml : question.subcategory?.name}
            </span>
          )}
          {/* Difficulty */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${getDifficultyColor(question.difficulty)}`}>
            {t(`questions.${question.difficulty}`)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge for owner or admin */}
          {(isOwner || isAdmin) && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${getStatusColor(question.status)}`}>
              {t(`questions.${question.status}`)}
            </span>
          )}
          
          {/* Primary Language */}
          <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            {question.language}
          </span>
        </div>
      </div>

      {/* Category Specific Info Box */}
      {question.metadata && (
        <div className="mb-4 p-3 bg-brand-dark/25 rounded-xl border border-slate-900 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-400">
          {question.metadata.company && (
            <p><strong>Company:</strong> <span className="text-slate-200">{question.metadata.company}</span></p>
          )}
          {question.metadata.role && (
            <p><strong>Role:</strong> <span className="text-slate-200">{question.metadata.role}</span></p>
          )}
          {question.metadata.subject && (
            <p><strong>Subject:</strong> <span className="text-slate-200">{question.metadata.subject}</span></p>
          )}
          {question.metadata.class && (
            <p><strong>Class:</strong> <span className="text-slate-200">{question.metadata.class}</span></p>
          )}
          {question.metadata.exam && (
            <p><strong>Exam:</strong> <span className="text-slate-200">{question.metadata.exam}</span></p>
          )}
          {question.metadata.year && (
            <p><strong>Year:</strong> <span className="text-slate-200">{question.metadata.year}</span></p>
          )}
        </div>
      )}

      {/* Question Text */}
      <div className="text-base sm:text-lg text-white font-semibold leading-relaxed mb-4 whitespace-pre-line">
        {getQuestionText()}
      </div>

      {/* Diagram/Image if present */}
      {question.images && question.images.length > 0 && (
        <div className="mb-4 p-2 bg-brand-dark/20 border border-slate-800 rounded-xl max-w-lg">
          <img 
            src={question.images[0].image_path} 
            alt={question.images[0].caption || 'Diagram'} 
            className="max-h-60 rounded-lg object-contain bg-black/10 mx-auto"
          />
          {question.images[0].caption && (
            <p className="text-xs text-slate-500 mt-1.5 text-center italic">{question.images[0].caption}</p>
          )}
        </div>
      )}

      {/* Tags list */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <TagIcon size={12} className="text-slate-500" />
          {question.tags.map((tag) => (
            <span key={tag.id} className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:text-white transition-colors">
              #{tag.slug}
            </span>
          ))}
        </div>
      )}

      {/* Answer Area */}
      <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-4">
        {/* Toggle Reveal Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setReveal(!reveal)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-electric hover:text-blue-400 cursor-pointer transition-colors"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
            {reveal ? t('questions.hideAnswer') : t('questions.revealAnswer')}
          </button>

          {/* Author/Date footer */}
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-0.5">
              <User size={12} />
              {question.user?.name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-0.5">
              <Calendar size={12} />
              {new Date(question.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Revealed Section */}
        {reveal && (
          <div className="mt-2 p-5 bg-brand-dark/40 border border-slate-800/80 rounded-xl animate-fadeIn">
            {/* MCQ Option render */}
            {question.type === 'mcq' && question.options && (
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                      opt.is_correct
                        ? 'bg-brand-success/10 border-brand-success/35 text-brand-success font-semibold'
                        : 'bg-brand-dark/20 border-slate-800 text-slate-300'
                    }`}
                  >
                    {opt.is_correct && <Check size={16} className="shrink-0" />}
                    <span>{getOptionText(opt)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Descriptive Answer Render */}
            {question.type === 'descriptive' && (
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">Answer / Explanation</p>
                {getAnswerText() || 'No answer description provided.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin / Owner management actions */}
      {(isAdmin || isOwner) && (
        <div className="border-t border-slate-900/60 mt-4 pt-3 flex items-center justify-end gap-2">
          {/* Admin specific verify buttons */}
          {isAdmin && question.status === 'pending' && (
            <div className="flex gap-2 mr-auto">
              <button
                onClick={() => onApprove?.(question.id)}
                className="bg-brand-success/10 hover:bg-brand-success/20 text-brand-success px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-brand-success/20"
              >
                Approve
              </button>
              <button
                onClick={() => onReject?.(question.id)}
                className="bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-brand-danger/20"
              >
                Reject
              </button>
            </div>
          )}

          {/* Delete action */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this question?')) {
                onDelete?.(question.id);
              }
            }}
            className="p-2 text-slate-500 hover:text-brand-danger hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
            title="Delete Question"
          >
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
