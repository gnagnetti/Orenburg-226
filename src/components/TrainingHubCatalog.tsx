import React, { useState, useMemo } from 'react';
import { Search, BookOpen, CheckCircle2 } from 'lucide-react';
import type { Language } from '../types';
import { trainingModelsIndex } from '../data/trainingModelsIndex';
import { ModelPhoto } from './ModelPhoto';
import { storeData } from '../data/storeData';

interface TrainingHubCatalogProps {
  lang: Language;
  onSelectModelByName: (name: string) => void;
}

export const TrainingHubCatalog: React.FC<TrainingHubCatalogProps> = ({
  lang,
  onSelectModelByName
}) => {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Set of model names present in store
  const storeModelNames = useMemo(() => {
    return new Set(storeData.models.map((m) => m.name.toLowerCase()));
  }, []);

  // Filtered models
  const filteredModels = useMemo(() => {
    return trainingModelsIndex.filter((m) => {
      if (selectedLetter && !m.name.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }
      if (!search) return true;
      const q = search.toLowerCase().trim();
      return m.name.toLowerCase().includes(q) || m.id.toString().includes(q);
    });
  }, [search, selectedLetter]);

  // Alphabet letters
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    trainingModelsIndex.forEach((m) => {
      letters.add(m.name.charAt(0).toUpperCase());
    });
    return Array.from(letters).sort();
  }, []);

  const isRu = lang === 'ru';

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <section className="rounded-2xl border border-[#E5DCD0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#9E834D]">
              <BookOpen className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">
                {isRu ? 'Обучающий каталог · Осень-Зима 2026/2027' : 'Retail Training Hub · FW 2026/2027'}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1715]">
              {isRu ? 'Полный каталог коллекции (273 модели)' : 'Catalogo Completo Collezione'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#7D7067] leading-relaxed">
              {isRu
                ? 'Изучите все 273 модели коллекции Luisa Spagnoli Осень-Зима 26/27. Кликните на любую модель, чтобы открыть карточку с описанием, советами по продаже, сочетаниями и ответами на возражения.'
                : 'Esplora tutti i 273 modelli della collezione Luisa Spagnoli Autunno-Inverno 26/27. Clicca su qualsiasi capo per consultare la scheda tecnica, i consigli di vendita, gli abbinamenti e le risposte alle obiezioni.'}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[#E5DCD0] bg-[#FAF7F2] p-4 text-center">
            <div>
              <div className="font-mono text-3xl font-bold text-[#1C1715]">
                {trainingModelsIndex.length}
              </div>
              <div className="font-mono text-[10px] uppercase text-[#7D7067]">
                {isRu ? 'Моделей О-З 26/27' : 'Modelli FW26'}
              </div>
            </div>
            <div className="h-8 w-px bg-[#E5DCD0]" />
            <div>
              <div className="font-mono text-3xl font-bold text-[#2E7D4C]">
                {storeModelNames.size}
              </div>
              <div className="font-mono text-[10px] uppercase text-[#7D7067]">
                {isRu ? 'В магазине Оренбург' : 'In Negozio'}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Alphabet Filter */}
        <div className="mt-6 space-y-3">
          <div className="relative flex items-center rounded-xl border border-[#E5DCD0] bg-[#FAF7F2] px-3.5 focus-within:border-[#1C1715] focus-within:bg-white transition">
            <Search className="h-4 w-4 text-[#7D7067]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRu ? 'Поиск по названию модели или номеру артикула...' : 'Cerca per nome modello o codice articolo...'}
              className="w-full bg-transparent px-3 py-2.5 text-xs text-[#1C1715] outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-[#7D7067] hover:text-[#1C1715]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Letter filter buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                selectedLetter === null
                  ? 'bg-[#1C1715] text-[#FAF7F2]'
                  : 'bg-[#F2ECE3] text-[#5C5047] hover:bg-[#E5DCD0]'
              }`}
            >
              {isRu ? 'ВСЕ' : 'TUTTI'}
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
                className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition ${
                  selectedLetter === letter
                    ? 'bg-[#1C1715] text-[#FAF7F2]'
                    : 'bg-white text-[#5C5047] border border-[#E5DCD0] hover:border-[#1C1715]'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Models */}
      <section className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#7D7067] px-1">
          <span>{isRu ? `Найдено: ${filteredModels.length} моделей` : `Risultati: ${filteredModels.length} modelli`}</span>
          <span className="flex items-center gap-1.5 text-[#2E7D4C]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isRu ? 'Зелёный бейдж = заказано в магазине Оренбург' : "Badge verde = presente nell'ordine negozio"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredModels.map((item) => {
            const isInStore = storeModelNames.has(item.name.toLowerCase());
            return (
              <div
                key={item.id}
                onClick={() => onSelectModelByName(item.name)}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E5DCD0] bg-white p-3 text-left transition cursor-pointer hover:border-[#9E834D] hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-[#FAF7F2]">
                    <ModelPhoto
                      name={item.name}
                      className="h-full w-full"
                      letterClassName="text-2xl"
                    />
                    {isInStore && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-[#2E7D4C] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-xs">
                        {isRu ? 'В магазине' : 'In Negozio'}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-serif text-sm font-bold text-[#1C1715] group-hover:text-[#9E834D] transition line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="font-mono text-[10px] text-[#7D7067]">
                      ID #{item.id}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F2ECE3] flex items-center justify-between font-mono text-[10px] text-[#7D7067]">
                  <span>FW 26/27</span>
                  <span className="text-[#9E834D] font-semibold group-hover:underline">
                    {isRu ? 'Карточка →' : 'Scheda →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
