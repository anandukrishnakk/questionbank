import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ value, onSearchChange }) {
  const { t } = useTranslation();
  const [localVal, setLocalVal] = useState(value);

  // Sync internal state with external value changes
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  // Debouncing search updates to prevent overloading Laravel API
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localVal);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [localVal]);

  const handleClear = () => {
    setLocalVal('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        placeholder={t('questions.searchPlaceholder')}
        className="block w-full pl-12 pr-10 py-3.5 bg-brand-navy/35 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric/20 transition-all shadow-lg"
      />
      {localVal && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
