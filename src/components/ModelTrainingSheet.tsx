import React, { useState } from 'react';
import {
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  ZoomIn,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import type { TrainingModel, StoreModel, Language, LightboxImage } from '../types';
import { translations } from '../utils/i18n';
import { getSelloutTier } from '../data/storeData';
import { getModelAllImages } from './ModelPhoto';

interface ModelTrainingSheetProps {
  model: TrainingModel;
  storeModel?: StoreModel;
  lang: Language;
  onClose: () => void;
  onSelectModelByName?: (name: string) => void;
  onOpenLightbox?: (img: LightboxImage) => void;
  onPrevModel?: () => void;
  onNextModel?: () => void;
}

export const ModelTrainingSheet: React.FC<ModelTrainingSheetProps> = ({
  model,
  storeModel,
  lang,
  onClose,
  onSelectModelByName,
  onOpenLightbox,
  onPrevModel,
  onNextModel
}) => {
  // Always default to Russian as requested by user ("l'interfacci agrafica deve essere tutta in russo")
  const [selectedLang, setSelectedLang] = useState<Language>(lang || 'ru');
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);

  const t = translations[selectedLang] || translations.ru;

  // Helper for localized text
  const getLocalizedText = (field: Record<string, string> | string | undefined): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[selectedLang] || field['ru'] || field['it'] || field['en'] || '';
  };

  // Helper for localized advice array
  const getLocalizedAdvice = (): string[] => {
    if (!model.advice) return [];
    if (Array.isArray(model.advice)) return model.advice;
    const localized = model.advice[selectedLang] || model.advice['ru'] || model.advice['it'] || model.advice['en'];
    return Array.isArray(localized) ? localized : [];
  };

  // Helper for localized objections
  const getLocalizedObjections = (): Array<{ q: string; a: string }> => {
    if (!model.objections) return [];
    if (Array.isArray(model.objections)) return model.objections;
    const localized = model.objections[selectedLang] || model.objections['ru'] || model.objections['it'] || model.objections['en'];
    return Array.isArray(localized) ? localized : [];
  };

  // Images and colors
  const joorVariants = getModelAllImages(model.name);
  const modelColors = model.colors && model.colors.length > 0 ? model.colors : [];

  // Active hero photo
  const currentColor = modelColors[activeColorIndex];
  const activeImageUrl = currentColor?.imageUrl || joorVariants[activeColorIndex]?.url || joorVariants[0]?.url;

  const handlePrint = () => {
    window.print();
  };

  const selloutTier = storeModel && storeModel.pct !== undefined ? getSelloutTier(storeModel.pct) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto print:static print:bg-white print:p-0">
      
      {/* Outer Card */}
      <div className="relative my-0 sm:my-6 min-h-screen sm:min-h-0 sm:max-h-[96vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl transition-all sm:rounded-lg print:max-h-none print:shadow-none print:m-0 print:w-full">
        
        {/* TOP INTERACTIVE TOOLBAR (hidden during print) */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5]/95 px-4 sm:px-6 py-3 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded border border-[#D9CEBF] bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t.backToReport}</span>
            </button>

            {onPrevModel && (
              <button
                onClick={onPrevModel}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#D9CEBF] bg-white text-stone-600 transition hover:bg-stone-50"
                title="Предыдущая модель"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {onNextModel && (
              <button
                onClick={onNextModel}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#D9CEBF] bg-white text-stone-600 transition hover:bg-stone-50"
                title="Следующая модель"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center rounded border border-[#D9CEBF] bg-white p-0.5">
              {(['ru', 'it', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLang(l)}
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                    selectedLang === l
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded border border-[#D9CEBF] bg-white px-3 py-1 font-mono text-xs text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
              title={t.printSheet}
            >
              <Printer className="h-3.5 w-3.5 text-[#9E834D]" />
              <span className="hidden sm:inline">{t.printSheet}</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-stone-700 transition hover:bg-stone-300"
              title={t.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* STORE PERFORMANCE BANNER (if opened from Orenburg store) */}
        {storeModel && (
          <div className="border-b border-[#E7E2DA] bg-[#F7F4EF] px-6 py-3 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#9E834D]" />
                <span className="font-serif text-sm font-bold text-stone-900">
                  {t.storePerformance}
                </span>
                <span className="text-xs text-stone-500">
                  (PO JOOR: #{storeModel.po || '—'})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-stone-500">{t.orderedQty}: </span>
                  <span className="font-bold text-stone-900">{storeModel.ordered} {t.pcs}</span>
                </div>
                <div>
                  <span className="text-stone-500">{t.soldQty}: </span>
                  <span className="font-bold text-[#2E7D4C]">{storeModel.sold} {t.pcs}</span>
                </div>
                <div>
                  <span className="text-stone-500">{t.stockQty}: </span>
                  <span className="font-bold text-stone-900">{Math.max(0, storeModel.ordered - storeModel.sold)} {t.pcs}</span>
                </div>
                <div className={`px-2 py-0.5 rounded font-bold ${
                  selloutTier === 'best' ? 'bg-[#EEF8F1] text-[#2E7D4C]' :
                  selloutTier === 'flop' ? 'bg-[#FDEEEE] text-[#BA3D35]' : 'bg-white text-[#9E834D]'
                }`}>
                  <span>Sell-out: </span>
                  <span>{storeModel.pct?.toFixed(1)}%</span>
                </div>
                <div className="font-sans text-[11px] text-stone-600">
                  {storeModel.status === 'OK' ? t.statusOk : t.statusOrderedNotSold}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EDITORIAL SPEC SHEET LAYOUT (Exact match to Caserta PDF)   */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-12 text-[#241E1B] space-y-8 bg-white print:p-8">

          {/* PAGE 1 CONTENT */}
          <div className="space-y-6 print:break-after-page">
            {/* Header: Brand and Subtitle */}
            <div className="flex items-start justify-between border-b border-[#E7E2DA] pb-4">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-normal tracking-[0.2em] text-[#1C1715] uppercase">
                  LUISA SPAGNOLI
                </h1>
                <p className="mt-1 text-xs text-stone-500 tracking-wide">
                  {selectedLang === 'ru'
                    ? 'Обучающие материалы Осень-Зима 2026/2027'
                    : selectedLang === 'it'
                    ? 'Training Material FW 2026/2027'
                    : 'Training Material FW 2026/2027'}
                </p>
                <div className="mt-4 font-serif text-3xl sm:text-4xl font-normal text-[#1C1715]">
                  {model.name}
                </div>
              </div>
              <div className="font-mono text-xs sm:text-sm text-stone-400 pt-1">
                ID #{model.id}
              </div>
            </div>

            {/* Hero Image Container (PDF Style: clean light box with subtle hairline border) */}
            <div className="relative flex aspect-4/3 w-full max-h-[460px] items-center justify-center overflow-hidden border border-[#E7E2DA] bg-white p-6">
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={model.name}
                  onClick={() => onOpenLightbox?.({
                    src: activeImageUrl,
                    caption: model.name,
                    code: currentColor?.code || String(model.id)
                  })}
                  className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-102"
                />
              ) : (
                <div className="flex h-64 items-center justify-center font-serif text-5xl font-light text-[#D9CEBF]">
                  {model.name.charAt(0)}
                </div>
              )}
              {activeImageUrl && (
                <button
                  onClick={() => onOpenLightbox?.({
                    src: activeImageUrl,
                    caption: model.name,
                    code: currentColor?.code || String(model.id)
                  })}
                  className="absolute bottom-3 right-3 rounded-full bg-white/80 p-1.5 text-stone-600 shadow-xs backdrop-blur-xs transition hover:text-stone-900 print:hidden"
                  title="Увеличить"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* DESCRIPTION Section */}
            <div>
              <div className="border-b border-[#E7E2DA] pb-1 mb-3">
                <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#9E834D] uppercase">
                  {selectedLang === 'ru' ? 'ОПИСАНИЕ' : selectedLang === 'it' ? 'DESCRIZIONE' : 'DESCRIPTION'}
                </h2>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#3D332D] font-normal">
                {getLocalizedText(model.description)}
              </p>
            </div>

            {/* COLOR VARIANTS Section */}
            {modelColors.length > 0 && (
              <div>
                <div className="border-b border-[#E7E2DA] pb-1 mb-3">
                  <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#9E834D] uppercase">
                    {selectedLang === 'ru' ? 'ЦВЕТОВЫЕ ВАРИАНТЫ' : selectedLang === 'it' ? 'VARIANTI COLORE' : 'COLOR VARIANTS'}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {modelColors.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveColorIndex(idx)}
                      className={`group flex flex-col items-center cursor-pointer transition ${
                        activeColorIndex === idx ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className={`aspect-square w-full border bg-white p-3 flex items-center justify-center transition ${
                        activeColorIndex === idx ? 'border-stone-900 shadow-xs' : 'border-[#E7E2DA] group-hover:border-[#9E834D]'
                      }`}>
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="font-serif text-lg text-stone-400">
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center text-xs text-[#241E1B]">
                        <span className="font-normal">{c.name}</span>
                        {c.code && (
                          <span className="text-stone-500 font-mono text-[11px] ml-1">
                            ({c.code})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Page 1 Footer indicator */}
            <div className="pt-4 text-right text-xs font-mono text-stone-400 border-t border-[#F2ECE3]">
              {model.name} · 1/3
            </div>
          </div>

          {/* PAGE 2 CONTENT */}
          <div className="space-y-6 pt-6 print:break-after-page">
            
            {/* STYLING / COMBINATIONS Section */}
            {model.looks && model.looks.length > 0 && (
              <div>
                <div className="border-b border-[#E7E2DA] pb-1 mb-4">
                  <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#9E834D] uppercase">
                    {selectedLang === 'ru' ? 'СТИЛИЗАЦИЯ И ОБРАЗЫ' : selectedLang === 'it' ? 'STYLING / ABBINAMENTI' : 'STYLING / COMBINATIONS'}
                  </h2>
                </div>

                <div className="space-y-6">
                  {model.looks.map((look, lIdx) => {
                    const title = getLocalizedText(look.title);
                    const desc = getLocalizedText(look.description);

                    return (
                      <div
                        key={lIdx}
                        className="border border-[#E7E2DA] bg-white p-5 sm:p-6"
                      >
                        {title && (
                          <h3 className="font-sans text-sm font-semibold text-[#1C1715]">
                            {title}
                          </h3>
                        )}
                        {desc && (
                          <p className="mt-1 text-xs sm:text-sm text-[#4A3F39] leading-relaxed">
                            {desc}
                          </p>
                        )}

                        {look.items && look.items.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {look.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                onClick={() => item.name && onSelectModelByName?.(item.name)}
                                className="group flex flex-col items-center text-center cursor-pointer"
                                title={`Открыть карточку ${item.name}`}
                              >
                                <div className="aspect-square w-full border border-[#E7E2DA] bg-white p-2 flex items-center justify-center transition group-hover:border-[#9E834D]">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="font-serif text-sm text-stone-400">
                                      {item.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1.5 text-[11px] leading-tight text-[#241E1B] group-hover:text-[#9E834D]">
                                  <span className="font-medium">{item.name}</span>
                                  {item.code && (
                                    <div className="text-[10px] font-mono text-stone-500">
                                      {item.code}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SALES ADVICE Section */}
            {getLocalizedAdvice().length > 0 && (
              <div>
                <div className="border-b border-[#E7E2DA] pb-1 mb-3">
                  <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#9E834D] uppercase">
                    {selectedLang === 'ru' ? 'СОВЕТЫ ПО ПРОДАЖАМ' : selectedLang === 'it' ? 'CONSIGLI DI VENDITA' : 'SALES ADVICE'}
                  </h2>
                </div>

                <div className="space-y-3">
                  {getLocalizedAdvice().map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-[#3D332D] leading-relaxed">
                      <span className="font-mono text-xs font-semibold text-stone-500 pt-0.5">
                        {idx + 1}.
                      </span>
                      <p>{adv}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Page 2 Footer indicator */}
            <div className="pt-4 text-right text-xs font-mono text-stone-400 border-t border-[#F2ECE3]">
              {model.name} · 2/3
            </div>
          </div>

          {/* PAGE 3 CONTENT */}
          <div className="space-y-6 pt-6">
            
            {/* OBJECTION HANDLING Section */}
            {getLocalizedObjections().length > 0 && (
              <div>
                <div className="border-b border-[#E7E2DA] pb-1 mb-4">
                  <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#9E834D] uppercase">
                    {selectedLang === 'ru' ? 'РАБОТА С ВОЗРАЖЕНИЯМИ' : selectedLang === 'it' ? 'GESTIONE OBIEZIONI' : 'OBJECTION HANDLING'}
                  </h2>
                </div>

                <div className="space-y-5">
                  {getLocalizedObjections().map((obj, idx) => (
                    <div key={idx} className="text-sm leading-relaxed space-y-1">
                      <div className="font-medium text-[#1C1715]">
                        <span className="font-mono text-stone-500 mr-1.5">{idx + 1}.</span>
                        {obj.q}
                      </div>
                      <div className="text-[#4A3F39] pl-5 text-[13.5px]">
                        <span className="font-semibold text-stone-800">
                          {selectedLang === 'ru' ? 'Ответ: ' : selectedLang === 'it' ? 'Risposta: ' : 'Response: '}
                        </span>
                        {obj.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Page 3 Footer indicator */}
            <div className="pt-8 text-right text-xs font-mono text-stone-400 border-t border-[#F2ECE3]">
              {model.name} · 3/3
            </div>

          </div>

        </div>

        {/* BOTTOM MODAL BAR (Screen only) */}
        <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[#E7E2DA] bg-[#FAF8F5]/95 px-6 py-3 backdrop-blur-md print:hidden">
          <div className="font-mono text-xs text-stone-500">
            Luisa Spagnoli · FW 2026/2027 · {model.name} (ID #{model.id})
          </div>
          <button
            onClick={onClose}
            className="rounded bg-stone-900 px-5 py-2 font-mono text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
