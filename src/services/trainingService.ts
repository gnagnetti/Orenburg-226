import type { TrainingModel, StoreModel } from '../types';
import { imagesMap } from '../data/imagesMap';

let cachedModels: Record<string, TrainingModel> | null = null;
let loadingPromise: Promise<Record<string, TrainingModel>> | null = null;

export async function loadTrainingModels(): Promise<Record<string, TrainingModel>> {
  if (cachedModels) return cachedModels;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const res = await fetch('/data/trainingModels.json');
      if (!res.ok) throw new Error('Failed to load training models');
      const data = await res.json();
      cachedModels = data;
      return data;
    } catch (err) {
      console.warn('Could not load training models bundle:', err);
      return {};
    }
  })();

  return loadingPromise;
}

export function findJoorImages(name: string): string[] {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, variants] of Object.entries(imagesMap)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) {
      return variants.map(v => v[2]);
    }
  }
  // Try partial match
  for (const [key, variants] of Object.entries(imagesMap)) {
    const kNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kNorm.includes(norm) || norm.includes(kNorm)) {
      return variants.map(v => v[2]);
    }
  }
  return [];
}

export function findJoorColorVariants(name: string): { code: string; color: string; url: string }[] {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, variants] of Object.entries(imagesMap)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) {
      return variants.map(v => ({
        code: `${v[0]} ${v[1]}`,
        color: `Colore ${v[0]}/${v[1]}`,
        url: v[2]
      }));
    }
  }
  return [];
}

/**
 * Creates a synthetic TrainingModel for store items that don't have an exact training sheet
 */
export function createSyntheticTrainingModel(storeModel: StoreModel): TrainingModel {
  const joorImgs = findJoorImages(storeModel.name);
  const colors = storeModel.colors.map((c, idx) => ({
    name: c.color,
    code: c.code,
    imageUrl: joorImgs[idx] || (joorImgs.length > 0 ? joorImgs[0] : undefined)
  }));

  return {
    id: storeModel.id,
    name: storeModel.name,
    category: storeModel.catEn || storeModel.cat,
    description: {
      it: `Capo della collezione Luisa Spagnoli Autunno-Inverno 2026/2027. Raffinata interpretazione della categoria ${storeModel.catEn || storeModel.cat}, realizzata con finiture di alto pregio sartoriale italiano. Il capo offre un taglio impeccabile studiato per garantire eleganza formale e massimo comfort quotidiano.`,
      ru: `Модель из коллекции Luisa Spagnoli Осень-Зима 2026/2027. Изысканное воплощение стиля в категории ${storeModel.cat}. Безупречный крой и внимание к каждой детали итальянского портновского искусства.`,
      en: `Luisa Spagnoli Fall/Winter 2026/2027 collection piece. Sophisticated garment in the ${storeModel.catEn || storeModel.cat} category, crafted with exquisite Italian tailoring traditions.`
    },
    colors,
    looks: [
      {
        title: {
          it: 'Total Look Luisa Spagnoli FW26',
          ru: 'Образ Luisa Spagnoli О-З 26/27',
          en: 'Luisa Spagnoli FW26 Styling'
        },
        description: {
          it: 'Abbinamento suggerito con capi iconici della stagione per un look sofisticato ed equilibrato.',
          ru: 'Рекомендованная комбинация для создания цельного и элегантного образа.',
          en: 'Suggested styling with key collection pieces for a balanced silhouette.'
        },
        items: []
      }
    ],
    advice: {
      it: [
        'Presentare alla cliente evidenziando la nobiltà del tessuto e la versatilità negli abbinamenti day-to-evening.',
        'Sottolineare la qualità del taglio sartoriale italiano e la durabilità nel tempo.',
        'Suggerire la prova con accessori ton-sur-ton o a contrasto della linea pelletteria LS1928.'
      ],
      ru: [
        'Подчеркивать благородство фактуры ткани и легкую адаптацию модели от дневного к вечернему выходу.',
        'Обращать внимание клиентки на фирменную посадку и безупречные итальянские лекала.',
        'Предлагать дополнить образ акцентными аксессуарами из коллекции сумок Luisa Spagnoli.'
      ],
      en: [
        'Present highlighting the premium texture and seamless day-to-evening versatility.',
        'Emphasize the signature Italian tailoring and enduring quality.',
        'Suggest pairing with tonal or contrast accessories from the LS1928 leather goods line.'
      ]
    },
    objections: {
      it: [
        {
          q: 'La vestibilità è adatta alla mia silhouette?',
          a: 'I cartamodelli Luisa Spagnoli sono studiati appositamente per valorizzare la figura femminile offrendo comfort assoluto e caduta perfetta.'
        },
        {
          q: 'Come prendersi cura di questo capo?',
          a: 'Consigliamo il lavaggio a secco professionale per preservare intatta la morbidezza e la struttura del tessuto nel tempo.'
        }
      ],
      ru: [
        {
          q: 'Подойдет ли этот силуэт для моей фигуры?',
          a: 'Лекала Luisa Spagnoli славятся идеальной посадкой, подчеркивающей достоинства и обеспечивающей полную свободу движений.'
        },
        {
          q: 'Как правильно ухаживать за изделием?',
          a: 'Рекомендуется деликатная сухая чистка для сохранения первозданной структуры волокон и насыщенности цвета.'
        }
      ],
      en: [
        {
          q: 'Will this fit suit my silhouette?',
          a: 'Luisa Spagnoli patterns are precision-engineered to flatter the feminine figure while ensuring comfort and effortless grace.'
        },
        {
          q: 'How should this piece be cared for?',
          a: 'We recommend gentle dry cleaning to protect the fiber structure and maintain lasting elegance.'
        }
      ]
    }
  };
}
