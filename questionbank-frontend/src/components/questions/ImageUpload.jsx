import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ImageUpload({ onSelect, onClear, selectedFile }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSelect(file, caption);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
    if (selectedFile) {
      onSelect(selectedFile, e.target.value);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {t('questions.imageUpload')}
      </label>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-brand-dark/20"
        >
          <Upload className="text-slate-500 mb-2" size={28} />
          <p className="text-sm text-slate-400 font-medium">Click to upload diagram or image</p>
          <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG, SVG up to 4MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-brand-dark/45 border border-slate-800 rounded-2xl p-4">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Diagram Preview" 
              className="max-h-48 rounded-xl object-contain border border-slate-700 bg-black/10"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 p-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full cursor-pointer shadow-lg"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-3">
            <input
              type="text"
              value={caption}
              onChange={handleCaptionChange}
              placeholder={t('questions.imageCaption')}
              className="block w-full px-3 py-2 bg-brand-dark/50 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-electric"
            />
          </div>
        </div>
      )}
    </div>
  );
}
