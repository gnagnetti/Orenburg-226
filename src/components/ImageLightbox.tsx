import React from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { LightboxImage } from '../types';

interface ImageLightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#FAF7F2] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1715]/80 text-white backdrop-blur-xs transition hover:bg-[#1C1715]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-xl bg-white p-2">
          <img
            src={image.src}
            alt={image.caption}
            className="max-h-[75vh] w-auto object-contain"
          />
        </div>

        <div className="mt-3 flex items-center justify-between px-2">
          <div>
            <h4 className="font-serif text-lg font-bold text-[#1C1715]">
              {image.caption}
            </h4>
            {image.code && (
              <p className="font-mono text-xs text-[#7D7067]">
                Codice colore: {image.code}
              </p>
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#C29B53]">
            Luisa Spagnoli FW 26/27
          </span>
        </div>
      </div>
    </div>
  );
};
