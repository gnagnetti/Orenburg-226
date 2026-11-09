import type { TrainingModel, ObjectionItem } from '../types';

/**
 * Service to parse and hydrate models from the attached CSV:
 * /assets/aistudio/226FWCollectionMultilingua_335ce9da.csv
 * with the intact Russian translations from trainingModels.json.
 */

let modelsById: Record<string, TrainingModel> = {};
let modelsByName: Record<string, TrainingModel> = {};
let initialized = false;

function getRecordField(field: string | Record<string, string> | undefined, key: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[key] || '';
}

function getArrayField(field: string[] | Record<string, string[]> | undefined, key: string): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return field[key] || [];
}

function getObjectionsField(field: ObjectionItem[] | Record<string, ObjectionItem[]> | undefined, key: string): ObjectionItem[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return field[key] || [];
}

export async function initCsvModels(): Promise<{
  byId: Record<string, TrainingModel>;
  byName: Record<string, TrainingModel>;
}> {
  if (initialized) {
    return { byId: modelsById, byName: modelsByName };
  }

  try {
    // 1. Fetch trainingModels.json which holds intact Russian, Italian, English data
    const jsonRes = await fetch('/data/trainingModels.json');
    const jsonDict: Record<string, TrainingModel> = jsonRes.ok ? await jsonRes.json() : {};

    // 2. Fetch the attached CSV
    const csvRes = await fetch('/assets/aistudio/226FWCollectionMultilingua_335ce9da.csv');
    let csvText = '';
    if (csvRes.ok) {
      csvText = await csvRes.text();
    }

    // 3. Parse CSV rows
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    // Header is: ID \t Nome Modello \t Descrizione \t Colori \t Styling / Abbinamenti \t Styling / Abbinamenti Eng \t Consigli di Vendita \t Gestione Obiezioni
    const csvRecords: Record<string, Record<string, string>> = {};
    if (lines.length > 1) {
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length >= 2) {
          const id = cols[0].trim();
          csvRecords[id] = {
            id: cols[0]?.trim() || '',
            name: cols[1]?.trim() || '',
            desc: cols[2]?.trim() || '',
            colors: cols[3]?.trim() || '',
            styling: cols[4]?.trim() || '',
            stylingEng: cols[5]?.trim() || '',
            advice: cols[6]?.trim() || '',
            objections: cols[7]?.trim() || ''
          };
        }
      }
    }

    // 4. Merge CSV + JSON dictionary
    const allIds = Array.from(new Set([...Object.keys(jsonDict), ...Object.keys(csvRecords)]));

    for (const id of allIds) {
      const fromJson = jsonDict[id];
      const fromCsv = csvRecords[id];

      const name = fromCsv?.name || fromJson?.name || `Model ${id}`;

      // Parse colors from CSV if present
      let colors = fromJson?.colors || [];
      if (fromCsv?.colors && fromCsv.colors.includes('http')) {
        const colorEntries = fromCsv.colors.split('|').map(s => s.trim()).filter(Boolean);
        const parsedColors = colorEntries.map(entry => {
          // Format: "Blu Inchiostro (2544): https://..."
          const match = entry.match(/^([^(]+)(?:\(([^)]+)\))?:\s*(https?:\/\/[^\s]+)/);
          if (match) {
            return {
              name: match[1].trim(),
              code: match[2]?.trim() || '',
              imageUrl: match[3].trim()
            };
          }
          return null;
        }).filter(Boolean) as { name: string; code: string; imageUrl: string }[];

        if (parsedColors.length > 0) {
          colors = parsedColors;
        }
      }

      // If description has ??? from the CSV encoding, prefer the intact Russian from JSON
      let descriptionRu = getRecordField(fromJson?.description, 'ru');
      if (!descriptionRu && fromCsv?.desc && !fromCsv.desc.includes('???')) {
        descriptionRu = fromCsv.desc;
      }

      const adviceRu = getArrayField(fromJson?.advice, 'ru');
      const objectionsRu = getObjectionsField(fromJson?.objections, 'ru');

      // Combine into unified model
      const model: TrainingModel = {
        id: isNaN(Number(id)) ? id : Number(id),
        name,
        category: fromJson?.category || 'Ready-to-Wear',
        description: {
          ru: descriptionRu || getRecordField(fromJson?.description, 'ru') || getRecordField(fromJson?.description, 'it') || '',
          it: getRecordField(fromJson?.description, 'it') || '',
          en: getRecordField(fromJson?.description, 'en') || ''
        },
        colors,
        looks: fromJson?.looks || [],
        advice: {
          ru: adviceRu.length > 0 ? adviceRu : getArrayField(fromJson?.advice, 'it'),
          it: getArrayField(fromJson?.advice, 'it'),
          en: getArrayField(fromJson?.advice, 'en')
        },
        objections: {
          ru: objectionsRu.length > 0 ? objectionsRu : getObjectionsField(fromJson?.objections, 'it'),
          it: getObjectionsField(fromJson?.objections, 'it'),
          en: getObjectionsField(fromJson?.objections, 'en')
        }
      };

      modelsById[String(id)] = model;
      modelsByName[name.toLowerCase().trim()] = model;
    }

    initialized = true;
    return { byId: modelsById, byName: modelsByName };
  } catch (err) {
    console.error('Error initializing CSV models:', err);
    return { byId: modelsById, byName: modelsByName };
  }
}

export function getModelById(id: string | number): TrainingModel | undefined {
  return modelsById[String(id)];
}

export function getModelByName(name: string): TrainingModel | undefined {
  const norm = name.toLowerCase().trim();
  if (modelsByName[norm]) return modelsByName[norm];
  
  // Try clean suffix (e.g. "Caprese B" -> "Caprese")
  const base = norm.replace(/\s+[a-z]$/i, '').trim();
  if (modelsByName[base]) return modelsByName[base];

  return undefined;
}
