import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark/40 border-t border-slate-900 py-6 mt-12 text-center text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Universal Question Bank. All rights reserved.</p>
        <p className="text-xs text-slate-600 mt-1">Built with React, Laravel & Tailwind CSS.</p>
      </div>
    </footer>
  );
}
