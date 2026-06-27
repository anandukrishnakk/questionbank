import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../api/categories';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';

export default function FilterSidebar({ filters, onFilterChange }) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [expandedCat, setExpandedCat] = useState(null);

  const lang = i18n.language;

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCategorySelect = (catId) => {
    // If clicking same category, toggle collapse, but also filter questions by that category
    if (expandedCat === catId) {
      setExpandedCat(null);
    } else {
      setExpandedCat(catId);
    }

    onFilterChange({
      ...filters,
      category_id: filters.category_id === catId ? '' : catId,
      subcategory_id: '', // reset subcategory on category change
    });
  };

  const handleSubcategorySelect = (subId) => {
    onFilterChange({
      ...filters,
      subcategory_id: filters.subcategory_id === subId ? '' : subId,
    });
  };

  const handleParamChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: filters[field] === value ? '' : value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      category_id: '',
      subcategory_id: '',
      difficulty: '',
      type: '',
      language: '',
      tag: '',
    });
    setExpandedCat(null);
  };

  const isFiltered = Object.values(filters).some(x => x !== '');

  return (
    <div className="bg-brand-navy/30 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm sticky top-20 h-fit space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Filter size={18} className="text-brand-electric" />
          Filters
        </h2>
        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-brand-electric transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Tree */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Categories
        </h3>
        
        <div className="space-y-1">
          {categories.map((cat) => {
            const isCatActive = filters.category_id === cat.id;
            const isExpanded = expandedCat === cat.id;
            const catName = lang === 'ml' && cat.name_ml ? cat.name_ml : cat.name;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    isCatActive
                      ? 'bg-brand-electric/15 text-brand-electric'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="truncate">{catName}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <span className="text-slate-500">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* Subcategories drop list */}
                {isExpanded && cat.subcategories && (
                  <div className="pl-4 space-y-0.5 mt-1 border-l border-slate-800 ml-3">
                    {cat.subcategories.map((sub) => {
                      const isSubActive = filters.subcategory_id === sub.id;
                      const subName = lang === 'ml' && sub.name_ml ? sub.name_ml : sub.name;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategorySelect(sub.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                            isSubActive
                              ? 'text-brand-electric font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                          }`}
                        >
                          {subName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty filters */}
      <div className="space-y-3 pt-4 border-t border-slate-900/50">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Difficulty
        </h3>
        <div className="flex flex-wrap gap-2">
          {['easy', 'medium', 'hard'].map((diff) => {
            const isDiffActive = filters.difficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => handleParamChange('difficulty', diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer capitalize transition-all ${
                  isDiffActive
                    ? 'bg-brand-electric/10 border-brand-electric/40 text-brand-electric'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(`questions.${diff}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type filters */}
      <div className="space-y-3 pt-4 border-t border-slate-900/50">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {['mcq', 'descriptive'].map((tType) => {
            const isTypeActive = filters.type === tType;
            return (
              <button
                key={tType}
                onClick={() => handleParamChange('type', tType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  isTypeActive
                    ? 'bg-brand-electric/10 border-brand-electric/40 text-brand-electric'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tType === 'mcq' ? 'MCQ' : 'Descriptive'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language filter */}
      <div className="space-y-3 pt-4 border-t border-slate-900/50">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Language
        </h3>
        <div className="flex flex-wrap gap-2">
          {['en', 'ml'].map((langCode) => {
            const isLangActive = filters.language === langCode;
            return (
              <button
                key={langCode}
                onClick={() => handleParamChange('language', langCode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer uppercase transition-all ${
                  isLangActive
                    ? 'bg-brand-electric/10 border-brand-electric/40 text-brand-electric'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {langCode === 'en' ? 'English' : 'മലയാളം'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Public Data Source / OpenTDB Sample Query */}
      <div className="pt-4 border-t border-slate-900/50 space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Public Data Source
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Partially seeded using public trivia. You can copy the sample query used to extract computer science trivia from OpenTDB:
        </p>
        <div className="flex items-center gap-2 mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-400 overflow-hidden">
          <span className="truncate select-all grow">https://opentdb.com/api.php?amount=15&category=18&type=multiple</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://opentdb.com/api.php?amount=15&category=18&type=multiple');
              alert('OpenTDB sample query URL copied to clipboard!');
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded border border-slate-800 transition-colors font-semibold cursor-pointer shrink-0"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
