import React from 'react';
import { BarChart3, BookOpen, Search } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../utils/i18n';

interface HeaderProps {
  activeTab: 'sellout' | 'training';
  setActiveTab: (tab: 'sellout' | 'training') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenSearch?: () => void;
  bestsellersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenSearch,
  bestsellersCount
}) => {
  const t = translations[lang] || translations.ru;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5DCD0] bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded bg-[#1C1715] font-serif text-lg sm:text-xl font-bold tracking-tight text-[#FAF7F2] shadow-xs">
            LS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1715]">
                Luisa Spagnoli
              </span>
              <span className="hidden sm:inline-flex rounded border border-[#D9CEBF] bg-[#F2ECE3] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7D7067]">
                FW 26/27
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#7D7067]">
              {lang === 'ru' ? 'Магазин Оренбург' : t.storeName} · {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Unified Navigation Switcher */}
        <nav className="flex items-center rounded border border-[#E5DCD0] bg-[#F2ECE3]/80 p-1">
          <button
            onClick={() => setActiveTab('sellout')}
            className={`flex items-center gap-2 rounded px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === 'sellout'
                ? 'bg-[#1C1715] text-[#FAF7F2] shadow-xs'
                : 'text-[#5C5047] hover:text-[#1C1715] hover:bg-[#EBE4DA]/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>{lang === 'ru' ? 'Sell-out Оренбург' : 'Sell-out Negozio'}</span>
            {bestsellersCount > 0 && (
              <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'sellout' ? 'bg-[#2E7D4C] text-white' : 'bg-[#E5DCD0] text-[#2E7D4C]'
              }`}>
                {bestsellersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 rounded px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === 'training'
                ? 'bg-[#1C1715] text-[#FAF7F2] shadow-xs'
                : 'text-[#5C5047] hover:text-[#1C1715] hover:bg-[#EBE4DA]/60'
            }`}
          >
            <BookOpen className="h-4 w-4 text-[#9E834D]" />
            <span>{lang === 'ru' ? 'Каталог моделей (273)' : 'Training Hub FW26'}</span>
          </button>
        </nav>

        {/* Right tools: Search & Language switcher */}
        <div className="flex items-center gap-2">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 rounded border border-[#E5DCD0] bg-white px-3 py-1.5 font-mono text-xs text-[#7D7067] hover:border-[#9E834D] hover:text-[#1C1715] transition-colors"
              title={lang === 'ru' ? 'Поиск модели' : 'Cerca modello'}
            >
              <Search className="h-3.5 w-3.5" />
              <span>{lang === 'ru' ? 'Поиск модели...' : 'Cerca modello...'}</span>
              <kbd className="rounded bg-[#F2ECE3] px-1.5 py-0.5 text-[9px] text-[#7D7067]">⌘K</kbd>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded border border-[#E5DCD0] bg-white p-0.5">
            {(['ru', 'it', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded px-2 py-1 font-mono text-[11px] font-semibold transition-all ${
                  lang === l
                    ? 'bg-[#1C1715] text-[#FAF7F2]'
                    : 'text-[#7D7067] hover:text-[#1C1715]'
                }`}
                title={l === 'ru' ? 'Русский' : l === 'it' ? 'Italiano' : 'English'}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
