import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Crown,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Layers,
  Palette
} from 'lucide-react';
import type { StoreModel, Language, SelloutTier } from '../types';
import { storeData, calculateCategories, getSelloutTier } from '../data/storeData';
import { translations } from '../utils/i18n';
import { ModelThumb } from './ModelPhoto';

interface SelloutDashboardProps {
  lang: Language;
  onSelectModel: (model: StoreModel) => void;
  onOpenTrainingHub: () => void;
}

export const SelloutDashboard: React.FC<SelloutDashboardProps> = ({
  lang,
  onSelectModel,
  onOpenTrainingHub
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cat' | 'matrix' | 'colors'>('cat');
  const [selectedCat, setSelectedCat] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<'all' | 'best' | 'mid' | 'flop'>('all');

  const t = translations[lang];

  // Enrich models with pct
  const enrichedModels: StoreModel[] = useMemo(() => {
    return storeData.models.map((m) => ({
      ...m,
      pct: m.ordered > 0 ? (m.sold / m.ordered) * 100 : 0
    }));
  }, []);

  // Aggregated store metrics
  const totalOrdered = useMemo(() => enrichedModels.reduce((acc, m) => acc + m.ordered, 0), [enrichedModels]);
  const totalSold = useMemo(() => enrichedModels.reduce((acc, m) => acc + m.sold, 0), [enrichedModels]);
  const totalSellout = totalOrdered > 0 ? (totalSold / totalOrdered) * 100 : 0;
  const bestsellers = useMemo(() => enrichedModels.filter((m) => (m.pct || 0) >= 50), [enrichedModels]);
  const underperformers = useMemo(() => enrichedModels.filter((m) => (m.pct || 0) < 25), [enrichedModels]);
  const totalSkus = useMemo(() => enrichedModels.reduce((acc, m) => acc + m.colors.length, 0), [enrichedModels]);

  // Categories stats
  const categoriesStats = useMemo(() => calculateCategories(enrichedModels), [enrichedModels]);
  const topCategory = categoriesStats.find((c) => c.ordered >= 5) || categoriesStats[0];

  // Matrix filtered models
  const matrixFilteredModels = useMemo(() => {
    return enrichedModels
      .filter((m) => {
        const pct = m.pct || 0;
        const tier = getSelloutTier(pct);
        if (tierFilter !== 'all' && tier !== tierFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        const colorsStr = m.colors.map((c) => c.color).join(' ').toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.cat.toLowerCase().includes(q) ||
          (m.catEn && m.catEn.toLowerCase().includes(q)) ||
          m.salesNames.toLowerCase().includes(q) ||
          colorsStr.includes(q)
        );
      })
      .sort((a, b) => (b.pct || 0) - (a.pct || 0) || b.sold - a.sold);
  }, [enrichedModels, tierFilter, searchQuery]);

  // Silhouettes calculation (Tab 3)
  const silhouettes = useMemo(() => {
    const map = new Map<string, { k: string; o: number; s: number; n: number; names: string[] }>();
    for (const m of enrichedModels) {
      const key = m.catEn || m.cat;
      const cur = map.get(key) || { k: key, o: 0, s: 0, n: 0, names: [] };
      cur.o += m.ordered;
      cur.s += m.sold;
      cur.n += 1;
      cur.names.push(m.name);
      map.set(key, cur);
    }
    return Array.from(map.values())
      .map((s) => ({ ...s, pct: s.o > 0 ? (s.s / s.o) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [enrichedModels]);

  // Colors palette calculation (Tab 3)
  const colorFamilies = useMemo(() => {
    const map = new Map<string, { k: string; o: number; n: number; sold: number; names: Set<string> }>();
    for (const m of enrichedModels) {
      for (const c of m.colors) {
        const family = (c.color.split('(')[0] || '').split('_')[0]?.trim() || 'Altro';
        const cur = map.get(family) || { k: family, o: 0, n: 0, sold: 0, names: new Set<string>() };
        cur.o += c.qty;
        cur.n += 1;
        cur.sold += m.ordered > 0 ? (m.sold * c.qty) / m.ordered : 0;
        cur.names.add(m.name);
        map.set(family, cur);
      }
    }
    return Array.from(map.values())
      .map((col) => ({
        ...col,
        pct: col.o > 0 ? (col.sold / col.o) * 100 : 0,
        namesList: Array.from(col.names)
      }))
      .sort((a, b) => b.o - a.o);
  }, [enrichedModels]);

  const numFormat = (n: number) => new Intl.NumberFormat('it-IT').format(Math.round(n));

  return (
    <div className="space-y-8 pb-16">
      
      {/* HERO PANEL */}
      <section className="grid gap-6 rounded-2xl border border-[#E5DCD0] bg-white p-6 sm:p-8 md:grid-cols-[1fr_320px] shadow-xs">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="rounded-md bg-[#1C1715] px-2.5 py-1 font-serif font-bold text-[#FAF7F2]">
              LUISA SPAGNOLI
            </span>
            <span className="text-[#7D7067]">
              {t.season} {storeData.season} · {t.salesPeriod} {storeData.period}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1715] leading-tight">
            {t.heroTitle}
          </h1>

          <p className="max-w-2xl text-sm text-[#5C5047] leading-relaxed">
            {t.heroDescription}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-[#7D7067]">
            <span>{t.ordersJoor}:</span>
            {storeData.pos.map((po) => (
              <span
                key={po}
                className="rounded-md border border-[#E5DCD0] bg-[#FAF7F2] px-2 py-0.5 text-[11px] font-semibold text-[#1C1715]"
              >
                #{po}
              </span>
            ))}
          </div>
        </div>

        {/* Priority card: Reorder / Sellout > 50% */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5DCD0] bg-[#FAF7F2] p-5">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7D7067]">
              <span>{t.priorityTitle}</span>
              <span className="rounded-full border border-[#2E7D4C]/30 bg-[#EEF8F1] px-2 py-0.5 text-[#2E7D4C]">
                {t.priorityBadge}
              </span>
            </div>

            <div className="mt-3 font-mono text-4xl font-bold text-[#2E7D4C]">
              {bestsellers.length}{' '}
              <span className="text-sm font-normal text-[#7D7067]">
                {t.kpiOrderedSub}
              </span>
            </div>

            <p className="mt-2 text-xs text-[#7D7067] leading-relaxed">
              {t.prioritySub}
            </p>
          </div>

          <button
            onClick={() => {
              setActiveSubTab('matrix');
              setTierFilter('best');
            }}
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#1C1715] px-3.5 py-2 font-mono text-xs font-semibold text-[#FAF7F2] transition hover:bg-[#3D332D]"
          >
            <span>{t.openMatrixBtn}</span>
          </button>
        </div>
      </section>

      {/* 6 KPI METRICS STRIP */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Ordered */}
        <div className="rounded-xl border border-[#E5DCD0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7D7067]">
            <span>{t.kpiOrdered}</span>
            <ShoppingBag className="h-4 w-4 text-[#7D7067]" />
          </div>
          <div className="mt-2 truncate font-mono text-2xl font-bold text-[#1C1715]">
            {numFormat(totalOrdered)}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#7D7067]">
            {enrichedModels.length} {t.kpiOrderedSub} ({totalSkus} SKU)
          </div>
        </div>

        {/* Sold */}
        <div className="rounded-xl border border-[#E5DCD0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7D7067]">
            <span>{t.kpiSold}</span>
            <TrendingUp className="h-4 w-4 text-[#7D7067]" />
          </div>
          <div className="mt-2 truncate font-mono text-2xl font-bold text-[#1C1715]">
            {numFormat(totalSold)}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#7D7067]">
            {t.kpiSoldSub}
          </div>
        </div>

        {/* Total Sellout */}
        <div className="rounded-xl border border-[#C29B53]/40 bg-[#FAF7F2] p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#B88E4B]">
            <span>{t.kpiTotalSellout}</span>
            <Percent className="h-4 w-4 text-[#B88E4B]" />
          </div>
          <div className="mt-2 truncate font-mono text-2xl font-bold text-[#B88E4B]">
            {totalSellout.toFixed(1)}%
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#7D7067]">
            {t.kpiTotalSelloutSub}
          </div>
        </div>

        {/* Bestsellers (>50%) */}
        <div className="rounded-xl border border-[#2E7D4C]/30 bg-[#EEF8F1] p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#2E7D4C]">
            <span>{t.kpiBestsellers}</span>
            <CheckCircle2 className="h-4 w-4 text-[#2E7D4C]" />
          </div>
          <div className="mt-2 truncate font-mono text-2xl font-bold text-[#2E7D4C]">
            {bestsellers.length}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#2E7D4C]">
            {t.kpiBestsellersSub}
          </div>
        </div>

        {/* Weak (<25%) */}
        <div className="rounded-xl border border-[#BA3D35]/30 bg-[#FDEEEE] p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#BA3D35]">
            <span>{t.kpiSlow}</span>
            <AlertCircle className="h-4 w-4 text-[#BA3D35]" />
          </div>
          <div className="mt-2 truncate font-mono text-2xl font-bold text-[#BA3D35]">
            {underperformers.length}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#BA3D35]">
            {t.kpiSlowSub}
          </div>
        </div>

        {/* Top Category */}
        <div className="rounded-xl border border-[#E5DCD0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7D7067]">
            <span>{t.kpiTopCategory}</span>
            <Crown className="h-4 w-4 text-[#C29B53]" />
          </div>
          <div className="mt-2 truncate font-serif text-lg font-bold text-[#1C1715]">
            {topCategory?.cat || '—'}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#7D7067]">
            {topCategory?.pct.toFixed(1)}% sell-out
          </div>
        </div>
      </section>

      {/* SUB-TABS NAVIGATION (Categories / Matrix / Colors) */}
      <div className="flex items-center gap-2 border-b border-[#E5DCD0] pb-3">
        {[
          { id: 'cat', label: t.tabCategories, icon: Layers },
          { id: 'matrix', label: `${t.tabMatrix} (${enrichedModels.length})`, icon: Filter },
          { id: 'colors', label: t.tabColors, icon: Palette }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as 'cat' | 'matrix' | 'colors')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#1C1715] text-[#FAF7F2] shadow-xs'
                  : 'text-[#7D7067] hover:bg-[#F2ECE3] hover:text-[#1C1715]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CATEGORY REPORT */}
      {activeSubTab === 'cat' && (
        <section className="space-y-6 rounded-2xl border border-[#E5DCD0] bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#B88E4B]">
                {t.catReportTitle}
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1715]">
                {t.catReportHeading}
              </h2>
              <p className="text-xs text-[#7D7067]">
                {t.catReportSub}
              </p>
            </div>

            <button
              onClick={() => setSelectedCat(undefined)}
              className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition ${
                selectedCat === undefined
                  ? 'bg-[#1C1715] text-[#FAF7F2]'
                  : 'bg-[#F2ECE3] text-[#1C1715] hover:bg-[#E5DCD0]'
              }`}
            >
              {t.allCategoriesBtn} ({enrichedModels.length}) · {numFormat(totalSold)} / {numFormat(totalOrdered)} {t.pcs} · {totalSellout.toFixed(1)}%
            </button>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categoriesStats.map((c, idx) => {
              const isSelected = selectedCat === c.cat;
              const tier = getSelloutTier(c.pct);
              return (
                <button
                  key={c.cat}
                  onClick={() => setSelectedCat(isSelected ? undefined : c.cat)}
                  className={`space-y-2 rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-[#1C1715] bg-[#FAF7F2] ring-2 ring-[#B88E4B]'
                      : 'border-[#E5DCD0] bg-white hover:border-[#B88E4B] hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#7D7067]">
                    <span>#{String(idx + 1).padStart(2, '0')}</span>
                    <span className={`rounded-full px-1.5 py-0.2 font-semibold ${
                      tier === 'best' ? 'bg-[#EEF8F1] text-[#2E7D4C]' :
                      tier === 'flop' ? 'bg-[#FDEEEE] text-[#BA3D35]' : 'bg-[#FAF7F2] text-[#B88E4B]'
                    }`}>
                      {c.pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="font-serif text-base font-bold text-[#1C1715] truncate">
                    {c.cat}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2ECE3]">
                    <div
                      className={`h-full ${
                        tier === 'best' ? 'bg-[#2E7D4C]' :
                        tier === 'flop' ? 'bg-[#BA3D35]' : 'bg-[#B88E4B]'
                      }`}
                      style={{ width: `${Math.min(100, c.pct)}%` }}
                    />
                  </div>

                  <div className="font-mono text-[10px] text-[#7D7067]">
                    {c.models} {t.modelsCount} · {c.sold}/{c.ordered} {t.pcs} · {t.stockRemaining} {Math.max(0, c.ordered - c.sold)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filtered Models Table for selected category */}
          <div className="pt-4">
            <h3 className="font-serif text-lg font-bold text-[#1C1715] mb-3">
              {selectedCat
                ? `${selectedCat} (${enrichedModels.filter(m => m.cat === selectedCat).length} ${t.modelsCount})`
                : (lang === 'ru' ? 'Все модели по категориям' : 'Tutti i modelli per categoria')}
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-[#E5DCD0]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2ECE3] font-mono text-[10px] uppercase tracking-wider text-[#7D7067]">
                  <tr>
                    <th className="px-3 py-2.5">{t.colPhoto}</th>
                    <th className="px-3 py-2.5">{t.colModel}</th>
                    <th className="px-3 py-2.5">{t.colCategory}</th>
                    <th className="px-3 py-2.5">{t.colColors}</th>
                    <th className="px-3 py-2.5">{t.colOrdered}</th>
                    <th className="px-3 py-2.5">{t.colSold}</th>
                    <th className="px-3 py-2.5">{t.colStock}</th>
                    <th className="px-3 py-2.5">{t.colSellout}</th>
                    <th className="px-3 py-2.5">{t.colStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCD0] bg-white">
                  {enrichedModels
                    .filter((m) => !selectedCat || m.cat === selectedCat)
                    .sort((a, b) => (b.pct || 0) - (a.pct || 0) || b.sold - a.sold)
                    .map((m) => {
                      const tier = getSelloutTier(m.pct || 0);
                      return (
                        <tr key={m.id} className="transition hover:bg-[#FAF7F2]">
                          <td className="px-3 py-2">
                            <ModelThumb model={m} onSelect={onSelectModel} />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => onSelectModel(m)}
                              className="font-serif text-sm font-bold text-[#1C1715] hover:text-[#B88E4B] hover:underline text-left block"
                            >
                              {m.name}
                            </button>
                            <span className="font-mono text-[10px] text-[#7D7067]">
                              Art. {m.id} · {m.salesNames}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-[#5C5047]">
                            {m.cat}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {m.colors.length}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs font-medium">
                            {m.ordered}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs font-bold text-[#2E7D4C]">
                            {m.sold}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-[#7D7067]">
                            {Math.max(0, m.ordered - m.sold)}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            <span className={`inline-block rounded-full px-2 py-0.5 font-bold ${
                              tier === 'best' ? 'bg-[#EEF8F1] text-[#2E7D4C]' :
                              tier === 'flop' ? 'bg-[#FDEEEE] text-[#BA3D35]' : 'bg-[#FAF7F2] text-[#B88E4B]'
                            }`}>
                              {m.pct?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px]">
                            <span className={`rounded-full px-2 py-0.5 font-semibold ${
                              m.status === 'OK'
                                ? 'bg-[#EEF8F1] text-[#2E7D4C]'
                                : 'bg-[#F2ECE3] text-[#7D7067]'
                            }`}>
                              {m.status === 'OK' ? t.statusOk : t.statusOrderedNotSold}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: MODELS MATRIX & SEARCH */}
      {activeSubTab === 'matrix' && (
        <section className="space-y-4 rounded-2xl border border-[#E5DCD0] bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C1715]">
              {t.matrixTitle}
            </h2>
            <div className="font-mono text-xs text-[#7D7067]">
              {matrixFilteredModels.length} {t.modelsCount}
            </div>
          </div>

          {/* Search bar & Filter pills */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex flex-1 items-center rounded-lg border border-[#E5DCD0] bg-[#FAF7F2] px-3 focus-within:border-[#1C1715] focus-within:bg-white transition">
              <Search className="h-4 w-4 text-[#7D7067]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent px-2.5 py-2 text-xs outline-none text-[#1C1715]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#7D7067] hover:text-[#1C1715]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'best', label: t.filterBest },
                { id: 'mid', label: t.filterMid },
                { id: 'flop', label: t.filterSlow }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setTierFilter(pill.id as any)}
                  className={`rounded-lg px-3 py-2 font-mono text-xs font-semibold transition ${
                    tierFilter === pill.id
                      ? 'bg-[#1C1715] text-[#FAF7F2]'
                      : 'bg-[#F2ECE3] text-[#5C5047] hover:bg-[#E5DCD0]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5DCD0]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2ECE3] font-mono text-[10px] uppercase tracking-wider text-[#7D7067]">
                <tr>
                  <th className="px-3 py-2.5">{t.colPhoto}</th>
                  <th className="px-3 py-2.5">{t.colModel}</th>
                  <th className="px-3 py-2.5">{t.colCategory}</th>
                  <th className="px-3 py-2.5">{t.colColors}</th>
                  <th className="px-3 py-2.5">{t.colOrdered}</th>
                  <th className="px-3 py-2.5">{t.colSold}</th>
                  <th className="px-3 py-2.5">{t.colStock}</th>
                  <th className="px-3 py-2.5">{t.colSellout}</th>
                  <th className="px-3 py-2.5">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD0] bg-white">
                {matrixFilteredModels.map((m) => {
                  const tier = getSelloutTier(m.pct || 0);
                  return (
                    <tr key={m.id} className="transition hover:bg-[#FAF7F2]">
                      <td className="px-3 py-2">
                        <ModelThumb model={m} onSelect={onSelectModel} />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => onSelectModel(m)}
                          className="font-serif text-sm font-bold text-[#1C1715] hover:text-[#B88E4B] hover:underline text-left block"
                        >
                          {m.name}
                        </button>
                        <span className="font-mono text-[10px] text-[#7D7067]">
                          Art. {m.id} · {m.salesNames}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-[#5C5047]">
                        {m.cat}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {m.colors.length}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-medium">
                        {m.ordered}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-bold text-[#2E7D4C]">
                        {m.sold}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-[#7D7067]">
                        {Math.max(0, m.ordered - m.sold)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        <span className={`inline-block rounded-full px-2 py-0.5 font-bold ${
                          tier === 'best' ? 'bg-[#EEF8F1] text-[#2E7D4C]' :
                          tier === 'flop' ? 'bg-[#FDEEEE] text-[#BA3D35]' : 'bg-[#FAF7F2] text-[#B88E4B]'
                        }`}>
                          {m.pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px]">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${
                          m.status === 'OK'
                            ? 'bg-[#EEF8F1] text-[#2E7D4C]'
                            : 'bg-[#F2ECE3] text-[#7D7067]'
                        }`}>
                          {m.status === 'OK' ? t.statusOk : t.statusOrderedNotSold}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: COLORS & SILHOUETTES */}
      {activeSubTab === 'colors' && (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Silhouettes */}
          <div className="space-y-4 rounded-2xl border border-[#E5DCD0] bg-white p-6 shadow-xs">
            <h2 className="font-serif text-2xl font-bold text-[#1C1715]">
              {t.silhouettesTitle}
            </h2>

            <div className="space-y-4">
              {silhouettes.map((s) => (
                <div key={s.k} className="space-y-1.5 border-b border-[#F2ECE3] pb-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div>
                      <span className="font-serif text-sm text-[#1C1715]">{s.k}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#7D7067]">
                        · {s.n} {t.modelsCount} · {numFormat(s.s)}/{numFormat(s.o)} {t.pcs}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#B88E4B]">
                      {s.pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2ECE3]">
                    <div
                      className="h-full bg-[#B88E4B]"
                      style={{ width: `${Math.min(100, s.pct)}%` }}
                    />
                  </div>

                  {/* Clickable model names */}
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#7D7067]">
                    {s.names.map((name) => {
                      const m = enrichedModels.find((mod) => mod.name === name);
                      return (
                        <button
                          key={name}
                          onClick={() => m && onSelectModel(m)}
                          className="font-serif hover:text-[#B88E4B] hover:underline"
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-4 rounded-2xl border border-[#E5DCD0] bg-white p-6 shadow-xs">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1715]">
                {t.colorsPaletteTitle}
              </h2>
              <p className="mt-1 text-xs text-[#7D7067]">
                {t.colorsPaletteNotice}
              </p>
            </div>

            <div className="space-y-4">
              {colorFamilies.map((col) => (
                <div key={col.k} className="space-y-1.5 border-b border-[#F2ECE3] pb-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div>
                      <span className="font-serif text-sm text-[#1C1715]">{col.k}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#7D7067]">
                        · {col.n} sku · {numFormat(col.o)} {t.pcs} {lang === 'ru' ? 'зак.' : 'ord.'} (~{numFormat(col.sold)} {lang === 'ru' ? 'прод.' : 'vend.'})
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#2E7D4C]">
                      {col.pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2ECE3]">
                    <div
                      className="h-full bg-[#2E7D4C]"
                      style={{ width: `${Math.min(100, col.pct)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#7D7067]">
                    {col.namesList.map((name) => {
                      const m = enrichedModels.find((mod) => mod.name === name);
                      return (
                        <button
                          key={name}
                          onClick={() => m && onSelectModel(m)}
                          className="font-serif hover:text-[#B88E4B] hover:underline"
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
