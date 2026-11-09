import React, { useState } from 'react';
import { imagesMap } from '../data/imagesMap';
import type { StoreModel } from '../types';

interface ModelPhotoProps {
  name: string;
  className?: string;
  letterClassName?: string;
  src?: string;
  alt?: string;
  onClick?: () => void;
}

export function getModelImageUrl(name: string): string | undefined {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, variants] of Object.entries(imagesMap)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) {
      return variants[0]?.[2];
    }
  }
  for (const [key, variants] of Object.entries(imagesMap)) {
    const kNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kNorm.includes(norm) || norm.includes(kNorm)) {
      return variants[0]?.[2];
    }
  }
  return undefined;
}

export function getModelAllImages(name: string): Array<{ code: string; url: string }> {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, variants] of Object.entries(imagesMap)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) {
      return variants.map(v => ({
        code: `${v[0]} ${v[1]}`,
        url: v[2]
      }));
    }
  }
  return [];
}

export const ModelPhoto: React.FC<ModelPhotoProps> = ({
  name,
  className = 'h-full w-full',
  letterClassName = 'text-xl',
  src,
  alt,
  onClick
}) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = src || getModelImageUrl(name);

  if (!imageSrc || hasError) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center bg-[#F2ECE3] font-serif font-bold text-[#7D7067] ${letterClassName} ${className}`}
        aria-label={alt || name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || name}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      onClick={onClick}
      className={`bg-[#FAF7F2] object-contain transition-transform duration-300 hover:scale-105 ${className}`}
    />
  );
};

interface ModelThumbProps {
  model: StoreModel;
  onSelect: (model: StoreModel) => void;
}

export const ModelThumb: React.FC<ModelThumbProps> = ({ model, onSelect }) => {
  const allImages = getModelAllImages(model.name);
  const mainImg = allImages[0]?.url || getModelImageUrl(model.name);
  const extraColors = Math.max(0, model.colors.length - 1);

  return (
    <div
      onClick={() => onSelect(model)}
      className="group relative block h-[72px] w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[#E5DCD0] bg-[#FAF7F2] transition hover:border-[#C29B53] hover:shadow-xs"
      title={`Clicca per aprire la scheda tecnica di ${model.name}`}
    >
      <ModelPhoto
        name={model.name}
        src={mainImg}
        className="h-full w-full"
        letterClassName="text-sm"
      />
      {extraColors > 0 && (
        <span
          className="absolute right-0.5 bottom-0.5 rounded-full bg-[#1C1715] px-1 font-mono text-[9px] font-semibold text-[#FAF7F2] opacity-90 group-hover:bg-[#C29B53]"
          title={`${extraColors} varianti colore`}
        >
          +{extraColors}
        </span>
      )}
    </div>
  );
};
