export type Language = 'it' | 'ru' | 'en';

export interface ModelColorVariant {
  color: string;
  code: string;
  qty: number;
  imageUrl?: string;
}

export interface StoreModel {
  id: string;
  name: string;
  cat: string;
  catEn: string;
  po: string;
  ordered: number;
  sold: number;
  status: string;
  salesNames: string;
  colors: ModelColorVariant[];
  pct?: number;
}

export interface StoreData {
  store: string;
  client: string;
  period: string;
  season: string;
  pos: string[];
  models: StoreModel[];
}

export interface CategoryStat {
  cat: string;
  catEn?: string;
  models: number;
  ordered: number;
  sold: number;
  pct: number;
}

export interface TrainingColor {
  name: string;
  code: string;
  imageUrl?: string;
}

export interface LookItem {
  name: string;
  code: string;
  imageUrl?: string;
  modelId?: number | string;
}

export interface LookGroup {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  items: LookItem[];
}

export interface ObjectionItem {
  q: string;
  a: string;
}

export interface TrainingModel {
  id: number | string;
  name: string;
  description: Record<string, string> | string;
  colors: TrainingColor[];
  looks: LookGroup[];
  advice: Record<string, string[]> | string[];
  objections: Record<string, ObjectionItem[]> | ObjectionItem[];
  category?: string;
}

export type SelloutTier = 'best' | 'mid' | 'flop';

export interface LightboxImage {
  src: string;
  caption: string;
  code?: string;
}
