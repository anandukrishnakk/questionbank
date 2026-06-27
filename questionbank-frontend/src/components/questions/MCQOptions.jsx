import React from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MCQOptions({ options, onChange }) {
  const { t } = useTranslation();

  const handleAddOption = () => {
    if (options.length >= 6) return;
    onChange([...options, { option_text: '', option_text_ml: '', is_correct: false }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    
    // If we removed the correct option, set the first one as correct
    const hadCorrect = options[index].is_correct;
    if (hadCorrect && newOptions.length > 0) {
      newOptions[0].is_correct = true;
    }
    onChange(newOptions);
  };

  const handleTextChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    onChange(newOptions);
  };

  const handleSetCorrect = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {t('questions.options')}
        </h3>
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-brand-electric px-3 py-1.5 rounded-lg border border-slate-700 font-semibold cursor-pointer transition-all duration-200"
          >
            <Plus size={14} />
            {t('questions.addOption')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all ${
              option.is_correct
                ? 'bg-brand-electric/5 border-brand-electric/30'
                : 'bg-brand-dark/45 border-slate-800'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Radio Selector */}
              <button
                type="button"
                onClick={() => handleSetCorrect(index)}
                className={`mt-3 cursor-pointer shrink-0 transition-colors ${
                  option.is_correct ? 'text-brand-electric' : 'text-slate-500 hover:text-slate-400'
                }`}
                title={t('questions.isCorrect')}
              >
                {option.is_correct ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>

              {/* Text Fields */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={option.option_text}
                  onChange={(e) => handleTextChange(index, 'option_text', e.target.value)}
                  placeholder={`Option ${index + 1} (English)`}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                  required
                />
                <input
                  type="text"
                  value={option.option_text_ml || ''}
                  onChange={(e) => handleTextChange(index, 'option_text_ml', e.target.value)}
                  placeholder={`Option ${index + 1} (Malayalam - optional)`}
                  className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
                />
              </div>

              {/* Delete Button */}
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="mt-2.5 p-1.5 text-slate-500 hover:text-brand-danger hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
