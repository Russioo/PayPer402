'use client';

import { ModelInfo } from '@/types';

interface ModelCardProps {
  model: ModelInfo;
  selected: boolean;
  onSelect: (modelId: string) => void;
}

export default function ModelCard({ model, selected, onSelect }: ModelCardProps) {
  return (
    <button
      onClick={() => onSelect(model.id)}
      className={`
        w-full text-left p-6 transition-all duration-300 min-h-[160px] flex flex-col
        ${selected 
          ? 'bg-black text-white' 
          : 'bg-white border border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`text-[10px] uppercase tracking-[0.15em] font-medium ${selected ? 'text-white/40' : 'text-black/35'}`}>
          {model.provider}
        </div>
        <div className="text-right">
          <div className="text-sm font-mono tabular-nums">${model.price.toFixed(3)}</div>
          <div className={`text-[9px] uppercase tracking-wider ${selected ? 'text-white/30' : 'text-black/30'}`}>
            per {model.type === 'image' ? 'picture' : 'video'}
          </div>
        </div>
      </div>
      <div className="font-medium text-base mb-3">{model.name}</div>
      <p className={`text-sm leading-relaxed flex-grow ${selected ? 'text-white/75' : 'text-black/65'}`}>
        {model.description}
      </p>
    </button>
  );
}
