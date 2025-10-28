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
    <div className="w-full space-y-6 py-8">
      {/* Status Icon & Text */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border-2 border-black/10">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
        </div>
        <h3 className="text-xl font-extralight text-black mb-2">
          {statusText[status]}
        </h3>
        <p className="text-sm text-black/40 font-light">
          {elapsedTime}s elapsed
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs uppercase tracking-wider text-black/30 font-light">
            Progress
          </span>
          <span className="text-sm tabular-nums text-black/60 font-light">
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
      <div className="text-center pt-4">
        <p className="text-xs text-black/30 font-light tracking-wide">
          Estimated: ~{estimatedTotal}s • High quality rendering
        </p>
        {elapsedTime > estimatedTotal && (
          <p className="text-xs text-black/40 font-light mt-2">
            Taking a bit longer than expected...
          </p>
        )}
      </div>
    </div>
  );
}

