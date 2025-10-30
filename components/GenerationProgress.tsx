'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  status: 'pending' | 'processing' | 'completed';
  elapsedTime: number; // in seconds
  estimatedTotal?: number; // in seconds
  type?: 'image' | 'video';
}

export default function GenerationProgress({
  status,
  elapsedTime,
  estimatedTotal = 150,
  type = 'video',
}: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'completed') {
      setProgress(100);
    } else {
      // Calculate progress based on elapsed time, cap at 98% until confirmed complete
      const calculated = Math.min((elapsedTime / estimatedTotal) * 100, 98);
      setProgress(calculated);
    }
  }, [elapsedTime, estimatedTotal, status]);

  const statusText = {
    pending: 'Initializing generation...',
    processing: type === 'image' ? 'Creating your image...' : 'Creating your video...',
    completed: 'Complete!',
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 md:space-y-6 py-6 sm:py-7 md:py-8 px-2">
      {/* Status Icon & Text */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 md:mb-6 border-2 border-black/10">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black animate-spin" />
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-extralight text-black mb-1.5 sm:mb-2 px-4">
          {statusText[status]}
        </h3>
        <p className="text-xs sm:text-sm text-black/40 font-light">
          {elapsedTime}s elapsed
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-black/30 font-light">
            Progress
          </span>
          <span className="text-xs sm:text-sm tabular-nums text-black/60 font-light">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="h-1 bg-black/5 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Estimated Time */}
      <div className="text-center pt-3 sm:pt-4 px-4">
        <p className="text-[10px] sm:text-xs text-black/30 font-light tracking-wide">
          Estimated: ~{estimatedTotal}s • High quality rendering
        </p>
        {elapsedTime > estimatedTotal && (
          <p className="text-[10px] sm:text-xs text-black/40 font-light mt-1.5 sm:mt-2">
            Taking a bit longer than expected...
          </p>
        )}
      </div>
    </div>
  );
}

