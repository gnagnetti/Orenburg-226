import React, { useState, useEffect, useMemo } from 'react';
import type { Language, StoreModel, TrainingModel, LightboxImage } from './types';
import { Header } from './components/Header';
import { SelloutDashboard } from './components/SelloutDashboard';
import { TrainingHubCatalog } from './components/TrainingHubCatalog';
import { ModelTrainingSheet } from './components/ModelTrainingSheet';
import { ImageLightbox } from './components/ImageLightbox';
import { storeData } from './data/storeData';
import {
  initCsvModels,
  getModelById,
  getModelByName
} from './services/csvModelService';
import {
  createSyntheticTrainingModel
} from './services/trainingService';
import { trainingModelsIndex } from './data/trainingModelsIndex';

export default function App() {
  // App opens directly into the Sell-out app clone as requested
  const [activeTab, setActiveTab] = useState<'sellout' | 'training'>('sellout');
  // Default language is Russian as requested ("l'interfacci agrafica deve essere tutta in russo")
  const [lang, setLang] = useState<Language>('ru');
  
  // Model Training Sheet Modal State
  const [selectedTrainingModel, setSelectedTrainingModel] = useState<TrainingModel | null>(null);
  const [selectedStoreModel, setSelectedStoreModel] = useState<StoreModel | undefined>(undefined);
  
  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  // Quick search overlay
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  // Loaded CSV models database cache
  const [csvDbLoaded, setCsvDbLoaded] = useState(false);

  useEffect(() => {
    // Initialize models from the attached CSV
    initCsvModels().then(() => {
      setCsvDbLoaded(true);
    });

    // Keyboard shortcut for search (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open model spec sheet from a StoreModel
  const handleSelectStoreModel = (sm: StoreModel) => {
    setSelectedStoreModel(sm);

    // Look for matching model in CSV database
    const found = getModelByName(sm.name);
    if (found) {
      setSelectedTrainingModel(found);
    } else {
      // Use synthetic model with full Joor assets and technical specs
      const synthetic = createSyntheticTrainingModel(sm);
      setSelectedTrainingModel(synthetic);
    }
  };

  // Open model spec sheet by model name (from Look items, tags, or Training Hub)
  const handleSelectModelByName = (name: string) => {
    const norm = name.toLowerCase().trim();

    // Check if this model is in store
    const sm = storeData.models.find((m) => m.name.toLowerCase().trim() === norm);
    setSelectedStoreModel(sm);

    const found = getModelByName(name);
    if (found) {
      setSelectedTrainingModel(found);
    } else if (sm) {
      setSelectedTrainingModel(createSyntheticTrainingModel(sm));
    } else {
      // Find in index
      const indexItem = trainingModelsIndex.find((m) => m.name.toLowerCase().trim() === norm);
      const fallback: TrainingModel = {
        id: indexItem ? indexItem.id : 0,
        name,
        category: 'Ready-to-Wear',
        description: {
          ru: `Эксклюзивная модель из коллекции Luisa Spagnoli Осень-Зима 2026/2027. Безупречное качество пошива, традиционное итальянское портновское искусство и благородные ткани.`,
          it: `Modello esclusivo della collezione Luisa Spagnoli Autunno-Inverno 2026/2027. Realizzato secondo la maestria artigianale e sartoriale del marchio, con filati e tessuti di prima qualità.`,
          en: `Exclusive style from the Luisa Spagnoli Fall-Winter 2026/2027 collection. Crafted with exceptional Italian fabrics and tailoring.`
        },
        colors: [],
        looks: [],
        advice: {
          ru: [
            'Демонстрировать клиенту превосходное качество ткани и гармоничную посадку по фигуре.',
            'Предлагать как базовый элемент капсульного гардероба на сезон Осень-Зима 2026/2027.'
          ],
          it: ['Proporre alla cliente illustrando l’eccellenza del tessuto e la vestibilità armoniosa.'],
          en: ['Highlight the premium fabric texture and versatile styling options.']
        },
        objections: {
          ru: [
            {
              q: 'Как правильно ухаживать за этим изделием?',
              a: 'Рекомендуется деликатная профессиональная сухая чистка для сохранения формы и мягкости ткани.'
            }
          ],
          it: [{ q: 'Come si cura questo capo?', a: 'Lavaggio professionale a secco per preservare fibre e forma.' }],
          en: [{ q: 'How to care for this piece?', a: 'Professional dry clean recommended.' }]
        }
      };
      setSelectedTrainingModel(fallback);
    }
  };

  // Previous / Next model navigation
  const currentIndex = useMemo(() => {
    if (!selectedTrainingModel) return -1;
    return trainingModelsIndex.findIndex(
      (m) => m.name.toLowerCase() === selectedTrainingModel.name.toLowerCase()
    );
  }, [selectedTrainingModel]);

  const handlePrevModel = () => {
    if (currentIndex > 0) {
      handleSelectModelByName(trainingModelsIndex[currentIndex - 1].name);
    } else if (currentIndex === 0) {
      handleSelectModelByName(trainingModelsIndex[trainingModelsIndex.length - 1].name);
    }
  };

  const handleNextModel = () => {
    if (currentIndex >= 0 && currentIndex < trainingModelsIndex.length - 1) {
      handleSelectModelByName(trainingModelsIndex[currentIndex + 1].name);
    } else if (currentIndex === trainingModelsIndex.length - 1) {
      handleSelectModelByName(trainingModelsIndex[0].name);
    }
  };

  const bestsellersCount = storeData.models.filter(
    (m) => m.ordered > 0 && (m.sold / m.ordered) * 100 >= 50
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E1B]">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenSearch={() => setIsSearchOpen(true)}
        bestsellersCount={bestsellersCount}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'sellout' ? (
          <SelloutDashboard
            lang={lang}
            onSelectModel={handleSelectStoreModel}
            onOpenTrainingHub={() => setActiveTab('training')}
          />
        ) : (
          <TrainingHubCatalog
            lang={lang}
            onSelectModelByName={handleSelectModelByName}
          />
        )}
      </main>

      {/* MODEL TRAINING SPEC SHEET (Fed by CSV & matching Caserta PDF) */}
      {selectedTrainingModel && (
        <ModelTrainingSheet
          model={selectedTrainingModel}
          storeModel={selectedStoreModel}
          lang={lang}
          onClose={() => {
            setSelectedTrainingModel(null);
            setSelectedStoreModel(undefined);
          }}
          onSelectModelByName={handleSelectModelByName}
          onOpenLightbox={(img) => setLightboxImage(img)}
          onPrevModel={handlePrevModel}
          onNextModel={handleNextModel}
        />
      )}

      {/* LIGHTBOX MODAL */}
      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* QUICK SEARCH MODAL */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-xs"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E5DCD0] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-[#E5DCD0] px-4 py-3">
              <input
                type="text"
                autoFocus
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск модели коллекции FW26 или кода...' : 'Cerca qualsiasi modello FW26 o codice...'}
                className="w-full bg-transparent text-sm text-[#1C1715] outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="font-mono text-xs text-[#7D7067] hover:text-[#1C1715]"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#F2ECE3]">
              {trainingModelsIndex
                .filter((m) =>
                  !quickSearch ||
                  m.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
                  m.id.toString().includes(quickSearch)
                )
                .slice(0, 15)
                .map((m) => {
                  const isInStore = storeData.models.some(
                    (sm) => sm.name.toLowerCase() === m.name.toLowerCase()
                  );
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        handleSelectModelByName(m.name);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#FAF7F2] rounded-lg transition"
                    >
                      <div>
                        <span className="font-serif text-sm font-bold text-[#1C1715]">
                          {m.name}
                        </span>
                        <span className="ml-2 font-mono text-xs text-[#7D7067]">
                          ID #{m.id}
                        </span>
                      </div>
                      {isInStore && (
                        <span className="rounded bg-[#EEF8F1] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#2E7D4C]">
                          {lang === 'ru' ? 'В магазине Оренбург' : 'In Negozio Orenburg'}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
